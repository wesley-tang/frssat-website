import { client } from "../lib/configHelper";
import { getActiveConfig } from "../lib/configHelper";

export async function handler(event) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    // 1. Parse Body/Path
    let body = {};
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
        // ignore JSON parse error for empty body
    }

    const path = event.path.replace("/api/admin", ""); // Adjust based on actual routing if needed, or use query params

    // 2. Authentication Check (Simple Password)
    // For login, we check the body. For other requests, we expect an "auth" header or body param.
    // Since we want to keep it simple, let's just expect 'adminKey' in the body for all POSTs for now,
    // or a header 'x-admin-key'.
    const adminKey = body.adminKey || event.headers["x-admin-key"];

    // Allow login check without full auth logic if it's just checking validity
    if (path === "/login" && event.httpMethod === "POST") {
        if (adminKey === process.env.ADMIN_PASSWORD) {
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        } else {
            return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid Password" }) };
        }
    }

    // For all other routes, enforce auth
    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    try {
        await client.connect();
        const database = client.db();

        // --- GET DATA ---
        if (path === "/data" && event.httpMethod === "GET") {
            const signupsCollection = database.collection("signups");
            const eventsCollection = database.collection("events");

            // Get all signups (maybe filter by current event?)
            // We need the current event ID first.
            const { activeEvent } = await getActiveConfig();

            const signups = await signupsCollection.find({ eventId: activeEvent._id }).toArray();

            // Refresh active event to get latest status
            const currentEvent = await eventsCollection.findOne({ _id: activeEvent._id });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    signups,
                    activeEvent: currentEvent
                })
            };
        }

        // --- UPDATE EVENT ---
        if (path === "/event/update" && event.httpMethod === "POST") {
            const updates = body;
            const { activeEvent } = await getActiveConfig();
            const eventsCollection = database.collection("events");

            if (!updates || Object.keys(updates).length === 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing updates" }) };
            }

            // Prevent updating _id
            delete updates._id;

            await eventsCollection.updateOne(
                { _id: activeEvent._id },
                { $set: updates }
            );

            // Fetch updated event to return
            const updatedEvent = await eventsCollection.findOne({ _id: activeEvent._id });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Event updated", activeEvent: updatedEvent })
            };
        }

        // --- MATCHING (Placeholder) ---
        if (path === "/match/dry-run" && event.httpMethod === "POST") {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Dry run not implemented yet", matches: [] })
            };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: "Not Found" }) };

    } catch (error) {
        console.error("Admin Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
}
