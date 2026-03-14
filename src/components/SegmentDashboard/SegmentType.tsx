export interface SegmentData {
    date: string;
    sent: number;
    uniqueOpens: number;
    totalClicks: number;
    uniqueClicks: number;
    hardBounces: number;
    softBounces: number;
    unsubscribes: number;
    totalOpens: number;
    ctr:number;
    uctr:number;
    ctrrate: number;
    uctrrate: number;
    count:number;
    segment_name:string;
    event_name:string;
    list_id:number;
    segment_id:number;
    esp_name_title:string;
  }
  export interface ComparisonData {
    metric: string;
    total_sent: number;
    total_clicks: number;
    // date: string;
  }
  
  export interface ListId {
    name: string;
    list_id: string | number;
  }
  