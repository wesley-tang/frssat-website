import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";
import { Path } from "path-parser";

export const path = new Path("/api/submit");

export async function handler(event) {
	if (event.httpMethod === "POST") {
		const doc = new GoogleSpreadsheet(CONFIG.sheetsID);

		await doc.useServiceAccountAuth({
			"private_key": JSON.parse(process.env.PRIVATE_KEY),
			"client_email": JSON.parse(process.env.CLIENT_EMAIL)
		});
		await doc.loadInfo();

		await doc.sheetsByTitle["submissions"].addRow(JSON.parse(event.body));

		return {
			statusCode: 200
		}
	} else if (event.httpMethod === "PUT") {
		const doc = new GoogleSpreadsheet(CONFIG.sheetsID);

		await doc.useServiceAccountAuth({
			"private_key": JSON.parse(process.env.PRIVATE_KEY),
			"client_email": JSON.parse(process.env.CLIENT_EMAIL)
		});
		await doc.loadInfo();

		const updatedSubmission = JSON.parse(event.body)

		const rows = await doc.sheetsByTitle["submissions"].getRows();

		for (const row of rows) {
			if (row.uuid === event.queryStringParameters.uuid) {
				row.username = updatedSubmission.username
				row.recipient = updatedSubmission.recipient
				row.imageUrl = updatedSubmission.imageUrl
				row.secondaryLinks = updatedSubmission.secondaryLinks
				row.category = updatedSubmission.category
				row.message = updatedSubmission.message
				row.note = updatedSubmission.note
				row.anonymous = updatedSubmission.anonymous
				row.nextYear = updatedSubmission.nextYear

				await row.save();
				return {
					statusCode: 200
				}
			}
		}
		return {
			statusCode: 400
		}
	} else {
		return {statusCode: 405};
	}
}