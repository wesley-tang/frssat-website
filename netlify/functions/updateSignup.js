import { client, getActiveConfig } from "../lib/configHelper";
import { trimSubjects, trimPrefs } from "../lib/dataHelpers";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { signupUuid, eventId, isInitialized, username, userId, ...formData } = JSON.parse(event.body);

        if (!signupUuid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing signupUuid" }),
            };
        }

        // Check if signups are closed
        const { activeEvent } = await getActiveConfig();
        if (activeEvent.status === 'signups_closed') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Signups are closed. Updates are no longer accepted." }),
            };
        }

        await client.connect();
        const database = client.db();
        const collection = database.collection("signups");

        // 1. Check if verified
        const existingSignup = await collection.findOne({ _id: signupUuid });

        if (!existingSignup) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Signup not found" }),
            };
        }

        if (!existingSignup.verified) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Signup is not verified. Please verify your forum post first." }),
            };
        }

        // 2. Trim Data
        const trimmedSubjects = trimSubjects(formData.subjects);
        // Only trim prefs if they exist in the update payload
        const trimmedPrefs = formData.prefsByTier ? trimPrefs(formData.prefsByTier) : undefined;

        const updateData = {
            ...formData,
            subjects: trimmedSubjects,
            eventId, // Ensure eventId is updated/set
            updatedAt: new Date()
        };

        if (trimmedPrefs) {
            updateData.prefsByTier = trimmedPrefs;
        }

        // 3. Update
        await collection.updateOne(
            { _id: signupUuid },
            {
                $set: updateData
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Signup updated successfully" }),
        };

    } catch (error) {
        console.error("Error updating signup:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
}
