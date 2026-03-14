export interface AnalyticsData {
    date: string;
    sent: number;
    uniqueOpens: number;
    totalClicks: number;
    uniqueClicks: number;
    ctr:number;
    uctr:number;
    ctrrate: number, 
    uctrrate: number, 
    count:number
  }
  export interface ComparisonData {
    metric: string;
    total_sent: number;
    total_clicks: number;
    // date: string;
  }

  export interface CountryAnalyticsData {
  country: string;
  date: string;
  totalSent: number;
  emailClicks: number;
  socialClicks: number;
  totalClicks: number;
  // uniqueClicks:number;
}
export const LIST_ID_TO_COUNTRY: Record<number, string> = {
  203540: "NL Netherland",
  217478: "DE Germany",
  1259703: "DK Denmark",
  1261035: "FR France",
  1260311: "SE Sweden",
  1261054: "UK England",
  242740: "NL Netherland (FavoTrip)"
};
  
  export interface ListId {
    name: string;
    list_id: string | number;
  }
  