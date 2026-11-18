import { client, getActiveConfig } from "../lib/configHelper";
import { trimSubjects, trimPrefs } from "../lib/dataHelpers";

/**
 * Saves the user's form as a pending signup.
 *
 * Verification is intentionally NOT performed here. A signup becomes usable
 * by the event only after an admin verifies the forum post from the event
 * dashboard.
 */
export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const {
            signupUuid,
            isInitialized,
            eventId: _ignoredEventId,
            username: _ignoredUsername,
            userId: _ignoredUserId,
            postUrl: _ignoredPostUrl,
            verified: _ignoredVerified,
            verificationStatus: _ignoredVerificationStatus,
            verifiedAt: _ignoredVerifiedAt,
            verifiedBy: _ignoredVerifiedBy,
            submittedAt: _ignoredSubmittedAt,
            updatedAt: _ignoredUpdatedAt,
            ...formData
        } = JSON.parse(event.body);

        if (!signupUuid || typeof signupUuid !== "string") {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing signupUuid" }),
            };
        }

        if (!Array.isArray(formData.subjects) || formData.subjects.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "At least one subject is required." }),
            };
        }

        if (!formData.prefsByTier) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing preferences." }),
            };
        }

        const { activeEvent } = await getActiveConfig();

        if (['signups_closed', 'concluded'].includes(activeEvent.status)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Signups are closed. New signups are no longer accepted." }),
            };
        }

        const deadline = activeEvent.signUpDeadLine ? new Date(activeEvent.signUpDeadLine) : null;
        if (deadline && !Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime()) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "The signup deadline has passed." }),
            };
        }

        await client.connect();
        const database = client.db();
        const collection = database.collection("signups");

        const existingSignup = await collection.findOne({ _id: signupUuid });

        if (existingSignup && existingSignup.eventId && existingSignup.eventId !== activeEvent._id) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: "This signup belongs to a different event." }),
            };
        }

        const trimmedSubjects = trimSubjects(formData.subjects);
        const trimmedPrefs = trimPrefs(formData.prefsByTier);

        const updateData = {
            ...formData,
            subjects: trimmedSubjects,
            prefsByTier: trimmedPrefs,
            eventId: activeEvent._id,
            updatedAt: new Date(),
        };

        if (existingSignup) {
            // Preserve verification fields when a verified user edits their form.
            await collection.updateOne(
                { _id: signupUuid, eventId: activeEvent._id },
                { $set: updateData }
            );
        } else {
            await collection.insertOne({
                _id: signupUuid,
                ...updateData,
                verified: false,
                verificationStatus: "pending",
                submittedAt: new Date(),
            });
        }

        const saved = await collection.findOne({ _id: signupUuid });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Signup saved",
                signupUuid,
                verified: !!saved?.verified,
                verificationStatus: saved?.verificationStatus || (saved?.verified ? "verified" : "pending"),
            }),
        };
    } catch (error) {
        console.error("Error saving signup:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
}
