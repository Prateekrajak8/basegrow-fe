
"use client"
// import { AnalyticsData, ComparisonData } from "../AnalyticsDashboard/types";
import { SegmentData } from "./EventType";
const API_URL = "/api/ongage/events";
const VALID_LIST_IDS = [
  203540,
  217478,
  1259703,
  1261035,
  1260311,
  1261054,  
];
const formatSegmentData = (payload: any[]): SegmentData[] => {
  return payload.map(item => ({
    date: item.stats_date ? new Date(item.stats_date * 1000).toISOString().split('T')[0] : '',
    segment_name: item.segment_name || '',
    event_name: item.event_name || '',
    list_id: item.list_id || '',
    event_id: item.event_id || '',
    sent: item.sent || 0,
    hardBounces: item.hard_bounces || 0,
    softBounces: item.soft_bounces || 0,
    totalOpens: item.opens || 0,
    uniqueOpens: item.unique_opens || 0,
    totalClicks: item.clicks || 0,
    uniqueClicks: item.unique_clicks || 0,
    unsubscribes: item.unsubscribes || 0,
    ctr: item.ctr || 0,
    uctr: item.uctr || 0,
    ctrrate: item.ctr_rate || 0,
    uctrrate: item.uctr_rate || 0,
    count: item.count || 0
  }));
};

export const fetchSegmentData = async (
  timePeriod: string,
  listId: string | number,
  startDate: Date | null,
  endDate: Date | null,
  isAlternativeView: boolean,
  country: string | null,
  domain: string | null,
  esp: string | null,
  type: string,
  eventDomain:string |null,
  signal?: AbortSignal
): Promise<SegmentData[]> => {
  try {
    // Convert Date objects to ISO strings if they exist
    console.log(startDate,"startDate in eventdataservice")
    const formattedStartDate = startDate ? startDate : null;
    const formattedEndDate = endDate ? endDate : null;

    let requestBody = {};
    if (timePeriod === "custom" && formattedStartDate && formattedEndDate) {
      requestBody = {
        time_filter: timePeriod,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        list_id: isAlternativeView ? "all" : listId,
        is_alternative: isAlternativeView,
        domain:eventDomain
      };
    } else {
      requestBody = { 
        time_filter: timePeriod,
        list_id: isAlternativeView ? "all" : listId, 
        is_alternative: isAlternativeView,
        domain:eventDomain
      };
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal,
    });

    const result = await response.json();
    // if (result.payload) {
    //   if (listId === "all" && !isAlternativeView) {
    //     console.log('payload',result.payload)
    //       const filteredPayload = result.payload.filter((item: any) =>
    //       VALID_LIST_IDS.includes(item.list_id)
    //     );
    //     return formatAnalyticsData(filteredPayload);
    //   }
    //     // if(isAlternativeView){
    //     //   return aggregateData(result.payload)
    //     // }
    //   return formatAnalyticsData(result.payload);
    // } else {
    //     console.log('no result')
    //     return []
    // }
    if (result.payload) {
      return formatAnalyticsData(result.payload);
    } else {
      return [];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return [];
      }
      console.log("API Error:", error.message);
    } else {
      console.log("Unknown error occurred:", error);
    }
    return [];
  }
};

const formatAnalyticsData = (payload: any): SegmentData[] => {
  const aggregatedData: { [event_name: string]: SegmentData } = {};

  payload.forEach((item: any) => {
    const segmentName = item.segment_name || "Unknown Segment";
    const eventName = item.event_name || "Unknown Segment";

    if (!aggregatedData[eventName]) {
      aggregatedData[eventName] = {
        segment_name: segmentName,
        event_name:eventName,
        event_id:item.event_id,
        list_id:item.list_id,
        date: "", // Not needed for grouping by segment
        sent: 0,
        uniqueOpens: 0,
        totalClicks: 0,
        uniqueClicks: 0,
        hardBounces:0,
        softBounces:0,
        unsubscribes:0,
        totalOpens:0,
        ctr: 0,
        uctr: 0,
        ctrrate: 0,
        uctrrate: 0,
        count: 0,
      };
    }

    // Aggregate values
    aggregatedData[eventName].sent += item.sent;
    aggregatedData[eventName].uniqueOpens += item.unique_opens;
    aggregatedData[eventName].totalClicks += item.clicks;
    aggregatedData[eventName].uniqueClicks += item.unique_clicks;
    aggregatedData[eventName].hardBounces += item.hard_bounces;
    aggregatedData[eventName].softBounces += item.soft_bounces;
    aggregatedData[eventName].unsubscribes += item.unsubscribes;
    aggregatedData[eventName].totalOpens += item.opens;
    aggregatedData[eventName].ctr += item.ctr;
    aggregatedData[eventName].uctr += item.uctr;
    aggregatedData[eventName].count += 1;

    // Calculate averages
    aggregatedData[eventName].ctrrate =
      aggregatedData[eventName].ctr / aggregatedData[eventName].count;
    aggregatedData[eventName].uctrrate =
      aggregatedData[eventName].uctr / aggregatedData[eventName].count;
  });
console.log("event data final ",aggregatedData)
  return Object.values(aggregatedData);
};
