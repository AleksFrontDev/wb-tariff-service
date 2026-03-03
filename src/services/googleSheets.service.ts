import { google } from "googleapis";
import env from "#config/env/env.js";
import knex from "#postgres/knex.js";

async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return await auth.getClient();
}

async function getSpreadsheetIds(): Promise<string[]> {
  const rows = await knex("spreadsheets").select("spreadsheet_id");
  return rows.map((row) => row.spreadsheet_id);
}

async function getLatestTariffs() {
    const latestDateRow = await knex("box_tariffs").max("date as maxDate").first();

    if (!latestDateRow?.maxDate) {
        return [];
    }

  const tariffs = await knex("box_tariffs")
    .where("date", latestDateRow.maxDate)
    .orderBy("box_delivery_coef_expr", "asc");

  return tariffs;
}

async function updateSheet(auth: any, spreadsheetId: string, data: any[]) {
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "stocks_coefs!A:Z",
    });

    if (data.length === 0) {
        console.log(`No data for sheet ${spreadsheetId}`);
        return;
    }

    const headers = ["warehouse_name", "coefficient", "date"];

    const rows = data.map((item) => [item.warehouse_name, item.box_delivery_coef_expr || 0, item.date]);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "stocks_coefs!A1",
        valueInputOption: "RAW",
        requestBody: {
            values: [headers, ...rows],
        },
    });

    console.log(`Sheet ${spreadsheetId} updated`);
}

export async function updateAllSheets() {
    try {
        const auth = await getAuthClient();
        const spreadsheetIds = await getSpreadsheetIds();
        const latestTariffs = await getLatestTariffs();

        if (spreadsheetIds.length === 0) {
            console.log("No spreadsheet IDs found in database");
            return;
        }

        for (const id of spreadsheetIds) {
            await updateSheet(auth, id, latestTariffs);
        }

        console.log(`Updated ${spreadsheetIds.length} sheets`);
    } catch (error) {
        console.error("Error in updateAllSheets:", error);
        throw error;
    }
}
