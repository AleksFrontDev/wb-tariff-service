import cron from "node-cron";
import { saveTariffs } from "../services/tariff.service.js";
import { fetchTariffs } from "../services/wbApi.service.js";

async function fetchAndSaveTariffs() {
  const today = new Date().toISOString().split("T")[0];

    try {
      const data = await fetchTariffs(today);
      await saveTariffs(data,today)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error:`, error);
    }
}

fetchAndSaveTariffs();

cron.schedule("0 * * * *", fetchAndSaveTariffs);
console.log("Scheduler started");
