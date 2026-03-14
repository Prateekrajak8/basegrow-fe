"use client";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { ChartOptions, ChartEvent, Chart, LegendItem, LegendElement } from "chart.js";
import DatePicker from "react-datepicker";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import "react-datepicker/dist/react-datepicker.css";
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
import { SegmentData } from "./SegmentType";
import SegmentTable from "@/components/SegmentDashboard/SegmentTable";
import SegmentFilters from "./SegmentFilter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setEndDate,
    setIsAlternativeView,
    setListId,
    setStartDate,
    setTimePeriod,
} from "@/store/appSlice";
import axios from "axios";
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
    eventName?: string | null;
}

interface SMTP {
    id: string;
    esp_id: string;
    esp_name: string;
    support_transactional: string;
    name: string; // Add domain property
}
const SegmentDashboard: React.FC<AnalyticsDashboardProps> = ({
    type,
    countries,
    esps,
    domains,
    // eventName
}) => {
    const [rowData, setRowData] = useState<SegmentData[]>([]);
    const [segmentData, setSegmentData] = useState<SegmentData[]>([]);
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const timePeriod = useAppSelector((state) => state.app.timePeriod);
    const listId = useAppSelector((state) => state.app.listId);
    const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
    const startDate = useAppSelector((state) => state.app.startDate);
    const endDate = useAppSelector((state) => state.app.endDate);
    const country = useAppSelector((state) => state.app.country);
    const esp = useAppSelector((state) => state.app.esp);
    const domain = useAppSelector((state) => state.app.domain);
    const [showCalendar, setShowCalendar] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showLabels, setShowLabels] = useState(false);
    const event_id = searchParams.get("eventId") || "null";
    const [eventStatus, setEventStatus] = useState("");
    const [segmentCount, setSegmentCount] = useState<number | null>(null);
    const [smtpData, setSmtpData] = useState<SMTP[]>([]);
    const [selectedSmtp, setSelectedSmtp] = useState<SMTP | null>(null);
    const [selectedSmtpId, setSelectedSmtpId] = useState<Number | null>(null);
    const [segmentCounts, setSegmentCounts] = useState<{ [key: number]: number }>({});
    const eventName = searchParams.get("eventName") || "null";
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/ongage/get-esp-connection');
                // const smtpDatas = Array.isArray(response.data.payload) ? response.data : response.data?.data || [];
                const smtpDatas = response.data.payload;
                setSmtpData(smtpDatas);
                // setSmtpData(smtpDatas);
                console.log(smtpDatas, 'SMTP data');
            } catch (error) { console.log('Error fetching SMTP data:', error); }
        };

        fetchData();
    }, []);
   

    const columnDefsStandard: ColDef[] = [
        {
            headerName: "Date",
            field: "date",
            sortable: true,
            filter: true,
            tooltipField: "date",
        },
        {
            field: "list_id",
            headerName: "List ID",
            hide: true
        },
        {
            field: "segment_id",
            headerName: "Segment ID",
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
    ): string | number => {
        // Return "all" if either country or domain is "all"
        if (country === "all" || domain === "all") {
            return "all";
        }

        // Define your mapping logic here
        console.log("country", country, domain, esp);
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
        }
        else if (country === "All" && domain === "TravelWhale" && esp === "Ongage") {
            return "all";
        }
        else if (country === "All" && domain === "All" && esp === "Ongage") {
            return "all";
        }
        else {
            return "all"; // Default to "all" if no match
        }
    };
    const fetchAndSetData = async () => {
        setLoading(true);
        const data = await fetchSegmentData(
            timePeriod,
            // listId,
            startDate,
            endDate,
            // isAlternativeView,
            // country,
            // domain,
            // esp,
            // type,
            eventName ?? null,
            // selectedSmtpId ?? null,
            listId?? null
        );
        setRowData(data);
        const rawSegmentData: SegmentData[] = data || [];
        const seen = new Set<string>();
        const uniqueRows: SegmentData[] = rawSegmentData.filter((item) => {
          const key = `${item.segment_id}-${item.list_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
  
          setSegmentData(uniqueRows);
        //   const countsMap: { [key: string]: number } = {};
        //   for (const row of uniqueRows) {
        //     try {
        //       const res = await axios.post('/api/ongage/segement-count', {
        //         list_id: row.list_id,
        //         segment_id: row.segment_id,
        //       });
    
        //       const count = res?.data?.metadata?.total;
        //       const key = `${row.segment_id}-${row.segment_name}`;
        //     //   countsMap[key] = count;
        //       countsMap[key] = count === null ? 'N/A' : count;
        //     } catch (err) {
        //       console.log(`Failed to fetch count for segment ${row.segment_id}`, err);
        //     }
        //   }
    
        //   setSegmentCounts(countsMap);
        setLoading(false);
    };
    useEffect(() => {
        const fetchSegmentCounts = async () => {
            const countsMap: { [key: number]: number } = {};

            for (const row of segmentData) {
                try {
                    const res = await axios.post('/api/ongage/segement-count', {
                        list_id: row.list_id,
                        segment_id: row.segment_id
                    });

                    // Assuming API returns { count: number }
                    // countsMap[row.segment_id] = res.data.total;
                    const count = res?.data?.metadata?.total;
                    console.log(res.data, "res for count")
                    console.log(count, "count")
                    countsMap[row.segment_id] = count === null ? 'N/A' : count;
                } catch (err) {
                    console.log(`Failed to fetch count for segment ${row.segment_id}`, err);
                }
            }

            setSegmentCounts(countsMap);
        };

        if (segmentData.length > 0) {
            fetchSegmentCounts();
        }
    }, [segmentData]);
    useEffect(() => {
        const newlistId = getListIdByFilters(country, domain, esp);
        console.log("lis id..........................", newlistId);
        dispatch(setListId(newlistId));
    }, [country, domain, esp]);

    useEffect(() => {
        if (timePeriod === "custom") {
            if (startDate && endDate) {
                fetchAndSetData();
                console.log(startDate, "startDate");
                console.log(endDate, "endDate");
            }
        } else {
            fetchAndSetData();
        }
    }, [
        timePeriod,
        listId,
        isAlternativeView,
        startDate,
        endDate,
        country,
        domain,
        esp,
        type,
        eventName,
        selectedSmtpId
    ]);

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
    const smtpOptions = [
        { value: "MB Shared", label: "MB Shared" },
        { value: "MB Dedicated", label: "MB Dedicated" },
        // { value: "last_30_days", label: "Last 30 Days" },
        // { value: "all_time", label: "All Time" },
        // { value: "custom", label: "Custom" },
    ];
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
    const baroptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Email Campaign Analytics" },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
        },
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
    const handleSmtpChange = (value: any) => {
        console.log("Selected SMTP ID:", value);
        setSelectedSmtp(value);
        // dispatch(setSmtpId(id));
        setSelectedSmtpId(value?.id);
        console.log("Selected SMTP ID:", value);

        // You can add more logic here
        // For example, fetch more data based on selection
        // or trigger some other state updates
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Email Campaign Analytics" },
        },
        scales: {
            x: { title: { display: true, text: "Segment Name" }, grid: { display: false } },
            y: { title: { display: true, text: "Value" }, beginAtZero: true },
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
        },
    };

    const pieoptions: ChartOptions<"pie"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLabels, // Hide labels initially
            },
            title: {
                display: showLabels, // Hide title initially
                text: "Email Campaign Analytics",
            },
        },
        onClick: (event: ChartEvent) => {
            setShowLabels(true); // Show labels when clicking anywhere on the chart
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
                title: { display: true, text: "Segment Name" },
                grid: { display: false },
            },
            y: { title: { display: true, text: "Value (%)" }, beginAtZero: true },
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
        },
    };
    // const handleSmtpChange = (value: SMTP) => {
    //   setSelectedSmtp(value);
    //   console.log('Selected SMTP:', value);
    // };
console.log("row data in segment dashboard",rowData)
    return (
        <div className="gap-4 flex flex-col">
            <div className="flex gap-4 rounded  p-4">
                <div className="flex gap-8 rounded border border-gray-100 p-4">
                    <div className="mt-4 p-2 rounded ">
                        {/* <h2 className="text-lg font-bold mb-2">Segments:</h2> */}
                        <h3 className="text-lg font-bold mb-2">Segment Name</h3>
                        {segmentData.map((row, index) => (
                            <div  key={`${row.segment_id}-${row.list_id}`} className="mb-2 ">
                                <p> {row.segment_name}</p>
                                {/* <p><strong>Count:</strong> {segmentCounts[row.segment_id] ?? 'Loading...'}</p> */}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-2">
                        {/* <h2 className="text-lg font-bold mb-2">Segments:</h2> */}
                        <h3 className="text-lg font-bold mb-2">Segment Count</h3>
                        
                        {segmentData.map((row, index) => (
                            <div key={index} className="mb-2 ">
                              
                                <p> {segmentCounts[row.segment_id] ?? 'Loading...'}</p>
                            </div>
                        ))}
                        
                    </div>
                </div>
            </div>
            <div className="flex ">
                <SegmentFilters />
                <div className="flex">
                    <div className="flex gap-4 items-center">
                        <div className="flex px-2 gap-4 items-center relative"> {/* Add relative positioning here */}
                            {/* <Listbox value={selectedSmtp} onChange={handleSmtpChange}> */}
                            <Listbox value={selectedSmtp} onChange={handleSmtpChange}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 mt-2 focus:outline-none">
                                        <span className="block truncate">
                                            {selectedSmtp ? selectedSmtp.name : "Select SMTP"}
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-100 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
                                        {smtpData.map((option) => (
                                            <Listbox.Option
                                                key={option.id}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"}`
                                                }
                                                value={option}  // Pass the whole object here
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                            {option.name}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-3 flex items-center text-blue-600">
                                                                <ChevronUpDownIcon className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>

                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center">Loading Data...</div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        <SegmentTable
                            rowData={rowData as SegmentData[]}
                            columnDefs={columnDefsStandard}
                            loading={loading}
                        />
                        <div className={`flex  gap-8 p-4 flex-col`}>
                            <div
                                style={{ height: "400px", width: "100%" }}
                                className="shadow-sm border border-gray-100 "
                            >
                                <Bar data={chartData} options={options} className="p-4" />
                            </div>
                            {/* <div
                style={{ height: "400px", width: "100%" }}
                className="shadow-sm border border-gray-100 "
              >
                <Line data={chartData} options={options} className="p-4" />
              </div> */}
                            {/* <div
                style={{ height: "400px", width: "100%" }}
                className="shadow-sm border border-gray-100 "
              >
                <Bar data={chartData} options={baroptions} className="p-4" />
              </div> */}
                            {/* <div
                style={{ height: "400px", width: "100%" }}
                className="shadow-sm border border-gray-100 flex flex-col "
              >

                <Pie data={chartData} options={pieoptions} className="p-4" />
               
                <div className="mt-2">
                  <h2 className="text-xl font-bold text-gray-800">Email Campaign Analytics</h2>
                </div>
              </div> */}
                            {/* <div
                style={{ height: "460px", width: "100%" }}
                className="shadow-sm border border-gray-100 flex flex-col relative"
              >
                <div className="w-full h-full relative gap-2 flex">
                  <Pie data={chartData} options={pieoptions} className="p-8 mt-8" />
                  <h2 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-800">
                    Email Campaign Analytics
                  </h2>
                  <h3 className="absolute bottom-2 left-1/2  transform -translate-x-1/2 text-sm font-semibold text-gray-500">
                    Segment Name Vs Value Graph
                  </h3>
                </div>
              </div> */}
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

export default SegmentDashboard;
