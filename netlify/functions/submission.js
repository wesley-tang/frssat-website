import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return {statusCode: 405};
	}

	const doc = new GoogleSpreadsheet(CONFIG.currentSheetsID);

	await doc.useServiceAccountAuth({
		"private_key": process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
		"client_email": process.env.CLIENT_EMAIL.replaceAll("\\n", "\n")
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
					altLinks: row.altLinks,
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