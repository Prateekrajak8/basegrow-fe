"use client"
// import { AnalyticsData, ComparisonData } from "../AnalyticsDashboard/types";
import { SegmentData } from "./SegmentType";
const API_URL = "/api/ongage/segments";
const VALID_LIST_IDS = [
  203540,
  217478,
  1259703,
  1261035,
  1260311,
  1261054, 
];
const VALID_LIST_IDS_All = [
  203540,
  217478,
  1259703,
  1261035,
  1260311,
  1261054,
  242740,
];
export const fetchSegmentData = async (
  timePeriod: string,
  listId: string | number,
  startDate: Date | null,
  endDate: Date | null,
  isAlternativeView: boolean,
  country:string | null,
  domain:string | null,
  esp:string | null,
  type:string,
  eventName:string |null,
  smtpId: Number | null 
): Promise<SegmentData[]> => {
  try {
    let requestBody = {};
    if (timePeriod === "custom" && startDate && endDate) {
  console.log(startDate,"startDate")
      requestBody = {
        time_filter: timePeriod,
        start_date: startDate,
        end_date: endDate,
        event_name:eventName,
        list_id: isAlternativeView ? "all" : listId,
        is_alternative: isAlternativeView,
        smtp_id: smtpId,
      };
    } else {
      requestBody = { time_filter: timePeriod,
         list_id: isAlternativeView ? "all" : listId, 
         event_name:eventName,
         smtp_id: smtpId,
         is_alternative: isAlternativeView, };
    }
    console.log('requestBody', requestBody, startDate, endDate)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log(result.payload,"resuld payload")
    if (result.payload) {
      if (listId === "all" && domain === "TravelWhale") {
        const filteredPayload = result.payload.filter((item: any) =>
          VALID_LIST_IDS.includes(item.list_id)
        );
        return formatAnalyticsData(filteredPayload);
      }
      if (listId === "all" && domain === "All") {
        const filteredPayload = result.payload.filter((item: any) =>
          VALID_LIST_IDS_All.includes(item.list_id)
        );
        return formatAnalyticsData(filteredPayload);
      }
        // if(isAlternativeView){
        //   return aggregateData(result.payload)
        // }
      return formatAnalyticsData(result.payload);
    } else {
        console.log('no result')
        return []
    }
  } catch (error) {
    console.log("API Error:", error);
    return [];
  }
};

const formatAnalyticsData = (payload: any,smtpId?: string): SegmentData[] => {
  const aggregatedData: { [segment_name: string]: SegmentData } = {};

  payload.forEach((item: any) => {
    const segmentName = item.segment_name || "Unknown Segment";
    // if (smtpId && item.smtp_id !== smtpId) return;
    if (!aggregatedData[segmentName]) {
      aggregatedData[segmentName] = {
        segment_name: segmentName,
        event_name:item.event_name || "",
        list_id:item.list_id,
        segment_id:item.segment_id,
        date: "", // Not needed for grouping by segment,
        esp_name_title: "",
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
    aggregatedData[segmentName].sent += item.sent;
    aggregatedData[segmentName].uniqueOpens += item.unique_opens;
    aggregatedData[segmentName].totalClicks += item.clicks;
    aggregatedData[segmentName].uniqueClicks += item.unique_clicks;
    aggregatedData[segmentName].hardBounces += item.hard_bounces;
    aggregatedData[segmentName].softBounces += item.soft_bounces;
    aggregatedData[segmentName].unsubscribes += item.unsubscribes;
    aggregatedData[segmentName].totalOpens += item.opens;
    aggregatedData[segmentName].ctr += item.ctr;
    aggregatedData[segmentName].uctr += item.uctr;
    aggregatedData[segmentName].count += 1;

    // Calculate averages
    aggregatedData[segmentName].ctrrate =
      aggregatedData[segmentName].ctr / aggregatedData[segmentName].count;
    aggregatedData[segmentName].uctrrate =
      aggregatedData[segmentName].uctr / aggregatedData[segmentName].count;
  });

  return Object.values(aggregatedData);
};

