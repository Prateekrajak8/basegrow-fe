"use client";

import axios from "axios";
import { SegmentData } from "./SegmentType";

const API_URL = "/api/ongage/event-date-data";

export const fetchSegmentData = async (
  timePeriod: string,
  startDate: Date | null,
  endDate: Date | null,
  eventName: string | null,
  listId: string | number,
): Promise<SegmentData[]> => {
  try {
    let requestBody = {};

    if (timePeriod === "custom") {
      if (startDate && endDate) {
        console.log(startDate, "startDate");
        requestBody = {
          time_filter: timePeriod,
          start_date: startDate,
          list_id:listId,
          end_date: endDate,
          event_name: eventName,
        };
      } else {
        console.log("Missing start or end date for custom timePeriod");
        return [];
      }
    } else {
      requestBody = {
        time_filter: timePeriod,
        start_date: startDate,
        end_date: endDate,
        list_id:listId,
        event_name: eventName,
      };
    }

    console.log("requestBody", requestBody, startDate, endDate);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log(result.payload, "result payload");

    if (result.payload) {
      return formatAnalyticsData(result.payload);
    } else {
      console.log("no result");
      return [];
    }
  } catch (error) {
    console.log("API Error:", error);
    return [];
  }
};

const formatAnalyticsData = (payload: any): SegmentData[] => {
    const aggregatedData: { [date: string]: SegmentData } = {};
  
    payload.forEach((item: any) => {
      console.log("Item received:", item);
  
      const formattedDate = new Date(item.stats_date * 1000)
        .toISOString()
        .split("T")[0];
        if (formattedDate !== "N/A") {
      if (!aggregatedData[formattedDate]) {
        aggregatedData[formattedDate] = {
          segment_name: item.segment_name || "",
          // list_id:item.list_id,
          esp_name_title:item.esp_name_title||"",
          date: formattedDate,
          sent: 0,
          uniqueOpens: 0,
          totalClicks: 0,
          uniqueClicks: 0,
          hardBounces: 0,
          softBounces: 0,
          unsubscribes: 0,
          totalOpens: 0,
          ctr: 0,
          uctr: 0,
          ctrrate: 0,
          uctrrate: 0,
          count: 0,
          event_name:item.event_name,
          list_id:item.list_id,
          segment_id:item.segment_id,
          
        };
      }
  
      aggregatedData[formattedDate].sent += item.sent ?? 0;
      aggregatedData[formattedDate].uniqueOpens += item.unique_opens ?? 0;
      aggregatedData[formattedDate].totalClicks += item.clicks ?? 0;
      aggregatedData[formattedDate].uniqueClicks += item.unique_clicks ?? 0;
      aggregatedData[formattedDate].hardBounces += item.hard_bounces ?? 0;
      aggregatedData[formattedDate].softBounces += item.soft_bounces ?? 0;
      aggregatedData[formattedDate].unsubscribes += item.unsubscribes ?? 0;
      aggregatedData[formattedDate].totalOpens += item.opens ?? 0;
      aggregatedData[formattedDate].ctr += item.ctr ?? 0;
      aggregatedData[formattedDate].uctr += item.uctr ?? 0;
      aggregatedData[formattedDate].count += 1;
  
      aggregatedData[formattedDate].ctrrate =
        aggregatedData[formattedDate].ctr / aggregatedData[formattedDate].count;
      aggregatedData[formattedDate].uctrrate =
        aggregatedData[formattedDate].uctr / aggregatedData[formattedDate].count;
    }
    });
  
    return Object.values(aggregatedData).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };
  
 
