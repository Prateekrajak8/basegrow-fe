import { AnalyticsData, ComparisonData, CountryAnalyticsData, LIST_ID_TO_COUNTRY  } from "./types";

const API_URL = "/api/ongage/matrix";
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
interface AnalyticsResponse {
  formattedData: AnalyticsData[] | ComparisonData[];
  rawPayload: any[];
}

export const fetchAnalyticsData = async (
  timePeriod: string,
  listId: string | number,
  startDate: Date | string | null,
  endDate: Date | string | null,
  isAlternativeView: boolean,
  country: string | null,
  domain: string | null,
  esp: string | null,
  type: string,
  signal?: AbortSignal
): Promise<AnalyticsResponse> => {
  try {
    // Helper function to safely convert to date string
    const getDateString = (date: Date | string | null): string | null => {
      if (!date) return null;
      try {
        // If it's already a string in YYYY-MM-DD format, return it
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // Otherwise, try to convert to Date and format
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return null;
        return dateObj.toISOString().split('T')[0];
      } catch (error) {
        console.log('Error formatting date:', error);
        return null;
      }
    };

    const formattedStartDate = getDateString(startDate);
    const formattedEndDate = getDateString(endDate);

    let requestBody = {};
    if (timePeriod === "custom" && formattedStartDate && formattedEndDate) {
      requestBody = {
        time_filter: timePeriod,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        list_id: isAlternativeView ? "all" : listId,
        is_alternative: isAlternativeView,
      };
    } else {
      requestBody = {
        time_filter: timePeriod,
        list_id: isAlternativeView ? "all" : listId,
        is_alternative: isAlternativeView
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
    //      let formattedData: AnalyticsData[] | ComparisonData[] = [];
    //   if (listId === "all" && domain === "TravelWhale" && !isAlternativeView) {
    //     const filteredPayload = result.payload.filter((item: any) =>
    //       VALID_LIST_IDS.includes(item.list_id)
    //     );
    //     return formatAnalyticsData(filteredPayload);
    //   }
    //   if (listId === "all" && domain === "All" && !isAlternativeView) {
    //     const filteredPayload = result.payload.filter((item: any) =>
    //       VALID_LIST_IDS_All.includes(item.list_id)
    //     );
    //      formattedData = formatAnalyticsData(filteredPayload);
    //     return formatAnalyticsData(filteredPayload);
    //   }
    //   if(isAlternativeView){
    //     return aggregateData(result.payload);
    //   }
    //   return formatAnalyticsData(result.payload);
    // } else {
    //   return [];
    // }
    if (result.payload) {
      let formattedData: AnalyticsData[] | ComparisonData[] = [];
      let filteredPayload: any[] = [];

      if (listId === "all" && domain === "TravelWhale" && !isAlternativeView) {
        filteredPayload = result.payload.filter((item: any) =>
          VALID_LIST_IDS.includes(item.list_id)
        );
        formattedData = formatAnalyticsData(filteredPayload);
      } else if (listId === "all" && domain === "All" && !isAlternativeView) {
        filteredPayload = result.payload.filter((item: any) =>
          VALID_LIST_IDS_All.includes(item.list_id)
        );
        formattedData = formatAnalyticsData(filteredPayload);
      } else if (isAlternativeView) {
        formattedData = aggregateData(result.payload);
        filteredPayload = result.payload;
      } else {
        formattedData = formatAnalyticsData(result.payload);
        filteredPayload = result.payload;
      }

      return {
        formattedData,
        rawPayload: filteredPayload
      };
    } else {
      return {
        formattedData: [],
        rawPayload: []
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return {
          formattedData: [],
          rawPayload: []
        };;
      }
      console.log("API Error:", error.message);
    } else {
      console.log("Unknown error occurred:", error);
    }
    return{
      formattedData: [],
      rawPayload: []
    };;
  }
};

// export const processCountryData = (payload: any[]): CountryAnalyticsData[] => {
//   if (!payload || payload.length === 0) return [];
  
//   // Create an aggregation key using country and date
//   const aggregatedData: Record<string, CountryAnalyticsData> = {};
  
//   payload.forEach((item: any) => {
//     if (!item.list_id || !LIST_ID_TO_COUNTRY[item.list_id]) return;
    
//     const date = new Date(item.stats_date * 1000).toISOString().split("T")[0];
//     const country = LIST_ID_TO_COUNTRY[item.list_id];
    
//     // Create a unique key for each country-date combination
//     const key = `${country}_${date}`;
    
//     if (!aggregatedData[key]) {
//       aggregatedData[key] = {
//         date,
//         country,
//         totalSent: 0,
//         totalClicks: 0,
//         socialClicks: 0,
//         emailClicks: 0
//       };
//     }
    
//     // Aggregate the metrics
//     aggregatedData[key].totalSent += item.sent || 0;
//     aggregatedData[key].totalClicks += item.clicks || 0;
//     aggregatedData[key].socialClicks += item.social_clicks || 0;
//     aggregatedData[key].emailClicks += item.email_clicks || 0;
//   });
  
//   // Convert the aggregated data object to an array
//   return Object.values(aggregatedData).sort((a, b) => {
//     // Sort by country first
//     const countryComparison = a.country.localeCompare(b.country);
//     if (countryComparison !== 0) return countryComparison;
    
//     // Then sort by date (most recent first)
//     return new Date(b.date).getTime() - new Date(a.date).getTime();
//   });
// };

export const processCountryData = (payload: any[]): CountryAnalyticsData[] => {
  if (!payload || payload.length === 0) return [];
  
  // Create an aggregation key using country and date
  const aggregatedData: Record<string, CountryAnalyticsData> = {};
  
  payload.forEach((item: any) => {
    if (!item.list_id || !LIST_ID_TO_COUNTRY[item.list_id]) return;
    
    const date = new Date(item.stats_date * 1000).toISOString().split("T")[0];
    const country = LIST_ID_TO_COUNTRY[item.list_id];
    
    // Create a unique key for each country-date combination
    const key = `${country}_${date}`;
    
    if (!aggregatedData[key]) {
      aggregatedData[key] = {
        date,
        country,
        totalSent: 0,
        totalClicks: 0,
        socialClicks: 0,
        emailClicks: 0
      };
    }
    
    // Aggregate the metrics
    aggregatedData[key].totalSent += item.sent || 0;
    
    // Ensure we're correctly calculating social_clicks and email_clicks
    const socialClicks = item.social_clicks || 0;
    const emailClicks = item.clicks || 0;
    
    aggregatedData[key].socialClicks += socialClicks;
    aggregatedData[key].emailClicks += emailClicks;
    
    // Make sure totalClicks is the sum of socialClicks and emailClicks
    aggregatedData[key].totalClicks = aggregatedData[key].socialClicks + aggregatedData[key].emailClicks;
  });
  
  // Convert the aggregated data object to an array
  return Object.values(aggregatedData).sort((a, b) => {
    // Sort by country first
    const countryComparison = a.country.localeCompare(b.country);
    if (countryComparison !== 0) return countryComparison;
    
    // Then sort by date (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

function aggregateData(data: any): ComparisonData[] {
  const aggregatedResult: any = {};

  data.forEach((item: any) => {
    const { list_id, sent, clicks } = item;

    if (!aggregatedResult[list_id]) {
      aggregatedResult[list_id] = { list_id, total_sent: 0, total_clicks: 0 };
    }

    aggregatedResult[list_id].total_sent += sent;
    aggregatedResult[list_id].total_clicks += clicks;
  });

  return Object.values(aggregatedResult);
}

const formatAnalyticsData = (payload: any): AnalyticsData[] => {
  const aggregatedData: { [date: string]: AnalyticsData } = {};
  payload.forEach((item: any) => {
    // const formattedDate = item.stats_date
    //   ? new Intl.DateTimeFormat("en-GB", {
    //       day: "2-digit",
    //       month: "short",
    //       year: "numeric",
    //       timeZone: "UTC",
    //     })
    //       .format(new Date(item.stats_date * 1000))

    //   : "N/A";
    const formattedDate = new Date(item.stats_date * 1000)
      .toISOString()
      .split("T")[0];
    if (formattedDate !== "N/A") {
      if (!aggregatedData[formattedDate]) {
        aggregatedData[formattedDate] = {
          date: formattedDate,
          sent: 0,
          uniqueOpens: 0,
          totalClicks: 0,
          uniqueClicks: 0,
          ctr: 0,
          uctr: 0,
          ctrrate: 0,
          uctrrate: 0,
          count: 0,
        };
      }
      aggregatedData[formattedDate].sent += item.sent;
      aggregatedData[formattedDate].uniqueOpens += item.unique_opens;
      aggregatedData[formattedDate].totalClicks += item.clicks;
      aggregatedData[formattedDate].uniqueClicks += item.unique_clicks;
      aggregatedData[formattedDate].ctr += item.ctr;
      aggregatedData[formattedDate].uctr += item.uctr;
      aggregatedData[formattedDate].count += 1;
      aggregatedData[formattedDate].ctrrate = (aggregatedData[formattedDate].ctr / aggregatedData[formattedDate].count);
      aggregatedData[formattedDate].uctrrate = (aggregatedData[formattedDate].uctr / aggregatedData[formattedDate].count);
    }
  });
  console.log('aggregatedData.sent', aggregatedData)
  return Object.values(aggregatedData).sort((a, b) => {
    // Sort in descending order (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};
