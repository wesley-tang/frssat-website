import CONFIG from "../../src/config/CONFIG.json";
import {GoogleSpreadsheet} from "google-spreadsheet";
import { Path } from "path-parser";

export const path = new Path("/api/submit");

export async function handler(event) {
	if (event.httpMethod === "POST") {
		const doc = new GoogleSpreadsheet(CONFIG.currentSheetsID);

		await doc.useServiceAccountAuth({
			"private_key": process.env.PRIVATE_KEY.replaceAll("\\n", "\n"),
			"client_email": process.env.CLIENT_EMAIL.replaceAll("\\n", "\n")
		});
		await doc.loadInfo();

		await doc.sheetsByTitle["submissions"].addRow(JSON.parse(event.body));

		return {
			statusCode: 200
		}
	} else if (event.httpMethod === "PUT") {
		const doc = new GoogleSpreadsheet(CONFIG.currentSheetsID);

		//TODO REMOVE BEFORE PUSH
		await doc.useServiceAccountAuth({
			"private_key": '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCioCnq7PPD+00F\nshOfgjPjIgBPYUHG9oyC62XgN8hXotfg+gVx63hmVj+dyCGRj0pBwMJd/0/XAnpv\nL4vbREGeWmbxViJ6BdD8tdQr3/zbvG18V6mzy9l6WkiOT1UPhOzuwAmhYvQqrTxF\nO5/jX5zX7W88CLsbVwvCwjxSrNfBp4LM1hX586onRDXcK4XD2+FD7AyUZ2NySIIL\no1S4s+6OAlzR/c4pTIRvTTKtBBEuqudIAFMbzKPkJnAJu9v2q1eobYSY66w+sMf7\nN0PnzbnHNoq30mV26WcAYnB6CG+256gcK9a6VMVNbntpyKpjziimqKvw6DzFt9sY\n8QLViHeFAgMBAAECggEABTb4kSFvAaJNynh2258LteVRuDnop44hXFNbDXEMeg7t\nODgcM5Z24mUyngccWHQNUAVz1hrJPx5Ducv/ApVyOzcv5N47tcj49hmIh62jiJJG\nun1/IhZPz3YUrIeLtTcwd8ltpaCsLrAmZhvu2RYoS94/ul+XTF2isWiUEZycQIfm\n+juLqrSeF0WlAC77wDKqLAKkLCqnYA7Jb0uJTeGDDMudmq7LKC9oi3ybXgwEnRvc\nNvTrdmBMmVF5nqHYyGDQgjc3kYn+Y3NW9IcB2oisedwG33swt+RBH2k07gn8SY0i\ndVEfWrrbq+RyYD91IiZzyD+GlXvUVq1z/HHqixLeYQKBgQDOMrIte0NLBKsrBtWE\nY8L7dXtLtNDF/1uQvgS88pCJqN38rURI7GXJZEH9oxWAVcRFbMFDz017pt7qP5Rz\na8J7/xi+xG5ML2msGRFfwAIWF3d8xsUN4gaHfYzqA+W5+32q+r4X2/d8QJXaq1jl\nDdw/wVmHkSTZzIhEF5VJdAvedQKBgQDJ516yj1flVLJ4EFvMul/fVCh+QzIMpIvq\naRfKGEQMuPaF/g9cT0mt9ePRISbypsatNTE+SM9wKI+1Crivt7oIbQD9Cw54EIdw\nr0sulMITVBP+eEMZsC09t4qBQRgiBglycm17J+qbH/UKJ0fzbjy2zeHz80uKIw5A\ntbisKjEy0QKBgQCeKejeVjRx8KzTHjTdjiBb/euLULDrj0pPJlJAFNeloDBWxxkf\nzqTs68hqo5O0kxUwI5HDT9ohRQisKgTW3AucTTpP6iCos52c8sWO6psvEuUGgvlY\nAs37U+SpBEBMfooQgrEZYBLf7jKEPva7C/yrssXX5Q+dOPQ1Ntm+NBN+mQKBgQCE\nGMqOTNaXBokVoK5PDgk31pn/sfsG5olcPpH/+Uxcfo9cL1LhdEaieGQrKWOQEqme\nHVUwiPafTQpoyrD21l/yr06cQCWhTD8w7J9lxJINj07diNVt8yRGYtVNp8cgS47W\nwCL9FqqZ/5iUogqjLBaxC5avwxhDMphaogpHKfuyYQKBgCh11XyGC3YCEQcQgcBZ\ntcLFqlUVpjG67rP4hIaudavUZBStEp8oPMxkTex9/8QObGjLEFNS6l7vifX4JpWf\nn81rj8w46NH6y77WGqd6YKWcfAUwkV8WpdiJkejhgJ1n9QTvFxEC8gfbxXsjih4F\n5aMywJzA96PsZDsA9QoNIL5a\n-----END PRIVATE KEY-----',
			"client_email": 'frssat@frssat.iam.gserviceaccount.com'
		});
		await doc.loadInfo();

		const updatedSubmission = JSON.parse(event.body)

		const rows = await doc.sheetsByTitle["submissions"].getRows();

		for (const row of rows) {
			if (row.uuid === event.queryStringParameters.uuid) {
				row.username = updatedSubmission.username
				row.recipient = updatedSubmission.recipient
				row.imageUrl = updatedSubmission.imageUrl
				row.altLinks = updatedSubmission.altLinks
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