import { client } from "../lib/configHelper";
import { trimSubjects, trimPrefs } from "../lib/dataHelpers";
import axios from "axios";
import * as cheerio from "cheerio";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        let { signupUuid, postUrl, eventId, isInitialized, username: _u, userId: _uid, ...formData } = JSON.parse(event.body);

        // Check if signups are closed
        const { activeEvent } = await getActiveConfig();
        if (activeEvent.status === 'signups_closed') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: "Signups are closed. New signups are no longer accepted." }),
            };
        }

        if (!signupUuid || !postUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing signupUuid or postUrl" }),
            };
        }

        // 1. Fetch the forum post
        const response = await axios.get(postUrl);
        const html = response.data;
        const $ = cheerio.load(html);

        // 2. Find the post containing the UUID
        let foundPost = null;
        let username = null;
        let userId = null;

        // Strategy A: Check specific post ID from URL fragment
        try {
            const urlHash = new URL(postUrl).hash;
            if (urlHash && urlHash.startsWith("#post_")) {
                const specificPost = $(urlHash);
                if (specificPost.length > 0) {
                    const postContent = specificPost.find(".post-text-content").text();
                    if (postContent.includes(signupUuid)) {
                        foundPost = specificPost;
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to parse postUrl for ID:", e);
        }

        // Strategy B: Scan all posts (Fallback)
        if (!foundPost) {
            $("div.post").each((i, el) => {
                const postContent = $(el).find(".post-text-content").text();

                if (postContent.includes(signupUuid)) {
                    foundPost = $(el);
                    return false; // Break the loop
                }
            });
        }

        // Extract user info if post found
        if (foundPost) {
            const authorLink = foundPost.find("a.post-author-username");
            username = authorLink.text().trim();
            const authorHref = authorLink.attr("href");

            const idMatch = authorHref ? authorHref.match(/\/clan-profile\/(\d+)/) : null;
            if (idMatch) {
                userId = idMatch[1];
            }

            // Ensure the saved URL links to this specific post
            const postId = foundPost.attr("id");
            if (postId) {
                try {
                    const urlObj = new URL(postUrl);
                    urlObj.hash = `#${postId}`;
                    postUrl = urlObj.toString();
                } catch (e) {
                    console.warn("Failed to update postUrl hash:", e);
                }
            }
        }

        if (!foundPost) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "UUID not found in the provided post URL." }),
            };
        }

        if (!username || !userId) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Could not extract user info from the post." }),
            };
        }

        // 3. Trim Data
        const trimmedSubjects = trimSubjects(formData.subjects);
        const trimmedPrefs = trimPrefs(formData.prefsByTier);

        // 4. Upsert to MongoDB
        await client.connect();
        const database = client.db();
        const collection = database.collection("signups");

        await collection.updateOne(
            { _id: signupUuid },
            {
                $set: {
                    ...formData,
                    subjects: trimmedSubjects,
                    prefsByTier: trimmedPrefs,
                    verified: true,
                    username,
                    userId,
                    postUrl,
                    eventId,
                    verifiedAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Signup verified and saved successfully",
                username,
                userId
            }),
        };

    } catch (error) {
        console.error("Error verifying signup:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
        };
    }
}
