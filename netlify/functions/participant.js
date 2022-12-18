import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return {statusCode: 405};
	}

	const doc = new GoogleSpreadsheet(CONFIG.sheetsID);

	await doc.useServiceAccountAuth({
		"private_key": JSON.parse(process.env.PRIVATE_KEY),
		"client_email": JSON.parse(process.env.CLIENT_EMAIL)
	});
	await doc.loadInfo();

	const rows = await doc.sheetsByTitle["participant"].getRows();

	return {
		statusCode: 200,
		body: Array.from(rows.values()).map(v => v["participants"])
	}
}