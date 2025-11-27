import { client } from "../lib/configHelper";
import { getActiveConfig } from "../lib/configHelper";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return { statusCode: 405 };
	}

	try {
		await client.connect();
		const database = client.db();
		const matchupsCollection = database.collection("matchups");

		let eventId;

		if (event.queryStringParameters.eventId) {
			eventId = event.queryStringParameters.eventId;
		} else {
			const { activeEvent } = await getActiveConfig();
			eventId = activeEvent._id;
		}

		const matchups = await matchupsCollection.find({ eventId: eventId }).toArray();

		// Extract santas (participants) from matchups
		const participants = matchups.map(m => m.santa.username);
		// Sort alphabetically
		participants.sort((a, b) => a.localeCompare(b));

		return {
			statusCode: 200,
			body: JSON.stringify({ participants })
		}
	} catch (error) {
		console.error("Participant Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" })
		};
	}
}