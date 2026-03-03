import { TariffRecord } from "#interfaces/tariffService.interface.js";
import { WBTariffResponse } from "#interfaces/wbApi.interface.js";
import knex from "#postgres/knex.js";

function parseDecimal(value: string): number | null {
    if (value === "-" || value === null || value === undefined) return null;
    return parseFloat(value.replace(",", "."));
}

export async function saveTariffs(tariffs: WBTariffResponse['response']['data'], date: string): Promise<void> {
  const records: TariffRecord[] = tariffs.warehouseList.map((warehouse) => ({
      date,
      dt_next_box: tariffs.dtNextBox,
      dt_till_max: tariffs.dtTillMax,
      warehouse_name: warehouse.warehouseName,
      geo_name: warehouse.geoName,
      box_delivery_base: parseDecimal(warehouse.boxDeliveryBase),
      box_delivery_coef_expr: parseDecimal(warehouse.boxDeliveryCoefExpr),
      box_delivery_liter: parseDecimal(warehouse.boxDeliveryLiter),
      box_delivery_marketplace_base: parseDecimal(warehouse.boxDeliveryMarketplaceBase),
      box_delivery_marketplace_coef_expr: parseDecimal(warehouse.boxDeliveryMarketplaceCoefExpr),
      box_delivery_marketplace_liter: parseDecimal(warehouse.boxDeliveryMarketplaceLiter),
      box_storage_base: parseDecimal(warehouse.boxStorageBase),
      box_storage_coef_expr: parseDecimal(warehouse.boxStorageCoefExpr),
      box_storage_liter: parseDecimal(warehouse.boxStorageLiter),
  }));

  await knex.transaction(async (trx) => {
      for (const record of records) {
        await trx("box_tariffs")
          .insert(record)
          .onConflict(["date", "warehouse_name"])
          .merge();
      }
  });
}
