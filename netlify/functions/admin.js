import { client } from "../lib/configHelper";
import { getActiveConfig, invalidateConfigCache } from "../lib/configHelper";
import { generateDirectory } from "../lib/directory";
import { scanForumForUuid } from "../lib/forumVerification";

const ALLOWED_STATUS_TRANSITIONS = {
    setup: ["signups_open"],
    signups_open: ["signups_closed"],
    signups_closed: ["concluded"],
    concluded: []
};

const hasThreadUrls = (eventDoc) => Boolean(eventDoc?.mainThreadUrl && eventDoc?.signupThreadUrl);

const getEventYear = (eventDoc) => {
    const explicitYear = Number(eventDoc?.year);
    if (Number.isFinite(explicitYear) && explicitYear > 0) return explicitYear;

    const deadline = new Date(eventDoc?.signUpDeadLine);
    if (!Number.isNaN(deadline.getTime())) return deadline.getFullYear();

    return new Date().getFullYear();
};

const shiftDateOneYear = (value) => {
    if (!value) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
};

const buildDefaultTitle = (eventDoc, previousYear, newYear) => {
    const title = eventDoc?.title || `FRSSAT ${previousYear}`;
    const yearText = String(previousYear);

    if (title.includes(yearText)) {
        return title.replace(yearText, String(newYear));
    }

    return `${title} ${newYear}`;
};


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

        const eventsCollection = database.collection("events");
        const requestedEventId = event.queryStringParameters?.eventId;

        // Resolve the event this request targets. Admin pages pass an explicit
        // eventId; when omitted we fall back to the globally active event.
        let targetEvent;
        if (requestedEventId) {
            targetEvent = await eventsCollection.findOne({ _id: requestedEventId });
            if (!targetEvent) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: "Event not found" }) };
            }
        } else {
            const { activeEvent } = await getActiveConfig();
            targetEvent = activeEvent;
        }

        // --- CREATE EVENT ---
        // A new event can only be created once the globally active event is concluded.
        if (path === "/event/create" && event.httpMethod === "POST") {
            const { activeEvent: currentEvent } = await getActiveConfig(true);

            if (!currentEvent || currentEvent.status !== "concluded") {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "The current event must be concluded before a new event can be created." })
                };
            }

            const previousYear = getEventYear(currentEvent);
            const newYear = previousYear + 1;
            const newEventId = `frssat_${newYear}`;

            const existingEvent = await eventsCollection.findOne({ _id: newEventId });
            if (existingEvent) {
                return {
                    statusCode: 409,
                    headers,
                    body: JSON.stringify({ error: `An event with ID "${newEventId}" already exists.` })
                };
            }

            const { _id: _previousId, ...previousFields } = currentEvent;
            const newEvent = {
                ...previousFields,
                _id: newEventId,
                title: buildDefaultTitle(currentEvent, previousYear, newYear),
                year: newYear,
                status: "setup",
                mainThreadUrl: "",
                signupThreadUrl: "",
                signUpDeadLine: shiftDateOneYear(currentEvent.signUpDeadLine),
                endDate: shiftDateOneYear(currentEvent.endDate),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await eventsCollection.insertOne(newEvent);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: "Setup event created", event: newEvent })
            };
        }

        // --- ACTIVATE EVENT ---
        // An event must have its thread URLs set and signups open before it can
        // become the globally active event.
        if (path === "/event/activate" && event.httpMethod === "POST") {
            if (!hasThreadUrls(targetEvent)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Both the main thread URL and signup thread URL must be set before this event can be activated." })
                };
            }

            if (targetEvent.status !== "signups_open") {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Only an event with open signups can be made the active event." })
                };
            }

            const configCollection = database.collection("config");
            const result = await configCollection.updateOne(
                { _id: "global_config" },
                { $set: { current_event_key: targetEvent._id } }
            );

            if (result.matchedCount === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Global config document not found." })
                };
            }

            invalidateConfigCache();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Event activated", activeEvent: targetEvent })
            };
        }

        // --- GET DATA ---
        if (path === "/data" && event.httpMethod === "GET") {
            const submissionsCollection = database.collection("artSubmissions");
            const signupsCollection = database.collection("signups");
            const matchesCollection = database.collection("matchups");

            const signups = await signupsCollection.find({ eventId: targetEvent._id }).toArray();
            const matches = await matchesCollection.find({ eventId: targetEvent._id }).toArray();
            const submissions = await submissionsCollection.find({ eventId: targetEvent._id }).toArray();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    signups,
                    matches,
                    submissions,
                    activeEvent: targetEvent
                })
            };
        }

        // --- DIRECTORY ---
        // Directory generation is a signup operation, so it is generated
        // server-side from verified signups only.
        if (path === "/directory" && event.httpMethod === "GET") {
            const signupsCollection = database.collection("signups");
            const verifiedSignups = await signupsCollection
                .find({ eventId: targetEvent._id, verified: true })
                .toArray();

            const directory = generateDirectory(verifiedSignups);

            if (!directory) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "No verified signups are available to generate a directory." })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ directory })
            };
        }

        // --- VERIFY SIGNUP ---
        // Admin-only. Uses exactly the supplied signup URL and follows its
        // pagination until the UUID is found.
        if (path === "/signups/verify" && event.httpMethod === "POST") {
            const { signupUuid, postUrl } = body;

            if (!signupUuid || !postUrl) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing signupUuid or postUrl" })
                };
            }

            const signupsCollection = database.collection("signups");
            const signup = await signupsCollection.findOne({
                _id: signupUuid,
                eventId: targetEvent._id
            });

            if (!signup) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Signup not found for this event." })
                };
            }

            let scanResult;
            try {
                scanResult = await scanForumForUuid(postUrl, signupUuid);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: error.message })
                };
            }

            if (!scanResult.found) {
                return {
                    statusCode: 422,
                    headers,
                    body: JSON.stringify({
                        error: scanResult.truncated
                            ? "UUID not found before the scan limit was reached. Try the specific post URL."
                            : "UUID not found on the supplied signup URL.",
                        pagesScanned: scanResult.pagesScanned,
                        truncated: scanResult.truncated
                    })
                };
            }

            if (!scanResult.username || !scanResult.userId) {
                return {
                    statusCode: 422,
                    headers,
                    body: JSON.stringify({
                        error: "Found the UUID, but could not extract the post author's username or user ID.",
                        pagesScanned: scanResult.pagesScanned
                    })
                };
            }

            await signupsCollection.updateOne(
                { _id: signupUuid, eventId: targetEvent._id },
                {
                    $set: {
                        verified: true,
                        verificationStatus: "verified",
                        username: scanResult.username,
                        userId: scanResult.userId,
                        postUrl: scanResult.postUrl,
                        verifiedAt: new Date(),
                        verifiedBy: "admin",
                        updatedAt: new Date()
                    }
                }
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: "Signup verified",
                    username: scanResult.username,
                    userId: scanResult.userId,
                    postUrl: scanResult.postUrl,
                    pagesScanned: scanResult.pagesScanned
                })
            };
        }

        // --- UPDATE EVENT ---
        if (path === "/event/update" && event.httpMethod === "POST") {
            const updates = body;

            if (!updates || Object.keys(updates).length === 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing updates" }) };
            }

            // Prevent updating _id
            delete updates._id;
            delete updates.eventId;

            if (updates.status && updates.status !== targetEvent.status) {
                const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[targetEvent.status] || [];

                if (!allowedNextStatuses.includes(updates.status)) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: `Cannot change event status from "${targetEvent.status}" to "${updates.status}".` })
                    };
                }

                if (targetEvent.status === "setup" && updates.status === "signups_open") {
                    const mainThreadUrl = updates.mainThreadUrl ?? targetEvent.mainThreadUrl;
                    const signupThreadUrl = updates.signupThreadUrl ?? targetEvent.signupThreadUrl;

                    if (!mainThreadUrl || !signupThreadUrl) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: "Both the main thread URL and signup thread URL must be set before opening signups." })
                        };
                    }
                }
            }

            updates.updatedAt = new Date();

            await eventsCollection.updateOne(
                { _id: targetEvent._id },
                { $set: updates }
            );

            // Editing the active event changes what /api/getActiveEvent returns,
            // so drop the cached config for this instance.
            invalidateConfigCache();

            // Fetch updated event to return
            const updatedEvent = await eventsCollection.findOne({ _id: targetEvent._id });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Event updated", activeEvent: updatedEvent })
            };
        }

        // --- MATCHING ---
        if (path === "/match/execute" && event.httpMethod === "POST") {
            const { matches: providedMatches, finalize } = body;
            const matchesCollection = database.collection("matchups");

            if (!providedMatches || !Array.isArray(providedMatches) || providedMatches.length === 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: "No matches provided." }) };
            }

            // Matching is a signup operation, so every participant must be a
            // verified signup for this event. Do not trust the browser payload.
            const signupsCollection = database.collection("signups");
            const verifiedSignups = await signupsCollection
                .find({ eventId: targetEvent._id, verified: true })
                .toArray();
            const verifiedById = new Map(verifiedSignups.map(s => [String(s._id), s]));

            const seenSantas = new Set();
            const seenRecipients = new Set();
            const matchesToSave = [];

            for (const m of providedMatches) {
                const santa = verifiedById.get(String(m?.santa?.id));
                const recipient = verifiedById.get(String(m?.recipient?.id));

                if (!santa || !recipient) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: "All matched signups must be verified for this event." })
                    };
                }

                if (String(santa._id) === String(recipient._id)) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: "A signup cannot be matched to itself." })
                    };
                }

                if (seenSantas.has(String(santa._id))) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: `Duplicate Santa in matches: ${santa.username}` })
                    };
                }

                if (seenRecipients.has(String(recipient._id))) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: `Duplicate recipient in matches: ${recipient.username}` })
                    };
                }

                const score = Number(m.score);
                const quality = Number(m.quality);
                if (!Number.isFinite(score) || !Number.isFinite(quality)) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: "Each match must include numeric score and quality values." })
                    };
                }

                seenSantas.add(String(santa._id));
                seenRecipients.add(String(recipient._id));

                matchesToSave.push({
                    eventId: targetEvent._id,
                    santa: {
                        id: santa._id,
                        username: santa.username,
                        tier: santa.highTier ? "Tier A" : "Tier B"
                    },
                    recipient: {
                        id: recipient._id,
                        username: recipient.username
                    },
                    score,
                    quality,
                    pass: m.pass,
                    createdAt: new Date()
                });
            }

            // 3. Save Matches
            if (matchesToSave.length > 0) {
                // Delete existing matches for this event (Full Reset)
                await matchesCollection.deleteMany({ eventId: targetEvent._id });

                // Insert new matches
                await matchesCollection.insertMany(matchesToSave);
            }

            // 4. Finalize (Close Signups)
            if (finalize) {
                await eventsCollection.updateOne(
                    { _id: targetEvent._id },
                    { $set: { status: 'signups_closed' } }
                );
                invalidateConfigCache();
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: finalize ? "Matching finalized and signups closed." : "Matches saved.",
                    matchedCount: matchesToSave.length
                })
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
