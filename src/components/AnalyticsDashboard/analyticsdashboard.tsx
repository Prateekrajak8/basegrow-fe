// /Users/prateekrajak/Desktop/Basegrow/basgrow-admin-panel/src/app/components/AnalyticsDashboard/analyticsdashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ColDef,
  CustomFilterModule,
  DateFilterModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  TextFilterModule,
  ValidationModule,
} from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import AnalyticsSummary from "../AnalyticsSummary/analyticssummary";
import "./AnalyticsDashboard.css";
import AnalyticsFilters from "./AnalyticsFilters";
import AnalyticsTable from "./AnalyticsTable";
import { fetchAnalyticsData, processCountryData } from "./AnalyticsDataService";
import { AnalyticsData, ComparisonData, CountryAnalyticsData } from "./types";
import AnalyticsComparisonTable from "./AnalyticsComparisonTable";
import AnalyticsCountryTable from "./CountyAnalyticsTable";
import AnalyticsChart from "./AnalyticsChart";
import Navbar from "../TopNavBar/Navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEndDate, setIsAlternativeView, setListId, setStartDate, setTimePeriod } from "@/store/appSlice";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  TextFilterModule,
  CustomFilterModule,
]);

interface AnalyticsDashboardProps {
  type: string;
  countries?: string | null;
  esps?: string | null;
  domains?: string | null;
}
// Updated getListIdByFilters function with validation
const getListIdByFilters = (
  country: string | null,
  domain: string | null,
  esp: string | null
): string | number | null => {
  // If domain and ESP have values but country is null/empty, return null to indicate error
  if ((domain && domain !== "All") && (esp && esp !== "All") && (!country || country === "All")) {
    return null; // This will trigger an error state
  }

  // Return "all" if all filters are "All" or null
  if ((!country || country === "All") && (!domain || domain === "All") && (!esp || esp === "All")) {
    return "all";
  }

  // Specific combinations
  if (country === "NL Netherland" && domain === "TravelWhale" && esp === "Ongage") {
    return 203540;
  } else if (country === "DE Germany" && domain === "TravelWhale" && esp === "Ongage") {
    return 217478;
  } else if (country === "DK Denmark" && domain === "TravelWhale" && esp === "Ongage") {
    return 1259703;
  } else if (country === "FR France" && domain === "TravelWhale" && esp === "Ongage") {
    return 1261035;
  } else if (country === "SE Sweden" && domain === "TravelWhale" && esp === "Ongage") {
    return 1260311;
  } else if (country === "UK England" && domain === "TravelWhale" && esp === "Ongage") {
    return 1261054;
  } else if (country === "NL Netherland" && domain === "FavoTrip" && esp === "Ongage") {
    return 242740;
  } else if (country === "All" && domain === "TravelWhale" && esp === "Ongage") {
    return "all";
  } else if (country === "All" && domain === "All" && esp === "Ongage") {
    return "all";
  } else {
    return "all"; // Default to "all" if no match
  }
};
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ type, countries, esps, domains }) => {
  const [rowData, setRowData] = useState<AnalyticsData[] | ComparisonData[]>([]);
  const [countryData, setCountryData] = useState<CountryAnalyticsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [filterChanged, setFilterChanged] = useState<boolean>(false);
   const [validationError, setValidationError] = useState<string | null>(null); // New error state
 const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false); // Track user interaction

  const abortControllerRef = useRef<AbortController | null>(null);
  const dispatch = useAppDispatch();
  const timePeriod = useAppSelector((state) => state.app.timePeriod);
  const listId = useAppSelector((state) => state.app.listId);
  const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
  const startDate = useAppSelector((state) => state.app.startDate);
  const endDate = useAppSelector((state) => state.app.endDate);
  const country = useAppSelector((state) => state.app.country);
  const esp = useAppSelector((state) => state.app.esp);
  const domain = useAppSelector((state) => state.app.domain);

   const prevFiltersRef = useRef({ country, domain, esp });

  const columnDefsStandard: ColDef[] = [
    { headerName: "Date", field: "date", sortable: true, filter: true },
    {
      headerName: "Sent",
      field: "sent",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? Number(params.value).toLocaleString() : params.value,
    },
    {
      headerName: "Unique Opens",
      field: "uniqueOpens",
      sortable: true,
      filter: true,
      // valueFormatter: (params) =>
      //   params.value ? Number(params.value).toLocaleString() : params.value,
      valueFormatter: (params) => {
        const sent = params.data?.sent || 0;
        const value = params.value || 0;
        const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
        return `${value.toLocaleString()} (${percentage}%)`;
      },
    },
    {
      headerName: "Total Clicks",
      field: "totalClicks",
      sortable: true,
      filter: true,
      // valueFormatter: (params) =>
      //   params.value ? Number(params.value).toLocaleString() : params.value,
      valueFormatter: (params) => {
        const sent = params.data?.sent || 0;
        const value = params.value || 0;
        const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
        return `${value.toLocaleString()} (${percentage}%)`;
      },
    },
    {
      headerName: "Unique Clicks",
      field: "uniqueClicks",
      sortable: true,
      filter: true,
      // valueFormatter: (params) =>
      //   params.value ? Number(params.value).toLocaleString() : params.value,
      valueFormatter: (params) => {
        const sent = params.data?.sent || 0;
        const value = params.value || 0;
        const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
        return `${value.toLocaleString()} (${percentage}%)`;
      },
    },
  ];

  const columnDefsAlternative: ColDef[] = [
    { headerName: "Metric", field: "metric", pinned: "left" },
    { headerName: "Total sent", field: "total_sent" },
    { headerName: "Total clicks", field: "total_clicks" },
  ];

  // const getListIdByFilters = (
  //   country: string | null,
  //   domain: string | null,
  //   esp: string | null
  // ): string | number => {
  //   // Return "merge" if both country and domain are "all"
  //   if (country === "NL Netherland" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 203540;
  //   } else if (country === "DE Germany" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 217478;
  //   } else if (country === "DK Denmark" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 1259703;
  //   } else if (country === "FR France" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 1261035;
  //   } else if (country === "SE Sweden" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 1260311;
  //   } else if (country === "UK England" && domain === "TravelWhale" && esp === "Ongage") {
  //     return 1261054;
  //   }
  //   else if (country === "NL Netherland" && domain === "FavoTrip" && esp === "Ongage") {
  //     return 242740;
  //   }
  //   else if (country === "All" && domain === "TravelWhale" && esp === "Ongage") {
  //     return "all";
  //   }
  //   else if (country === "All" && domain === "All" && esp === "Ongage") {
  //     return "all";
  //   }
  //   else {
  //     return "all"; // Default to "all" if no match
  //   }
  // };

  // const fetchAndSetData = async () => {
  //    if (validationError) {
  //     return; // Don't fetch data if there's a validation error
  //   }

  //   // Cancel any ongoing request
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //   }

  //   // Create new AbortController for this request
  //   abortControllerRef.current = new AbortController();
  //   const signal = abortControllerRef.current.signal;

  //   setLoading(true);
  //   setRowData([]); // Clear old data immediately
  //   setCountryData([]);
  //   try {
  //     const { formattedData, rawPayload } = await fetchAnalyticsData(
  //       timePeriod,
  //       listId,
  //       startDate,
  //       endDate,
  //       isAlternativeView,
  //       country,
  //       domain,
  //       esp,
  //       type,
  //       signal
  //     );

  //     // Only update state if the request wasn't aborted
  //     if (!signal.aborted) {
  //       setRowData(formattedData);
  //        const processedCountryData = processCountryData(rawPayload);
  //       setCountryData(processedCountryData);
      
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       if (error.name === 'AbortError') {
  //         console.log('Request was aborted');
  //       } else {
  //         console.log('Error fetching analytics data:', error.message);
  //       }
  //     } else {
  //       console.log('Unknown error occurred:', error);
  //     }
  //   } finally {
  //     if (!signal.aborted) {
  //       setLoading(false);
  //       setIsInitialLoad(false);
  //       setFilterChanged(false);
  //     }
  //   }
  // };

  // Cleanup function to cancel any ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update listId when filters change
  // useEffect(() => {
  //   const newlistId = getListIdByFilters(country, domain, esp);
  //   dispatch(setListId(newlistId));
  //   setFilterChanged(true);
  // }, [country, domain, esp, dispatch]);
// Updated useEffect for filter validation - only validate after initial load
useEffect(() => {
  // Check if filters have actually changed from previous values
  const filtersChanged = 
    prevFiltersRef.current.country !== country ||
    prevFiltersRef.current.domain !== domain ||
    prevFiltersRef.current.esp !== esp;

  // Update previous values
  prevFiltersRef.current = { country, domain, esp };

  // Mark that user has interacted if filters changed and it's not initial load
  if (filtersChanged && !isInitialLoad) {
    setHasUserInteracted(true);
  }

  const newlistId = getListIdByFilters(country, domain, esp);
  
  // Only show validation error if:
  // 1. User has interacted with filters AND
  // 2. Initial load is complete AND
  // 3. listId is null (validation failed)
  if (newlistId === null && hasUserInteracted && !isInitialLoad) {
    setValidationError("Please select a country when domain and ESP are specified.");
    setRowData([]); // Clear data
    setCountryData([]);
  } else {
    // Clear validation error and set listId only if it's not null
    setValidationError(null);
    if (newlistId !== null) {
      dispatch(setListId(newlistId));
    }
    
    // Only set filter changed if it's not the initial load
    if (!isInitialLoad) {
      setFilterChanged(true);
    }
  }
}, [country, domain, esp, dispatch, hasUserInteracted, isInitialLoad]);

// Updated fetchData effect - don't check validation error during initial load
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    if (!isMounted) return;
    
    // Only check validation error after initial load is complete
    if (!isInitialLoad && validationError && hasUserInteracted) {
      return;
    }

    if (isInitialLoad) {
      await fetchAndSetData();
      return;
    }

    // For custom date range, only fetch if both dates are set
    if (timePeriod === "custom") {
      if (startDate && endDate) {
        await fetchAndSetData();
      }
    } else {
      await fetchAndSetData();
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, [timePeriod, listId, isAlternativeView, startDate, endDate, country, domain, esp, type, validationError, isInitialLoad, hasUserInteracted]);

// Updated fetchAndSetData function - don't check validation during initial load
const fetchAndSetData = async () => {
  // Only check validation error after initial load
  if (!isInitialLoad && validationError) {
    return; // Don't fetch data if there's a validation error
  }

  // Cancel any ongoing request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  // Create new AbortController for this request
  abortControllerRef.current = new AbortController();
  const signal = abortControllerRef.current.signal;

  setLoading(true);
  setRowData([]); // Clear old data immediately
  setCountryData([]);
  
  try {
    const { formattedData, rawPayload } = await fetchAnalyticsData(
      timePeriod,
      listId,
      startDate,
      endDate,
      isAlternativeView,
      country,
      domain,
      esp,
      type,
      signal
    );

    // Only update state if the request wasn't aborted
    if (!signal.aborted) {
      setRowData(formattedData);
      const processedCountryData = processCountryData(rawPayload);
      setCountryData(processedCountryData);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.log('Error fetching analytics data:', error.message);
      }
    } else {
      console.log('Unknown error occurred:', error);
    }
  } finally {
    if (!signal.aborted) {
      setLoading(false);
      setIsInitialLoad(false); // Mark initial load as complete
      setFilterChanged(false);
    }
  }
};

  const totalSummary = {
    totalSent: rowData.reduce(
      (sum, row) => sum + (row as AnalyticsData).sent,
      0
    ),
    totalUniqueOpens: rowData.reduce(
      (sum, row) => sum + (row as AnalyticsData).uniqueOpens,
      0
    ),
    totalClicks: rowData.reduce(
      (sum, row) => sum + (row as AnalyticsData).totalClicks,
      0
    ),
    totalUniqueClicks: rowData.reduce(
      (sum, row) => sum + (row as AnalyticsData).uniqueClicks,
      0
    ),
  };
const showCountryTable = !isAlternativeView && countryData.length > 0;
  return (
    <div className="gap-4 flex flex-col  w-full max-w-full ">
      <AnalyticsFilters />
        {validationError &&  hasUserInteracted &&(
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data....</span>
        </div>
      ) :   (
        <>
          <div className="flex flex-col gap-4 w-full">
            {isAlternativeView ? (
              <AnalyticsComparisonTable
                rowData={rowData as ComparisonData[]}
                loading={loading}
              />
            ) : (
              <>
                <AnalyticsTable
                  rowData={rowData as AnalyticsData[]}
                  columnDefs={columnDefsStandard}
                  loading={loading}
                />
                  {showCountryTable && (
                  <AnalyticsCountryTable
                    data={countryData}
                    loading={loading}
                  />
                )}
                <AnalyticsChart
                  data={rowData as AnalyticsData[]}
                  loading={loading}
                />
                <div className="mt-4 px-4">
                  <AnalyticsSummary
                    totalSent={totalSummary.totalSent}
                    totalOpens={totalSummary.totalUniqueOpens}
                    totalClicks={totalSummary.totalClicks}
                    totalUniqueClicks={totalSummary.totalUniqueClicks}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
