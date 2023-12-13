import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";

export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return {statusCode: 405};
	}

	const doc = new GoogleSpreadsheet(CONFIG.currentSheetsID);

	console.log("1");
	console.log(process.env.PRIVATE_KEY.replaceAll("\\n", "\n"));
	console.log("2");
	console.log(process.env.PRIVATE_KEY.replaceAll("\\n", "\n"));

	await doc.useServiceAccountAuth({
		"private_key": process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
		"client_email": process.env.CLIENT_EMAIL.replaceAll("\\n", "\n")
	});
	await doc.loadInfo();

	const rows = await doc.sheetsByTitle["submissions"].getRows();
	const response = {"hasSubmitted": Array.from(rows.values()).map(v => v["username"]).includes(event.queryStringParameters.name)};

	return {
		statusCode: 200,
		body: JSON.stringify(response)
	}
}