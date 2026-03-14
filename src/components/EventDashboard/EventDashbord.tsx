
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions, ChartEvent, Chart, LegendItem, LegendElement } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
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
import "@/components/AnalyticsDashboard/AnalyticsDashboard.css";
import { fetchSegmentData } from "./EventDataService";
import { SegmentData } from "./EventType";
import SegmentTable from "./EventTable";
import EventFilters from "./EventFilter";
import AccordionWithSegmentTable from "./EventDataList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import EventAccordion from "./EventDataList";
import axios from "axios";
import {
  setEndDate,
  setIsAlternativeView,
  setListId,
  setStartDate,
  setTimePeriod,
} from "@/store/appSlice";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

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
type EventStatus = 'Active' | 'Inactive' | 'Pending';
interface FrequencyInfo {
  hours?: number;
  throttling_type?: string;
}
interface EventMetadata {
  status: EventStatus;
  frequency?: FrequencyInfo;
}

const EventDashBoard: React.FC<AnalyticsDashboardProps> = ({
  type,
  countries,
  esps,
  domains,
}) => {
  const [rowData, setRowData] = useState<SegmentData[]>([]);
  const [filteredRowData, setFilteredRowData] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [filterChanged, setFilterChanged] = useState<boolean>(false);
  const [statusMap, setStatusMap] = useState<{ [key: string]: EventStatus }>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const [eventMetadataMap, setEventMetadataMap] = useState<{ [key: string]: EventMetadata }>({});
  const dispatch = useAppDispatch();
  const timePeriod = useAppSelector((state) => state.app.timePeriod);
  const listId = useAppSelector((state) => state.app.listId);
  const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
  const startDate = useAppSelector((state) => state.app.startDate);
  const endDate = useAppSelector((state) => state.app.endDate);
  const country = useAppSelector((state) => state.app.country);
  const esp = useAppSelector((state) => state.app.esp);
  const domain = useAppSelector((state) => state.app.domain);
  const status = useAppSelector((state) => state.app.status);
  const eventDomain = useAppSelector((state) => state.app.eventDomain);
  const [showCalendar, setShowCalendar] = useState(false); const [showLabels, setShowLabels] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const prevFiltersRef = useRef({ country, domain, esp });

  const columnDefsStandard: ColDef[] = [
    {
      headerName: "Event Name",
      field: "event_name",
      sortable: true,
      filter: true,
      tooltipField: "event_name",
    },
    {
      headerName: "Event ID",
      field: "event_id",
      hide: true
    },
    {
      headerName: "List ID",
      field: "list_id",
      hide: true
    },
    {
      headerName: "Sent",
      field: "sent",
      sortable: true,
      filter: true,
      // tooltipField: "Sent", 
      valueFormatter: (params) =>
        params.value ? Number(params.value).toLocaleString() : params.value,
    },
    {
      headerName: "Hard Bounces",
      field: "hardBounces", // Updated field name
      sortable: true,
      filter: true,
      // tooltipField: "Hard Bounces",
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
      headerName: "Soft Bounces",
      field: "softBounces", // Updated field name
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
      headerName: "Unsubscribes",
      field: "unsubscribes",
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
      headerName: "Total Opens",
      field: "totalOpens", // Updated field name
      sortable: true,
      filter: true,
      // tooltipField: "Total Opens",
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
      headerName: "Unique Opens",
      field: "uniqueOpens",
      sortable: true,
      filter: true,
      // tooltipField: "Unique Opens",
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
      // tooltipField: "Total Clicks",
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
      // tooltipField: "Unique Clicks",
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
  const getListIdByFilters = (
    country: string | null,
    domain: string | null,
    esp: string | null
  ): string | number | null => {
    // Define your mapping logic here
    console.log("country", country, domain, esp);
    if ((domain && domain !== "All") && (esp && esp !== "All") && (!country || country === "All")) {
      return null; // This will trigger an error state
    }

    // Return "all" if all filters are "All" or null
    if ((!country || country === "All") && (!domain || domain === "All") && (!esp || esp === "All")) {
      return "all";
    }
    if (
      country === "NL Netherland" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 203540;
    } else if (
      country === "DE Germany" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 217478;
    } else if (
      country === "DK Denmark" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 1259703;
    } else if (
      country === "FR France" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 1261035;
    } else if (
      country === "SE Sweden" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 1260311;
    } else if (
      country === "UK England" &&
      domain === "TravelWhale" &&
      esp === "Ongage"
    ) {
      return 1261054;
    }
    else if (
      country === "NL Netherland"
      && domain === "FavoTrip"
      && esp === "Ongage") {
      return 242740;
    } else {
      return "all"; // Default to "all" if no match
    }
  };
  const getEventKey = (event_id: string, list_id: number): string => {
    return `${event_id}_${list_id}`;
  };
  const fetchEventMetadata = async (event_id: string, list_id: number): Promise<EventMetadata> => {
    try {
      const response = await axios.post("/api/ongage/event-status", { event_id, list_id });
      const { status_desc, time_to_send_config } = response.data;

      // Make sure the returned status exactly matches one of your filter options
      let status: EventStatus;
      if (status_desc === "Active" || status_desc === "Inactive") {
        status = status_desc;
      } else if (status_desc === "active" || status_desc?.toLowerCase().includes("active")) {
        status = "Active";
      } else if (status_desc === "inactive" || status_desc?.toLowerCase().includes("inactive")) {
        status = "Inactive";
      } else {
        status = "Pending";
      }

      let frequency: FrequencyInfo | undefined;
      if (time_to_send_config?.throttling) {
        frequency = {
          hours: time_to_send_config.throttling.hours,
          throttling_type: time_to_send_config.throttling.throttling_type
        };
      }

      return { status, frequency };
    } catch (error: any) {
      const apiError = error?.response?.data;
      const isMissingEvent = apiError?.payload?.code === 412 ||
        apiError?.payload?.message?.includes("Event does not exist");

      if (isMissingEvent) {
        return { status: 'Pending' };
      }


      return { status: 'Pending' };
    } // fallback to 'pending' for any unexpected error

  };
  const fetchAndSetData = async () => {
    // Cancel any ongoing request
    if (!isInitialLoad && validationError) {
      return; // Don't fetch data if there's a validation error
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setRowData([]); // Clear old data immediately

    try {
      const data = await fetchSegmentData(
        timePeriod,
        listId,
        startDate,
        endDate,
        isAlternativeView,
        country,
        domain,
        esp,
        type,
        eventDomain,
        signal
      );

      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setRowData(data);

        const updatedStatusMap: Record<string, EventStatus> = {};
        const updatedMetadataMap: Record<string, EventMetadata> = {};
        await Promise.all(
          data.map(async (event: SegmentData) => {
            const eventMetadata = await fetchEventMetadata(event.event_id, event.list_id);
            const eventKey = getEventKey(event.event_id, event.list_id);

            updatedStatusMap[eventKey] = eventMetadata.status;
            updatedMetadataMap[eventKey] = eventMetadata;

            return { eventKey, eventMetadata };
          })
        );
        console.log("Updated status map:", updatedStatusMap);
        console.log("Updated metadata map:", updatedMetadataMap);

        setStatusMap(updatedStatusMap);
        setEventMetadataMap(updatedMetadataMap);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
        } else {
          console.log('Error fetching segment data:', error.message);
        }
      } else {
        console.log('Unknown error occurred:', error);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setIsInitialLoad(false);
        setFilterChanged(false);
      }
    }
  };

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
    if (newlistId === null && hasUserInteracted && !isInitialLoad && filtersChanged) {
      setValidationError("Please select a country when domain and ESP are specified.");
      setRowData([]); // Clear data
      setStatusMap({});
      setEventMetadataMap({});
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

  // useEffect(() => {
  //   if (!isInitialLoad) {
  //     setHasUserInteracted(true);
  //   }
  // }, [isInitialLoad]);

  // Fetch data when dependencies change
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
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
  }, [timePeriod, listId, isAlternativeView, startDate, endDate, country, domain, esp, type, eventDomain, validationError, isInitialLoad, hasUserInteracted]);

  useEffect(() => {
    console.log("Status filter triggered:", status);
    console.log("Current statusMap:", statusMap);
    console.log("Row data length:", rowData.length);

    if (status === "Both" || !status) {
      setFilteredRowData(rowData);
    } else {
      const filtered = rowData.filter(event => {
        const eventKey = getEventKey(event.event_id, event.list_id);
        const eventStatus = statusMap[eventKey];
        console.log(`Event ${event.event_id}, Status: ${eventStatus}, Looking for: ${status}`);
        return eventStatus === status;
      });
      console.log("Filtered data length:", filtered.length);
      setFilteredRowData(filtered);
    }
  }, [rowData, statusMap, status]);

  const totalSummary = {
    totalSent: rowData.reduce((sum, row) => sum + row.sent, 0),
    totalUniqueOpens: rowData.reduce((sum, row) => sum + row.uniqueOpens, 0),
    totalClicks: rowData.reduce((sum, row) => sum + row.totalClicks, 0),
    totalUniqueClicks: rowData.reduce((sum, row) => sum + row.uniqueClicks, 0),
    totalHardBounces: rowData.reduce((sum, row) => sum + row.hardBounces, 0),
    totalSoftBounces: rowData.reduce((sum, row) => sum + row.softBounces, 0),
    totalOpens: rowData.reduce((sum, row) => sum + row.totalOpens, 0),
    totalUnsubscribes: rowData.reduce((sum, row) => sum + row.unsubscribes, 0),
  };

  const chartData = {
    labels: rowData.map((item) => item.segment_name), // X-axis (Dates)
    datasets: [
      {
        label: "Sent",
        data: rowData.map((item) => item.sent),
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
      },
      {
        label: "Unique Opens",
        data: rowData.map((item) => item.uniqueOpens),
        backgroundColor: "rgba(128, 183, 18, 0.6)", // Teal
      },
      {
        label: "Total Clicks",
        data: rowData.map((item) => item.totalClicks),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
      },
      {
        label: "Unique Clicks",
        data: rowData.map((item) => item.uniqueClicks),
        backgroundColor: "rgba(255, 205, 86, 0.6)", // Yellow
      },
      {
        label: "Hard Bounces",
        data: rowData.map((item) => item.hardBounces),
        backgroundColor: "rgba(18, 234, 119, 0.6)", // Yellow
      },
      {
        label: "Soft Bounces",
        data: rowData.map((item) => item.softBounces),
        backgroundColor: "rgba(238, 87, 11, 0.6)", // Yellow
      },
      {
        label: "Total Opens",
        data: rowData.map((item) => item.totalOpens),
        backgroundColor: "rgb(255, 187, 40)", // Yellow
      },
      {
        label: "Unsubscribes",
        data: rowData.map((item) => item.unsubscribes),
        backgroundColor: "rgba(5, 36, 72, 0.6)", // Yellow
      },
    ],
  };

  const chartCrtData = {
    labels: rowData.map((item) => item.segment_name), // X-axis (Dates)
    datasets: [
      {
        label: "CTR",
        data: rowData.map((item) => item.ctrrate),
        backgroundColor: "rgb(2, 122, 184)", // Blue
      },
      {
        label: "UCTR",
        data: rowData.map((item) => item.uctrrate),
        backgroundColor: "rgb(255, 187, 40)", // Teal
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Email Campaign Analytics" },
    },
    scales: {
      x: { title: { display: true, text: "Event Name" }, grid: { display: false } },
      y: { title: { display: true, text: "Value" }, beginAtZero: true },
    },
    onHover: (event: any, chartElement: any) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
  };

  const optionsCtr = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Email Campaign Analytics" },
    },
    scales: {
      x: {
        title: { display: true, text: "Event Name" },
        grid: { display: false },
      },
      y: { title: { display: true, text: "Value (%)" }, beginAtZero: true },
    },
    onHover: (event: any, chartElement: any) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
  };

  return (
    <div className="gap-4 flex flex-col">
      <EventFilters />
      <div>
        {/* <p className="ml-4 font-semibold">Segment Count :</p> */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationError}
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data....</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {/* EventAccordion */}
            <div className="px-4">
              <EventAccordion rowData={filteredRowData as SegmentData[]} preloadedStatusMap={statusMap}
                preloadedFrequencyMap={eventMetadataMap} />
            </div>

            {/* <SegmentTable
              rowData={rowData as SegmentData[]}
              columnDefs={columnDefsStandard}
              loading={loading}
            /> */}

            <div className={`flex  gap-8 p-4 flex-col`}>
              <div
                style={{ height: "400px", width: "100%" }}
                className="shadow-sm border border-gray-100 "
              >
                <Bar data={chartData} options={options} className="p-4" />
              </div>
              <div
                style={{ height: "400px", width: "100%" }}
                className="shadow-sm border border-gray-100"
              >
                <Bar data={chartCrtData} options={optionsCtr} className="p-4" />
              </div>
            </div>

            <div className="mt-4 px-4">
              <div className="grid grid-cols-4 gap-4 mb-2 mt-4">
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Total Sent</h3>
                  <p>{totalSummary.totalSent.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Total Unique Opens</h3>
                  <p>{totalSummary.totalUniqueOpens.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Total Clicks</h3>
                  <p>{totalSummary.totalClicks.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Unique Clicks</h3>
                  <p>{totalSummary.totalUniqueClicks.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Hard Bounces</h3>
                  <p>{totalSummary.totalHardBounces.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Soft Bounces</h3>
                  <p>{totalSummary.totalSoftBounces.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Total Opens</h3>
                  <p>{totalSummary.totalOpens.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded text-center">
                  <h3 className="font-bold">Unsubscribes</h3>
                  <p>{totalSummary.totalUnsubscribes.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDashBoard;