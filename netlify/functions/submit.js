import { client } from "../lib/configHelper";
import { getActiveConfig } from "../lib/configHelper";
import { Path } from "path-parser";

export const path = new Path("/api/submit");

export async function handler(event) {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json"
	};

	if (event.httpMethod === "OPTIONS") {
		return { statusCode: 200, headers, body: "" };
	}

	try {
		await client.connect();
		const database = client.db();
		const submissionsCollection = database.collection("artSubmissions");
		const matchupsCollection = database.collection("matchups");

		if (event.httpMethod === "POST") {
			const data = JSON.parse(event.body);
			const { activeEvent } = await getActiveConfig();

			let recipient = data.recipient;

			// Secure Recipient Lookup
			if (data.useMatchupRecipient) {
				const matchup = await matchupsCollection.findOne({
					eventId: activeEvent._id,
					"santa.username": data.username
				});

				if (matchup) {
					recipient = matchup.recipient.username;
				} else {
					return {
						statusCode: 400,
						body: JSON.stringify({ error: "No matchup found for this user." })
					};
				}
			}

			const newSubmission = {
				uuid: data.uuid,
				eventId: activeEvent._id,
				username: data.username,
				recipient: recipient,
				useMatchupRecipient: data.useMatchupRecipient,
				imageUrl: data.imageUrl,
				altLinks: data.altLinks || [],
				tags: data.tags || [],
				message: data.message,
				note: data.note,
				anonymous: data.anonymous,
				timestamp: new Date()
			};

			await submissionsCollection.insertOne(newSubmission);

			return {
				statusCode: 200,
				body: JSON.stringify({ message: "Submission successful" })
			};

		} else if (event.httpMethod === "PUT") {
			const uuid = event.queryStringParameters.uuid;
			if (!uuid) {
				return { statusCode: 400, body: JSON.stringify({ error: "Missing uuid" }) };
			}

			const data = JSON.parse(event.body);

			const updateFields = {
				username: data.username,
				recipient: data.recipient,
				useMatchupRecipient: data.useMatchupRecipient,
				imageUrl: data.imageUrl,
				altLinks: data.altLinks || [],
				tags: data.tags || [],
				message: data.message,
				note: data.note,
				anonymous: data.anonymous,
				// timestamp: new Date() // Maybe update a 'lastUpdated'?
			};

			const result = await submissionsCollection.updateOne(
				{ uuid: uuid },
				{ $set: updateFields }
			);

			if (result.matchedCount === 0) {
				return { statusCode: 404, body: JSON.stringify({ error: "Submission not found" }) };
			}

			return {
				statusCode: 200,
				body: JSON.stringify({ message: "Submission updated" })
			};
		} else {
			return { statusCode: 405 };
		}
	} catch (error) {
		console.error("Submit Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" })
		};
	}
}