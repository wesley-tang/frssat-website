import { getActiveConfig } from "../lib/configHelper";

/**
 * A fast, lightweight function for the frontend React app
 * to fetch the currently active event details.
 */
export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return { statusCode: 405, body: "Method Not Allowed" };
	}

	try {
		const forceRefresh = event.queryStringParameters?.refresh === '1';
		const activeEventContext = await getActiveConfig(forceRefresh);

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(activeEventContext),
		};
	} catch (err) {
		console.error("Failed to get active event for client:", err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: err.message }),
		};
	}
}