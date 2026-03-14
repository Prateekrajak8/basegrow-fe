"use client";
import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Bar } from "react-chartjs-2";
// import { fetchSegmentData } from "@/components/SegmentDashboard/SegmentDetailsService";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import SegmentFilters from '@/components/SegmentDashboard/SegmentFilter';
import SegmentDashboard from "@/components/SegmentDashboard/SegmentDashBoard";
import { GrPrevious } from "react-icons/gr";
import {
    ColDef,
    GridReadyEvent,
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

export default function SegmentDashboardData(){
    const router = useRouter();
    const timePeriod = useAppSelector((state) => state.app.timePeriod);
    const startDate = useAppSelector((state) => state.app.startDate);
    const endDate = useAppSelector((state) => state.app.endDate);
    const [rowData, setRowData] = useState<SegmentData[]>([]);
    const view = useAppSelector((state) => state.app.view);
    const country = useAppSelector((state) => state.app.country);
    const esp = useAppSelector((state) => state.app.esp);
    const domain = useAppSelector((state) => state.app.domain);
    const [loading, setLoading] = useState(true);
    const [segmentCounts, setSegmentCounts] = useState<{ [key: number]: number }>({});
    const onGridReady = (params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    };
    const searchParams = useSearchParams();
    const eventName = searchParams.get("eventName") || "null";
    const event_id = searchParams.get("eventId") || "null";
    const [eventStatus, setEventStatus] = useState("");
    // const fetchAndSetData = async () => {
    //     setLoading(true);
    //     const data = await fetchSegmentData(
    //         timePeriod,
    //         startDate,
    //         endDate,
    //         eventName,
    //     );
    //     setRowData(data);
    //     console.log("rowdat................................", rowData);
    //     setLoading(false);
    // };
    // useEffect(() => {
    //     if (timePeriod === "custom") {
    //         if (startDate && endDate) {
    //             fetchAndSetData();
    //             console.log(startDate, "startDate");
    //             console.log(endDate, "endDate");
    //         }
    //     } else {
    //         fetchAndSetData();
    //     }
    // }, [
    //     timePeriod,
    //     startDate,
    //     endDate,
    //     eventName,
    // ]);
    useEffect(() => {
        const fetchSegmentCounts = async () => {
            const countsMap: { [key: number]: number } = {};

            for (const row of rowData) {
                try {
                    const res = await axios.post('/api/segment-count', {
                        list_id: row.list_id,
                        segment_id: row.segment_id
                    });

                    // Assuming API returns { count: number }
                    countsMap[row.segment_id] = res.data.count;
                } catch (err) {
                    console.log(`Failed to fetch count for segment ${row.segment_id}`, err);
                }
            }

            setSegmentCounts(countsMap);
        };

        if (rowData.length > 0) {
            fetchSegmentCounts();
        }
    }, [rowData]);
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

    console.log("rowData in dashboard page", rowData);
    return (
        <>
            <div className="flex flex-col gap-2" >
                <button
                    className="mt-2 ml-2 flex items-center text-blue-500 w-fit px-3 py-2 rounded hover:bg-blue-100 transition cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <GrPrevious className="mr-1" />
                    <span>Back</span>
                </button>
                <div className="flex justify-between">
                    {/* <h1 className="text-xl font-bold mb-4">Segment Details</h1> */}
                    <div>
                        <p className="text-lg mb-2 ml-2">
                            <strong>Event Name:</strong> {eventName}
                        </p>
                    </div>
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
                {/* <div className="mt-4 p-2 border rounded">
                    <h2 className="text-lg font-bold mb-2">Segment List</h2>
                    {rowData.map((row, index) => (
                        <div key={index} className="mb-2">
                            <p><strong>Segment:</strong> {row.segment_name}</p>
                            <p><strong>Count:</strong> {segmentCounts[row.segment_id] ?? 'Loading...'}</p>
                        </div>
                    ))}
                </div> */}
            </div>
            <SegmentDashboard type={view} countries={country} esps={esp} domains={domain} eventName={eventName} />
        </>
    );
};
// export default SegmentDashboardData;