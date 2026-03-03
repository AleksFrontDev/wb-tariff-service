import env from "#config/env/env.js";
import { WBTariffResponse } from "#interfaces/wbApi.interface.js";

export async function fetchTariffs(date: string): Promise<WBTariffResponse["response"]["data"]> {
    const url = `https://common-api.wildberries.ru/api/v1/tariffs/box?date=${date}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${env.WB_API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`WB API error: ${response.status} ${response.statusText}`);
    }

    const data: WBTariffResponse = await response.json();
    return data.response.data;
}
