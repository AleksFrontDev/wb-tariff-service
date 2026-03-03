export interface WBTariffResponse {
  response: {
    data: {
      dtNextBox: string;
      dtTillMax: string;
      warehouseList: Array<{
        warehouseName: string;
        geoName: string;
        boxDeliveryBase: string;
        boxDeliveryCoefExpr: string;
        boxDeliveryLiter: string;
        boxDeliveryMarketplaceBase: string;
        boxDeliveryMarketplaceCoefExpr: string;
        boxDeliveryMarketplaceLiter: string;
        boxStorageBase: string;
        boxStorageCoefExpr: string;
        boxStorageLiter: string;
      }>;
    };
  };
}
