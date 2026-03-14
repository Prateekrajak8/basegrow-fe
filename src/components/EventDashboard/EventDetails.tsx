"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
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
import { fetchSegmentData } from "../SegmentDashboard/EventDataService";
import { SegmentData } from "../SegmentDashboard/SegmentType";
import SegmentTable from "@/components/SegmentDashboard/SegmentTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setEndDate,
    setIsAlternativeView,
    setListId,
    setStartDate,
    setTimePeriod,
} from "@/store/appSlice";
import axios from "axios";

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
interface FrequencyData {
  hours?: number;
  throttling_type?: string;
}

interface AnalyticsDashboardProps {
    eventName?: string | null;
    frequencyData?: FrequencyData | null;
}

interface SMTP {
    id: string;
    esp_id: string;
    esp_name: string;
    support_transactional: string;
    name: string; // Add domain property
    esp_name_title?: string;
}

interface SMTPData {
    smtpName: string;
    rowData: SegmentData[];
    segmentData: SegmentData[];
    segmentCounts: { [key: number]: number | string };
}
const EventDetails: React.FC<AnalyticsDashboardProps> = ({
    eventName, frequencyData
}) => {
    const [rawData, setRawData] = useState<SegmentData[]>([]);
    const [rowData, setRowData] = useState<SegmentData[]>([]);
    const [smtpDataMap, setSmtpDataMap] = useState<{ [key: string]: SMTPData }>({});
    const [segmentData, setSegmentData] = useState<SegmentData[]>([]);
    const dispatch = useAppDispatch();
    const timePeriod = useAppSelector((state) => state.app.timePeriod);
    const listId = useAppSelector((state) => state.app.listId);
    const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
    const startDate = useAppSelector((state) => state.app.startDate);
    const endDate = useAppSelector((state) => state.app.endDate);
    const country = useAppSelector((state) => state.app.country);
    const esp = useAppSelector((state) => state.app.esp);
    const domain = useAppSelector((state) => state.app.domain);
    const [loading, setLoading] = useState<boolean>(false);
    // const [showLabels, setShowLabels] = useState(false);
    const [eventStatus, setEventStatus] = useState("");
    const [smtpData, setSmtpData] = useState<SMTP[]>([]);
    const [selectedSmtp, setSelectedSmtp] = useState<SMTP | null>(null);
    const [selectedSmtpId, setSelectedSmtpId] = useState<Number | null>(null);
    const [segmentCounts, setSegmentCounts] = useState<{ [key: number]: number | string }>({});
    // const [uniqueEspNameTitles, setUniqueEspNameTitles] = useState<string[]>([]);
    // const [selectedEspNameTitle, setSelectedEspNameTitle] = useState<string | null>(null);
    const [uniqueEspNameTitles, setUniqueEspNameTitles] = useState<string[]>(['All']);
    const [selectedEspNameTitle, setSelectedEspNameTitle] = useState<string | null>('All');
    const [fetchingCounts, setFetchingCounts] = useState<boolean>(false);

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
            valueFormatter: (params) =>
                params.value ? Number(params.value).toLocaleString() : params.value,
        },
        {
            headerName: "Hard Bounces",
            field: "hardBounces",
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
                const sent = params.data?.sent || 0;
                const value = params.value || 0;
                const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
                return `${value.toLocaleString()} (${percentage}%)`;
            },
        },
        {
            headerName: "Soft Bounces",
            field: "softBounces",
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
                const sent = params.data?.sent || 0;
                const value = params.value || 0;
                const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
                return `${value.toLocaleString()} (${percentage}%)`;
            },
        },
        {
            headerName: "Total Opens",
            field: "totalOpens",
            sortable: true,
            filter: true,
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
            valueFormatter: (params) => {
                const sent = params.data?.sent || 0;
                const value = params.value || 0;
                const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
                return `${value.toLocaleString()} (${percentage}%)`;
            },
        },
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
     const processDataBySmtp = useCallback((data: SegmentData[]) => {
        // Group data by SMTP (esp_name_title)
        const smtpGroups: { [key: string]: SegmentData[] } = {};
        
        data.forEach((item: any) => {
            const smtpName = item.esp_name_title || 'Unknown SMTP';
            if (!smtpGroups[smtpName]) {
                smtpGroups[smtpName] = [];
            }
            smtpGroups[smtpName].push(item);
        });

        // Process each SMTP group
        const newSmtpDataMap: { [key: string]: SMTPData } = {};
        
        Object.keys(smtpGroups).forEach(smtpName => {
            const smtpData = smtpGroups[smtpName];
            
            // Find unique segment/list combinations for this SMTP
            const seen = new Set<string>();
            const uniqueRows: SegmentData[] = smtpData.filter((item) => {
                const key = `${item.segment_id}-${item.list_id}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            newSmtpDataMap[smtpName] = {
                smtpName,
                rowData: smtpData,
                segmentData: uniqueRows,
                segmentCounts: {}
            };
        });

        setSmtpDataMap(newSmtpDataMap);
        setUniqueEspNameTitles(Object.keys(newSmtpDataMap));
    }, []);

    const fetchAndSetData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchSegmentData(
                timePeriod,
                startDate,
                endDate,
                eventName ?? null,
                listId,

            );
            setRawData(data); // Store the raw data
               processDataBySmtp(data);
            // Extract unique ESP name titles
            const espTitles = new Set<string>(['All']);
            data.forEach((item: any) => {
                if (item.esp_name_title) {
                    espTitles.add(item.esp_name_title);
                }
            });
            setUniqueEspNameTitles(Array.from(espTitles));
            // Process the data
            processData(data, selectedEspNameTitle);
        } catch (error) {
            console.log("Error fetching segment data:", error);
        } finally {
            setLoading(false);
        }
    }, [timePeriod, startDate, endDate, eventName, selectedEspNameTitle,listId,processDataBySmtp]);

    const processData = useCallback((data: SegmentData[], espNameTitle: string | null) => {
        // Filter by selected ESP name title if any
        let filteredData = data;
        if (espNameTitle && espNameTitle !== 'All') {
            filteredData = data.filter((item: any) =>
                item.esp_name_title === espNameTitle
            );
        }
        setRowData(filteredData);

        // Process segment data - find unique segment/list combinations
        const seen = new Set<string>();
        const uniqueRows: SegmentData[] = filteredData.filter((item) => {
            const key = `${item.segment_id}-${item.list_id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        setSegmentData(uniqueRows);
    }, []);
    console.log(rowData, "inside eventdetails page")
    // useEffect(() => {
    //     const fetchSegmentCounts = async () => {
    //         const countsMap: { [key: number]: number } = {};

    //         for (const row of segmentData) {
    //             try {
    //                 const res = await axios.post('/api/ongage/segement-count', {
    //                     list_id: row.list_id,
    //                     segment_id: row.segment_id
    //                 });

    //                 // Assuming API returns { count: number }
    //                 // countsMap[row.segment_id] = res.data.total;
    //                 const count = res?.data?.metadata?.total;
    //                 setSegmentCounts(prev => ({
    //                     ...prev,
    //                     [row.segment_id]: count === null ? 'N/A' : count
    //                 }));
    //                 console.log(res.data, "res for count")
    //                 console.log(count, "count")
    //                 countsMap[row.segment_id] = count === null ? 'N/A' : count;
    //             } catch (err) {
    //                 console.log(`Failed to fetch count for segment ${row.segment_id}`, err);
    //                 const count = "N/A"
    //                 setSegmentCounts(prev => ({
    //                     ...prev,
    //                     [row.segment_id]: count
    //                 }));
    //             }
    //         }

    //         // setSegmentCounts(countsMap);
    //     };

    //     if (segmentData.length > 0) {

    const fetchSegmentCounts = useCallback(async (segments: SegmentData[]) => {
        if (segments.length === 0 || fetchingCounts) return;

        setFetchingCounts(true);

        // Store keys we need to fetch
        const keysToFetch = segments
            .filter(row => !segmentCounts[row.segment_id]) // Only fetch ones we don't have
            .map(row => ({ list_id: row.list_id, segment_id: row.segment_id }));

        // If nothing to fetch, return early
        if (keysToFetch.length === 0) {
            setFetchingCounts(false);
            return;
        }
        // Process segment counts sequentially to avoid overloading the server
        const fetchPromises = keysToFetch.map(async ({ list_id, segment_id }) => {
            try {
                // Update state to show loading for this specific segment
                setSegmentCounts(prev => ({
                    ...prev,
                    [segment_id]: 'Loading...'
                }));

                const res = await axios.post('/api/ongage/segement-count', {
                    list_id,
                    segment_id
                });

                const count = res?.data?.metadata?.total;
                // Update state immediately after each count is received
                setSegmentCounts(prev => ({
                    ...prev,
                    [segment_id]: count === null ? 'N/A' : count
                }));

                return { segment_id, count };
            } catch (err) {
                console.log(`Failed to fetch count for segment ${segment_id}`, err);

                // Update state with error for this segment
                setSegmentCounts(prev => ({
                    ...prev,
                    [segment_id]: 'N/A'
                }));

                return { segment_id, count: 'N/A' };
            }
        });

        // Wait for all to complete before clearing loading state
        await Promise.all(fetchPromises);
        setFetchingCounts(false);
    }, [segmentCounts, fetchingCounts]);

    useEffect(() => {
        if (rawData.length > 0) {
            processData(rawData, selectedEspNameTitle);
        }
    }, [selectedEspNameTitle, rawData, processData]);

    // Fetch segment counts when segment data changes
    useEffect(() => {
        if (segmentData.length > 0) {
            fetchSegmentCounts(segmentData);
        }
    }, [segmentData, fetchSegmentCounts]);
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
        // type,
        eventName,
        selectedSmtpId
    ]);
     const allUniqueSegments = useMemo(() => {
        const seen = new Set<string>();
        const uniqueRows: SegmentData[] = [];
        
        rawData.forEach((item) => {
            const key = `${item.segment_id}-${item.list_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueRows.push(item);
            }
        });
        
        return uniqueRows;
    }, [rawData]);

    // Get combined segment counts from all SMTPs
    const allSegmentCounts = useMemo(() => {
        const combinedCounts: { [key: number]: number | string } = {};
        
        Object.values(smtpDataMap).forEach(smtpData => {
            Object.entries(smtpData.segmentCounts).forEach(([segmentId, count]) => {
                combinedCounts[parseInt(segmentId)] = count;
            });
        });
        
        return combinedCounts;
    }, [smtpDataMap]);
    const handleEspNameTitleChange = (value: string) => {
        console.log("Selected ESP Name Title:", value);
        setSelectedEspNameTitle(value);
    };
    return (
        <div className="gap-4 flex flex-col">
            {/* <div className="flex mt-4">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-2 px-4 relative"> 
                        <label
                            htmlFor="event-domain-select"
                            className="text-md font-semibold text-gray-900"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            SMTP Filter
                        </label>
                        <Listbox value={selectedEspNameTitle} onChange={handleEspNameTitleChange}>
                            <div className="relative">
                                <Listbox.Button className="relative  w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-md focus:outline-none">
                                    <span className="block truncate">
                                        {selectedEspNameTitle || "Select SMTP"}
                                    </span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                    </span>
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
                                    {uniqueEspNameTitles.map((option) => (
                                        <Listbox.Option
                                            key={option}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"}`
                                            }
                                            value={option}  
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                        {option}
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
            </div> */}
            <div className="flex gap-4 rounded  p-4">
                <div className="flex flex-col  rounded border border-gray-100 p-4">
                    <div className=" ml-2 rounded flex gap-2 ">
                        <h3 className="text-lg font-bold ">Frequency:</h3>
                        <p className="text-md mt-1">{frequencyData?.hours} {frequencyData?.throttling_type}  </p>
                    </div>
                    <div className=" ml-2 rounded flex gap-2 ">
                        <h3 className="text-lg font-bold ">Campaign Quota:</h3>
                        <p className="text-md mt-1">Yes / No </p>
                    </div>
                    <div className="flex gap-8">
                        <div className="mt-4 p-2 rounded ">
                            <h3 className="text-lg font-bold mb-2">Segment Name</h3>
                            {segmentData.map((row, index) => (
                                <div key={`${row.segment_id}-${row.list_id}`} className="mb-2 ">
                                    <p> {row.segment_name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-2">
                            <h3 className="text-lg font-bold mb-2">Segment Count</h3>
                            {segmentData.map((row, index) => (
                                <div key={index} className="mb-2 ">
                                    <div>
                                        {segmentCounts[row.segment_id] === 'Loading...' ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        ) : segmentCounts[row.segment_id] ? (
                                            segmentCounts[row.segment_id]
                                        ) : (
                                            <div className="flex items-center">
                                                <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="flex flex-col gap-4">
                <SegmentTable
                    rowData={rowData as SegmentData[]}
                    columnDefs={columnDefsStandard}
                    loading={loading}
                />
            </div> */}
             {uniqueEspNameTitles.map((smtpName) => {
                const smtpData = smtpDataMap[smtpName];
                if (!smtpData) return null;

                return (
                    <div key={smtpName} className="flex flex-col gap-4">
                        
                        <div className="bg-gray-50 p-4 px-6">
                            <h2 className="text-xl font-bold text-gray-800 ">
                                SMTP: <span className="font-normal">{smtpName}</span>
                            </h2>
                        </div>

                        <SegmentTable
                            rowData={smtpData.rowData as SegmentData[]}
                            columnDefs={columnDefsStandard}
                            loading={loading}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default EventDetails;
