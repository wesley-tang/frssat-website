import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return {statusCode: 405};
	}

	const doc = new GoogleSpreadsheet(CONFIG.sheetsID);
	let er = ""
	await doc.useServiceAccountAuth({
		"private_key": process.env.PRIVATE_KEY,
		"client_email": process.env.CLIENT_EMAIL
	});
	await doc.loadInfo();

	const rows = await doc.sheetsByTitle["submissions"].getRows();
	for (const row of rows) {
		if (row.uuid === event.queryStringParameters.uuid) {
			return {
				statusCode: 200,
				body: JSON.stringify({
					uuid: row.uuid,
					username: row.username,
					recipient: row.recipient,
					imageUrl: row.imageUrl,
					secondaryLinks: row.secondaryLinks,
					category: row.category,
					message: row.message,
					note: row.note,
					anonymous: row.anonymous === "TRUE",
					nextYear: row.nextYear === "TRUE"
				})
			};
		}
	}

	return {
		statusCode: 404
	}
}