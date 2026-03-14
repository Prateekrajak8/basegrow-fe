"use client";
import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { fetchSegmentData } from "@/components/SegmentDashboard/SegmentDetailsService";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import SegmentFilters from '@/components/SegmentDashboard/SegmentFilter';
import { GrPrevious } from "react-icons/gr";
import {
    ColDef,
    GridReadyEvent,
    ICellRendererParams,
    ModuleRegistry, // Import ModuleRegistry
} from "ag-grid-community";
import { TooltipModule } from "ag-grid-community"; // Import TooltipModule
import { SegmentData } from "@/components/SegmentDashboard/SegmentType";
import { ColumnAutoSizeModule } from 'ag-grid-community';
import { ClientSideRowModelModule } from "ag-grid-community";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import axios from "axios";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// Register the TooltipModule
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TooltipModule,
    ColumnAutoSizeModule
]);
interface SegmentTableProps {
    rowData: SegmentData[];
    columnDefs: ColDef[];
    loading: boolean;
}

export default function SegmentDetailsTable() {
    const router = useRouter();
    const timePeriod = useAppSelector((state) => state.app.timePeriod);
    const startDate = useAppSelector((state) => state.app.startDate);
    const endDate = useAppSelector((state) => state.app.endDate);
    const [rowData, setRowData] = useState<SegmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
    const [eventStatus, setEventStatus] = useState("");
    const [segmentCount, setSegmentCount] = useState<number | null>(null);
    
    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };
    const searchParams = useSearchParams();
    const segmentName = searchParams.get("segmentName") || "N/A";
    const list_id = searchParams.get("list_id") || "null";
    const segment_id = searchParams.get("segment_id") || "null";
    const eventName = searchParams.get("eventName") || "null"
    const event_id = searchParams.get("eventId") || "null"
    const fetchAndSetData = async () => {
        setLoading(true);
        const data = await fetchSegmentData(
            timePeriod,
            startDate,
            endDate,
            segmentName,
        );
        setRowData(data);
        console.log("rowdat................................", rowData);
        setLoading(false);
    };
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
        startDate,
        endDate,
        segmentName,
    ]);
    const fetchSegmentCount = async (list_id: string, segment_id: string) => {
        try {
            const response = await axios.post("/api/ongage/segement-count", {
                list_id,
                segment_id,
            });
            return response.data; // Adjust based on actual API response
        } catch (error) {
            console.log("Error fetching segment count:", error);
            return null;
        }
    };
    useEffect(() => {
        const getSegmentCount = async () => {
            if (list_id && segment_id) {
                // const parsedListId = parseInt(list_id);
                // const parsedSegmentId = parseInt(segment_id);
                console.log(list_id, segment_id, "listid and segmentid")
                const countData = await fetchSegmentCount(list_id, segment_id);
                console.log("Segment Count Data:", countData);
                if (countData?.metadata.total) {
                    setSegmentCount(countData.metadata.total);
                }
                // Do something with countData, like setting it in state
            }
        };

        getSegmentCount();
    }, [list_id, segment_id]);
    const fetchEventStatus = async (event_id: string) => {
        try {
            const response = await axios.post("/api/ongage/event-status", {
                event_id,
            });
            console.log("event status", response.data)
            return response.data; // Adjust based on actual API response
        } catch (error) {
            console.log("Error fetching event status", error);
            return null;
        }
    };
    useEffect(() => {
        const getEventStatus = async () => {
            if (event_id) {
                const countData = await fetchEventStatus(event_id);
                // console.log("Segment Count Data:", countData);
                if (countData?.status) {
                    setEventStatus(countData.status);
                }
                // Do something with countData, like setting it in state
            }
        };

        getEventStatus();
    }, [event_id]);

    // Add this new function to fetch the spreadsheet URL
    const fetchSpreadsheetUrl = async () => {
        try {
            const response = await fetch('/api/spreadsheet-url');
            const data = await response.json();
            if (data.url) {
                setSpreadsheetUrl(data.url);
            }
        } catch (error) {
            console.log('Error fetching spreadsheet URL:', error);
        }
    };

    useEffect(() => {
        fetchSpreadsheetUrl();
    }, []);

    const columnDefsStandard: ColDef[] = [
        {
            headerName: "Date",
            field: "date",
            sortable: true,
            filter: true,
            // tooltipField: "segment_name",
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
    const columnDefs: ColDef<{
        date: string;
        sent: number;
        hardBounces: number;
        softBounces: number;
        totalOpens: number;
        uniqueOpens: number;
        totalClicks: number;
        uniqueClicks: number;
        unsubscribes: number;
    }>[] = [
            {
                headerName: "Date", field: "date", sortable: true, filter: true, minWidth: 140, flex: 1,
            },
            { headerName: "Sent", field: "sent", sortable: true, filter: true,  
                valueFormatter: (params) =>
                params.value ? Number(params.value).toLocaleString() : params.value , },
            { headerName: "Hard Bounces", field: "hardBounces", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Soft Bounces", field: "softBounces", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Total Opens", field: "totalOpens", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Unique Opens", field: "uniqueOpens", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Total Clicks", field: "totalClicks", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Unique Clicks", field: "uniqueClicks", sortable: true, filter: true,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
             },
            { headerName: "Unsubscribe", field: "unsubscribes", sortable: true, filter: true ,
                valueFormatter: (params) =>
                    params.value ? Number(params.value).toLocaleString() : params.value ,
            },
        ];
    const updatedColumnDefs: ColDef[] = columnDefs.map((colDef) => ({
        ...colDef,
        headerTooltip: colDef.headerName, // Tooltip for all column headers
        ...(colDef.field === "date" && { tooltipField: "date" }), 
    }));
    console.log("rowData", rowData);
    const chartData = {
        labels: rowData.map((item) => item.date), // X-axis (Dates)
        datasets: [
            {
                label: "Sent",
                data: rowData.map((item) => item.sent),
                backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
            },
            {
                label: "Unique Opens",
                data: rowData.map((item) => item.uniqueOpens),
                backgroundColor: "rgba(75, 192, 192, 0.6)", // Teal
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Email Campaign Analytics" },
        },
        scales: {
            x: { title: { display: true, text: "Date" }, grid: { display: false } },
            y: { title: { display: true, text: "Value" }, beginAtZero: true },
        },
        onHover: (event: any, chartElement: any) => {
            event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
        },
    };

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

    return (
        <>
            <div className="flex flex-col gap-2" >
                <button
                    className="mt-2 ml-2 flex items-center text-blue-500 w-fit px-3 py-2 rounded hover:bg-blue-100 transition cursor-pointer"
                    onClick={() => router.push(`/SegmentDashBoard?eventName=${eventName}&eventId=${event_id}`)}
                >
                    <GrPrevious className="mr-1" />
                    <span>Back</span>
                </button>
                <div className="flex justify-between">
                    {/* <h1 className="text-xl font-bold mb-4">Segment Details</h1> */}
                    <div>
                        <p className="text-lg mb-2 ml-2">
                            <strong>Segment Name:</strong> {segmentName}
                        </p>
                      
                    </div>
                   {/* <div className="border p-2 rounded">
                   <p className="text-lg mb-2 ml-2">
                            <strong>Segment Count:</strong> {segmentCount !== null ? segmentCount : "N/A"}
                        </p>
                   </div> */}
                   <div className="px-4 justify-end">
                        {eventStatus === "" ? (
                            <div className="animate-pulse bg-gray-300 w-20 h-8 rounded"></div> // skeleton loader
                        ) : (
                            <button
                                className={`${eventStatus === "Active" ? "bg-green-500" : "bg-red-500"
                                    } text-white w-20 h-8 rounded`}
                            >
                                {eventStatus === "Active" ? "Active" : "Inactive"}
                            </button>
                        )}
                    </div>

                </div>
                
                <div className="flex justify-between ">
                    <div>
                        <SegmentFilters />
                    </div>
                    
                </div>
            </div>
            {loading  ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading Segment data...</span>
        </div>
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center mt-4">
                        <div className="p-4 lg:w-[65rem] sm:w-[66rem] md:w-[66rem] overflow-x-auto overflow-y-auto cursor-pointer">
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={updatedColumnDefs}
                                pagination={true}
                                paginationPageSize={10}
                                paginationAutoPageSize={false}
                                domLayout="autoHeight"
                                className="quartz"
                                onGridReady={onGridReady}
                                tooltipShowDelay={0}
                                tooltipHideDelay={2000}
                            />
                        </div>
                    </div>
                    <div className={`flex  gap-8 p-4 mt-6`}>
                        <div style={{ height: "400px", width: "100%" }} className="shadow-sm border border-gray-100 ">
                            <Bar data={chartData} options={options} className="p-4" />
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
                            <div className="p-4 border rounded text-center">
                                <h3 className="font-bold">Segment Count</h3>
                                <p>{segmentCount !== null ? segmentCount : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </>)};
        </>
    );
};
// export default SegmentDetailsTable;