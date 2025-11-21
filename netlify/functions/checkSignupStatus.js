import { client } from "../lib/configHelper";

export async function handler(event) {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { uuid } = event.queryStringParameters;

    if (!uuid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing uuid parameter" }),
        };
    }

    try {
        await client.connect();
        const database = client.db();
        const collection = database.collection("signups");

        const signup = await collection.findOne({ _id: uuid });

        return {
            statusCode: 200,
            body: JSON.stringify({
                verified: signup ? !!signup.verified : false,
                exists: !!signup
            }),
        };

    } catch (error) {
        console.error("Error checking signup status:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}
