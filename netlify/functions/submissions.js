import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return {statusCode: 405};
	}

	let sheetsId = CONFIG.currentSheetsID;

	if (event.queryStringParameters.year) {
		sheetsId = CONFIG[`sheetsID${event.queryStringParameters.year}`];
	}

	const doc = new GoogleSpreadsheet(sheetsId);

	await doc.useServiceAccountAuth({
		"private_key": process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
		"client_email": process.env.CLIENT_EMAIL.replaceAll("\\n", "\n")
	});
	await doc.loadInfo();

	const rows = await doc.sheetsByTitle["submissions"].getRows();
	const response = {"submissions": []};

	Array.from(rows.values()).forEach(row => {
		response.submissions.push({
			"username": row.anonymous === "TRUE" ? "?" : row.username,
			"recipient": row.recipient,
			"imageUrl": row.imageUrl,
			"altLinks": row.altLinks,
			"category": row.category,
			"message": row.message
		})
	})

	return {
		statusCode: 200,
		body: JSON.stringify(response)
	}
}