import cron from "node-cron";
import { fetchTariffs } from "../services/wbApi.service.js";
import { saveTariffs } from "../services/tariff.service.js";
import { updateAllSheets } from "../services/googleSheets.service.js";

async function fetchAndSaveTariffs() {
    const today = new Date().toISOString().split("T")[0];
    console.log(`[${new Date().toISOString()}] Fetching tariffs for ${today}...`);

    try {
        const data = await fetchTariffs(today);
        await saveTariffs(data, today);
        console.log(`[${new Date().toISOString()}] Tariffs saved successfully`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
    }
}

fetchAndSaveTariffs();

//Обновление данных из WB_API
cron.schedule("0 * * * *", async () => {
    try {
        await fetchAndSaveTariffs();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Unhandled error in cron job:`, error);
    }
});

//Обновление Google Таблиц
cron.schedule("0 */6 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Updating Google Sheets...`);
    try {
        await updateAllSheets();
        console.log(`[${new Date().toISOString()}] Google Sheets updated successfully`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error updating sheets:`, error);
    }
});

console.log("Scheduler started. Will run every hour at minute 0, and sheets every 6 hours.");
