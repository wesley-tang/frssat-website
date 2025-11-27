import { client } from "../lib/configHelper";

export async function handler(event) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405 };
    }

    try {
        await client.connect();
        const database = client.db();
        const eventsCollection = database.collection("events");

        // Fetch all events, maybe sort by year/date descending
        const events = await eventsCollection.find({}).sort({ year: -1 }).toArray();

        return {
            statusCode: 200,
            body: JSON.stringify({ events })
        };

    } catch (error) {
        console.error("Events Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
}
