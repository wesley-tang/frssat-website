import { client } from "../lib/configHelper";
import { getActiveConfig } from "../lib/configHelper";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return { statusCode: 405 };
	}

	const username = event.queryStringParameters.name;
	if (!username) {
		return { statusCode: 400, body: JSON.stringify({ error: "Missing name parameter" }) };
	}

	try {
		await client.connect();
		const database = client.db();
		const submissionsCollection = database.collection("artSubmissions");

		const { activeEvent } = await getActiveConfig();

		const submission = await submissionsCollection.findOne({
			eventId: activeEvent._id,
			username: username
		});

		return {
			statusCode: 200,
			body: JSON.stringify({ hasSubmitted: !!submission })
		};

	} catch (error) {
		console.error("HasSubmitted Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" })
		};
	}
}