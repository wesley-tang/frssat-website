import { client } from "../lib/configHelper";
import { getActiveConfig } from "../lib/configHelper";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return { statusCode: 405 };
	}

	try {
		await client.connect();
		const database = client.db();
		const submissionsCollection = database.collection("artSubmissions");

		let eventId;

		if (event.queryStringParameters.eventId) {
			eventId = event.queryStringParameters.eventId;
		} else {
			const { activeEvent } = await getActiveConfig();
			eventId = activeEvent._id;
		}

		const submissions = await submissionsCollection.find({ eventId: eventId }).toArray();

		const response = {
			submissions: submissions.map(sub => ({
				username: sub.anonymous ? "" : sub.username,
				recipient: sub.recipient,
				imageUrl: sub.imageUrl,
				altLinks: sub.altLinks,
				tags: sub.tags,
				message: sub.message
			}))
		};

		return {
			statusCode: 200,
			body: JSON.stringify(response)
		}
	} catch (error) {
		console.error("Submissions Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" })
		};
	}
}