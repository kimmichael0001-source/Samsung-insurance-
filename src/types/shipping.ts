export interface ShippingDestination {
  countryCode: string;
  countryName: string;
  cost: number;
  currency: string;
  etaMinDays: number;
  etaMaxDays: number;
  customsNote: string;
}
