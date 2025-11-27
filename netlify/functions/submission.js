import { client } from "../lib/configHelper";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return { statusCode: 405 };
	}

	const uuid = event.queryStringParameters.uuid;
	if (!uuid) {
		return { statusCode: 400, body: JSON.stringify({ error: "Missing uuid" }) };
	}

	try {
		await client.connect();
		const database = client.db();
		const submissionsCollection = database.collection("artSubmissions");

		const submission = await submissionsCollection.findOne({ uuid: uuid });

		if (submission) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					uuid: submission.uuid,
					username: submission.username,
					recipient: submission.useMatchupRecipient ? "Submitting for your main recipient!" : submission.recipient,
					useMatchupRecipient: submission.useMatchupRecipient,
					imageUrl: submission.imageUrl,
					altLinks: submission.altLinks, // Array
					tags: submission.tags, // Array
					message: submission.message,
					note: submission.note,
					anonymous: submission.anonymous,
				})
			};
		} else {
			return {
				statusCode: 404
			}
		}
	} catch (error) {
		console.error("Submission Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" })
		};
	}
}