"use client"
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { MdOutlineArrowBackIos, MdAnalytics, MdFilterList, MdRefresh } from "react-icons/md";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, MagnifyingGlassIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import axios from "axios";
import {
    ColDef,
    CustomFilterModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ValidationModule,
    TooltipModule,
    ClientSideRowModelModule,
    ICellRendererParams,
    NumberEditorModule,
    SelectEditorModule,
    CellStyleModule
} from "ag-grid-community";
import { TextEditorModule } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextEditorModule,
    ValidationModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    TooltipModule,
    TextFilterModule,
    CustomFilterModule,
    SelectEditorModule,
    NumberEditorModule,
    CellStyleModule
]);

interface EmailRecord {
    id: number;
    campaignId: number;
    email: string;
    sent: boolean;
    hardBounce: boolean;
    softBounce: boolean;
    uniqueOpen: boolean;
    totalClicks: number;
    uniqueClicker: boolean;
    createdAt: string;
}

interface DomainAnalysis {
    id: number;
    domain: string;
    cluster: string;
    totalEmails: number;
    sent: number;
    hardBounces: number;
    softBounces: number;
    bounces: number;
    uniqueOpens: number;
    uniqueClickers: number;
    totalClicks: number;
    hardBounceRate: string;
    softBounceRate: string;
    totalClickRate: string;
    uniqueOpenRate: string;
    uniqueClickRate: string;
    performanceScore: number;
    // Add these missing properties
    uniqueOpenThresh?: number | null;
    uniqueClickThresh?: number | null;
    totalClickThresh?: number | null;
    selectMethod?: string | null;
    selectValue?: number | null;
    shouldBeSelected?: string | null;
}

// Helper function to filter campaign names based on duration using array slicing
const filterCampaignsByDuration = (campaignNames: string[], duration: string): string[] => {
    // Assuming campaigns are ordered with latest first
    switch (duration) {
        case "today":
            return campaignNames.slice(0, 1); // Last 1 campaign
        case "yesterday":
            return campaignNames.slice(1, 2); // Second last campaign
        case "last 4 days":
            return campaignNames.slice(0, 4); // Last 4 campaigns
        case "last 10 days":
            return campaignNames.slice(0, 10); // Last 10 campaigns
        case "last 20 days":
            return campaignNames.slice(0, 20); // Last 20 campaigns
        case "last 30 days":
            return campaignNames.slice(0, 30); // Last 30 campaigns
        default:
            return campaignNames; // All campaigns
    }
};
const formatIndianNumber = (num: number): string => {
    if (isNaN(num)) return "0";
    return num
        .toLocaleString("en-IN") // Indian numbering system (12,500 / 1,30,800 / 10,00,000)
        .replace(/,/g, ".");     // replace commas with dots
};
const CampaignAnalysisTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Parse campaign names from URL params
    const campaignNamesParam = searchParams.get("campaignNames");
    const DomainName = searchParams.get("activeDomain");
    const allCampaignNames: string[] = campaignNamesParam
        ? JSON.parse(decodeURIComponent(campaignNamesParam))
        : [];

    const [clusterAnalysis, setClusterAnalysis] = useState<DomainAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingRows, setUpdatingRows] = useState<Set<number>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    const durationes = [
        { value: "last 4 days", label: "Last 4 Days" },
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last 10 days", label: "Last 10 Days" },
        { value: "last 20 days", label: "Last 20 Days" },
        { value: "last 30 days", label: "Last 30 Days" },
    ];
    const [duration, setDuration] = useState("last 4 days");

    // Get filtered campaign names based on selected duration
    const getFilteredCampaignNames = (): string[] => {
        return filterCampaignsByDuration(allCampaignNames, duration);
    };

    // Helper function to calculate percentage
    const calculatePercentage = (numerator: number, denominator: number): string => {
        if (denominator === 0) return "0.00%";
        return ((numerator / denominator) * 100).toFixed(2) + "%";
    };

    // Cluster priority order based on Excel sheet
    const CLUSTER_PRIORITY = [
        "Microsoft", "Gmail", "KPN", "Ziggo/UPC", "Telenet", "Skynet/Proximus", "Yahoo", "Apple", "Pandora",
        "ZeelandNet", "Caiway", "Online.nl",
        "Telfort", "Scarlet", "Solcon", "WXS", "HCCnet", "OnsBrabantNet",
        "Mail.com", "Versatel", "Others"
    ];

    const getClusterPriority = (cluster: string): number => {
        const index = CLUSTER_PRIORITY.indexOf(cluster);
        return index !== -1 ? index : CLUSTER_PRIORITY.length;
    };

    // Performance Badge Component
    const PerformanceBadge = ({ value, type }: { value: string; type: 'opens' | 'clicks' | 'bounce' }) => {
        const numValue = parseFloat(value.replace('%', ''));
        let bgColor = 'bg-gray-100 text-gray-600';
        let borderColor = 'border-gray-200';

        if (type === 'opens') {
            if (numValue >= 25) {
                bgColor = 'bg-green-100 text-green-800';
                borderColor = 'border-green-200';
            } else if (numValue >= 15) {
                bgColor = 'bg-yellow-100 text-yellow-800';
                borderColor = 'border-yellow-200';
            } else {
                bgColor = 'bg-red-100 text-red-800';
                borderColor = 'border-red-200';
            }
        } else if (type === 'clicks') {
            if (numValue >= 5) {
                bgColor = 'bg-green-100 text-green-800';
                borderColor = 'border-green-200';
            } else if (numValue >= 2) {
                bgColor = 'bg-yellow-100 text-yellow-800';
                borderColor = 'border-yellow-200';
            } else {
                bgColor = 'bg-red-100 text-red-800';
                borderColor = 'border-red-200';
            }
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${borderColor}`}>
                {value}
            </span>
        );
    };

    // Update Button Cell Renderer
    const UpdateButtonRenderer = (props: ICellRendererParams) => {
        const handleUpdate = async () => {
            const rowData = props.data;
            const rowId = rowData.id;
            console.log(rowId, ":rowId")
            setUpdatingRows(prev => new Set(prev).add(rowId));

            // Parse threshold function
            const parseThreshold = (val: any) => {
                if (val === null || val === undefined || val === '') return null;
                if (typeof val === 'string') {
                    const cleaned = val.replace('%', '').trim();
                    const parsed = parseFloat(cleaned);
                    return isNaN(parsed) ? null : parsed;
                }
                return typeof val === 'number' ? val : null;
            };

            try {
                await axios.post('/api/mailcamp/clusters', {
                    id: rowData.id,
                    uniqueOpenThresh: parseThreshold(rowData.uniqueOpenThresh),
                    uniqueClickThresh: parseThreshold(rowData.uniqueClickThresh),
                    totalClickThresh: parseThreshold(rowData.totalClickThresh),
                    shouldBeSelected: rowData.shouldBeSelected === "Yes",
                    selectMethod: rowData.selectMethod,
                    selectPercentage: rowData.selectMethod === "Percentage" ? rowData.selectValue : null,
                    selectNumber: rowData.selectMethod === "Number" ? rowData.selectValue : null,
                });

                console.log('Thresholds updated:', rowData.domain);
                await fetchCombinedData();

            } catch (error) {
                // console.error('Failed to update threshold:', error);
            } finally {
                setUpdatingRows(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(rowId);
                    return newSet;
                });
            }
        };

        const isUpdating = updatingRows.has(props.data.id);

        return (
            <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed text-white shadow-sm'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
            >
                {isUpdating ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                    </>
                ) : (
                    <>
                        Update
                    </>
                )}
            </button>
        );
    };

    // Status Badge Renderer
    const StatusBadgeRenderer = (props: ICellRendererParams) => {
        const value = props.value;
        const isYes = value === "Yes";
        const isNo = value === "No";

        return (
            <div className="flex items-center justify-center">
                {isYes && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Yes
                    </span>
                )}
                {isNo && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        No
                    </span>
                )}
                {!isYes && !isNo && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        --
                    </span>
                )}
            </div>
        );
    };

    const clusterColumnDefs: ColDef[] = [
        {
            headerName: "📧 Clusters",
            field: "domain",
            width: 140,
            tooltipField: "domain",
            headerTooltip: "Clusters",
            cellRenderer: (props: ICellRendererParams) => (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{props.value}</span>
                </div>
            )

        },
        {
            headerName: "Id", field: "id",
            hide: true, editable: false,
        },
        {
            headerName: "Sent",
            field: "sent",
            width: 120,
            tooltipField: "sent",
            headerTooltip: "Sent",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            // cellRenderer: (props: ICellRendererParams) => (
            //     <div className="flex items-center">
            //         <span className="font-semibold text-blue-600">
            //             {Number(props.value).toLocaleString()}
            //         </span>
            //     </div>
            // )
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Opens %",
            field: "uniqueOpenRate",
            width: 130,
            headerTooltip: "Unique Opens % ",
            cellRenderer: (props: ICellRendererParams) =>
                <PerformanceBadge value={props.value} type="opens" />
        },
        {
            headerName: "Unique opens % criteria",
            field: "uniqueOpenThresh",
            width: 120,
            editable: true,
            headerTooltip: "Unique opens % criteria",
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0,
                max: 100,
                precision: 2,
                step: 0.1,
                showStepperButtons: true
            },
            valueFormatter: (params) => {
                return params.value != null ? `${params.value}%` : '';
            }
        },
        {
            headerName: "Total Clicks %",
            field: "totalClickRate",
            width: 110,
            headerTooltip: "Total Clicks %",
            cellRenderer: (props: ICellRendererParams) =>
                <PerformanceBadge value={props.value} type="clicks" />
        },
        {
            headerName: "Total clicks % criteria",
            field: "totalClickThresh",
            width: 130,
            editable: true,
            headerTooltip: "Total clicks % criteria",
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0,
                max: 100,
                precision: 2,
                step: 0.1,
                showStepperButtons: true
            },
            valueFormatter: (params) => {
                return params.value != null ? `${params.value}%` : '';
            }
        },
        {
            headerName: "Unique Clicks %",
            field: "uniqueClickRate",
            width: 130,
            headerTooltip: "Unique Clicks %",
            cellRenderer: (props: ICellRendererParams) =>
                <PerformanceBadge value={props.value} type="clicks" />
        },
        {
            headerName: "Unique clicks % criteria",
            field: "uniqueClickThresh",
            width: 130,
            editable: true,
            headerTooltip: "Unique clicks % criteria",
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0,
                max: 110,
                precision: 2,
                step: 0.1,
                showStepperButtons: true
            },
            valueFormatter: (params) => {
                return params.value != null ? `${params.value}%` : '';
            }
        },
        {
            headerName: "Select Method",
            field: "selectMethod",
            editable: true,
            width: 120,
            cellEditor: 'agSelectCellEditor',
            headerTooltip: "Select Method",
            cellEditorParams: {
                values: ['Percentage', 'Number']
            },
            valueFormatter: (params: any) => params.value || '',
        },
        {
            headerName: "Value",
            field: "selectValue",
            editable: true,
            width: 100,
            headerTooltip: "Percentage or Number value",
            valueFormatter: (params) => {
                const value = params.value ?? 0;
                return params.data.selectMethod === "Percentage" ? `${value}%` : value;
            },
        },
        {
            headerName: "Req. Met",
            field: "shouldBeSelected",
            width: 120,
            editable: true,
            headerTooltip: "Requirements Met",
            cellRenderer: StatusBadgeRenderer
        },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            cellRenderer: UpdateButtonRenderer,
            headerTooltip: "Update row data",
            sortable: false,
            filter: false,
            resizable: false,
        },
    ];

    const fetchCombinedData = async () => {
        try {
            setLoading(true);
            setError(null); // Clear any previous errors

            // Get filtered campaign names based on selected duration using array slicing
            const filteredNames = getFilteredCampaignNames();

            console.log('Filtered campaign names for', duration, ':', filteredNames);

            const [emailRes, clusterMetaRes] = await Promise.all([
                // Send filtered names based on duration
                axios.post("/api/mailcamp/get-cluster-data", {
                    names: filteredNames
                }),
                axios.get(`/api/mailcamp/clusters?accountId=${id}`)
            ]);

            const clusterData = Array.isArray(emailRes.data) ? emailRes.data : []; // Ensure it's an array
            const clusterList = Array.isArray(clusterMetaRes.data?.clusters) ? clusterMetaRes.data.clusters : []; // Ensure it's an array

            console.log('Cluster Data from API 1:', clusterData);
            console.log('Cluster Metadata from API 2:', clusterList);

            // Create a map of cluster metadata for easy lookup
            const clusterMetaMap = new Map();
            clusterList.forEach((cluster: any) => {
                clusterMetaMap.set(cluster.name, cluster);
            });

            // Group cluster data by clusterName and aggregate stats
            const clusterStatsMap = new Map<string, {
                totalUsers: number;
                sent: number;
                hardBounce: number;
                softBounce: number;
                uniqueOpen: number;
                uniqueClick: number;
                totalClick: number;
                unsubscribes: number;
            }>();

            // Process cluster data from first API (if available)
            if (clusterData.length > 0) {
                console.log('Processing cluster data from API 1');
                clusterData.forEach(item => {
                    const clusterName = item.clusterName;

                    if (!clusterStatsMap.has(clusterName)) {
                        clusterStatsMap.set(clusterName, {
                            totalUsers: 0,
                            sent: 0,
                            hardBounce: 0,
                            softBounce: 0,
                            uniqueOpen: 0,
                            uniqueClick: 0,
                            totalClick: 0,
                            unsubscribes: 0
                        });
                    }

                    const stats = clusterStatsMap.get(clusterName)!;
                    stats.totalUsers += item.stats.totalUsers || 0;
                    stats.sent += item.stats.sent || 0;
                    stats.hardBounce += item.stats.hardBounce || 0;
                    stats.softBounce += item.stats.softBounce || 0;
                    stats.uniqueOpen += item.stats.uniqueOpen || 0;
                    stats.uniqueClick += item.stats.uniqueClick || 0;
                    stats.totalClick += item.stats.totalClick || 0;
                    stats.unsubscribes += item.stats.unsubscribes || 0;
                });
            }

            // If only cluster metadata exists (second API has data, first API is empty)
            // OR if we want to show all clusters from metadata even if no campaign data
            if (clusterList.length > 0) {
                console.log('Processing cluster metadata from API 2');
                clusterList.forEach((clusterMeta: any) => {
                    const clusterName = clusterMeta.name;
                    // Only add if not already added from campaign data
                    if (!clusterStatsMap.has(clusterName)) {
                        clusterStatsMap.set(clusterName, {
                            totalUsers: 0,
                            sent: 0,
                            hardBounce: 0,
                            softBounce: 0,
                            uniqueOpen: 0,
                            uniqueClick: 0,
                            totalClick: 0,
                            unsubscribes: 0
                        });
                    }
                });
            }

            console.log('Cluster Stats Map:', clusterStatsMap);

            // Process and merge the cluster data
            const processedData: DomainAnalysis[] = [];

            // Create final merged data
            clusterStatsMap.forEach((aggregatedStats, clusterName) => {
                const clusterMeta = clusterMetaMap.get(clusterName);

                // Calculate rates
                const uniqueOpenRate = calculatePercentage(aggregatedStats.uniqueOpen, aggregatedStats.sent);
                const uniqueClickRate = calculatePercentage(aggregatedStats.uniqueClick, aggregatedStats.sent);
                const totalClickRate = calculatePercentage(aggregatedStats.totalClick, aggregatedStats.sent);
                const hardBounceRate = calculatePercentage(aggregatedStats.hardBounce, aggregatedStats.sent);
                const softBounceRate = calculatePercentage(aggregatedStats.softBounce, aggregatedStats.sent);

                const mergedCluster: DomainAnalysis = {
                    id: clusterMeta?.id || 0,
                    domain: clusterName,
                    cluster: clusterName,
                    totalEmails: aggregatedStats.totalUsers,
                    sent: aggregatedStats.sent,
                    hardBounces: aggregatedStats.hardBounce,
                    softBounces: aggregatedStats.softBounce,
                    bounces: aggregatedStats.hardBounce + aggregatedStats.softBounce,
                    uniqueOpens: aggregatedStats.uniqueOpen,
                    uniqueClickers: aggregatedStats.uniqueClick,
                    totalClicks: aggregatedStats.totalClick,
                    hardBounceRate,
                    softBounceRate,
                    totalClickRate,
                    uniqueOpenRate,
                    uniqueClickRate,
                    performanceScore: 0, // You can calculate this based on your logic

                    // Add missing properties for the complete DomainAnalysis interface
                    // These will be used by your table columns
                    uniqueOpenThresh: clusterMeta?.uniqueOpenThresh || null,
                    uniqueClickThresh: clusterMeta?.uniqueClickThresh || null,
                    totalClickThresh: clusterMeta?.totalClickThresh || null,
                    selectMethod: clusterMeta?.selectPercentage !== null && clusterMeta?.selectPercentage !== undefined ? "Percentage" :
                        clusterMeta?.selectNumber !== null && clusterMeta?.selectNumber !== undefined ? "Number" : null,
                    selectValue: clusterMeta?.selectPercentage ?? clusterMeta?.selectNumber ?? null,
                    shouldBeSelected: clusterMeta?.shouldBeSelected === true ? "Yes" :
                        clusterMeta?.shouldBeSelected === false ? "No" : null,
                };

                processedData.push(mergedCluster);
            });

            console.log('Processed Data:', processedData);

            // Sort by cluster priority
            const sortedData = processedData.sort((a, b) => {
                const priorityA = getClusterPriority(a.cluster);
                const priorityB = getClusterPriority(b.cluster);
                return priorityA - priorityB;
            });

            console.log('Final Sorted Data:', sortedData);
            setClusterAnalysis(sortedData);

        } catch (err: any) {
            // console.error('Error fetching combined data:', err);
            // setError(err.message || "Unknown error");
            // Set empty array on error to show "no data" state
            setClusterAnalysis([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCombinedData();
        setRefreshing(false);
    };

    // Re-fetch data when duration changes
    useEffect(() => {
        if (allCampaignNames.length > 0) {
            fetchCombinedData();
        }
    }, [duration]); // Add duration as dependency

    useEffect(() => {
        if (allCampaignNames.length > 0) {
            fetchCombinedData();
        }
    }, [id]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
                    <div className="flex items-center gap-56 py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center px-4 py-2 shadow-sm rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <MdOutlineArrowBackIos className="w-4 h-4 mr-2" />
                                <span className="font-medium text-black">HOME </span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MdAnalytics className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Campaign Analysis Dashboard</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
                {/* Add the filter info component */}
                {/* <FilterInfo /> */}

                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MdFilterList className="w-5 h-5 mr-2 text-blue-600" />
                            Analysis Filters
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                                📅 Select Time Period
                            </label>
                            <Listbox value={duration} onChange={setDuration}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                        <span className="flex items-center">
                                            <span className="block truncate font-medium">
                                                {durationes.find((c) => c.value === duration)?.label || "Select Duration"}
                                            </span>
                                        </span>
                                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                        </span>
                                    </Listbox.Button>

                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                            {durationes.map((option) => (
                                                <Listbox.Option
                                                    key={option.value}
                                                    value={option.value}
                                                    className={({ active, selected }) =>
                                                        `relative cursor-pointer select-none py-3 pl-4 pr-10 transition-colors duration-150 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                                        } ${selected ? "bg-blue-100  text-blue-700 font-medium" : "font-normal"}`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className="flex items-center">
                                                                <span className={`block truncate ${selected ? "font-semibold text-blue-700" : "font-normal"}`}>
                                                                    {option.label}
                                                                </span>
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-3 flex items-center text-blue-700">
                                                                    <ChevronUpDownIcon className="h-5 w-5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>

                        {/* Stats Cards */}
                        <div className="md:col-span-2 grid grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Clusters</p>
                                        <p className="text-2xl font-bold">{clusterAnalysis.length}</p>
                                    </div>
                                    <div className="text-2xl opacity-80">📊</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Total Sent</p>
                                        <p className="text-2xl font-bold">
                                            {clusterAnalysis.reduce((sum, cluster) => sum + cluster.sent, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-2xl opacity-80">📤</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Campaigns</p>
                                        <p className="text-2xl font-bold">{getFilteredCampaignNames().length}</p>
                                    </div>
                                    <div className="text-2xl opacity-80">📈</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Domain</p>
                                        <p className="text-2xl font-bold">
                                            {/* {clusterAnalysis.reduce((sum, cluster) => sum + cluster.sent, 0).toLocaleString()} */}
                                            {DomainName}
                                        </p>
                                    </div>
                                    {/* <div className="text-2xl opacity-80">🌊</div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            📈 Cluster Performance Analysis of {DomainName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitor and optimize email campaign performance across different domain clusters
                        </p>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                                </div>
                                <p className="mt-4 text-gray-600 font-medium">Loading campaign data...</p>
                                <p className="text-sm text-gray-500 mt-1">Please wait while we analyze your campaigns</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <p className="text-gray-600 font-medium mb-2">Error loading campaign data</p>
                                <p className="text-sm text-gray-500 mb-4">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <MdRefresh className="w-4 h-4 mr-2" />
                                    Try Again
                                </button>
                            </div>
                        ) : clusterAnalysis.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="text-gray-400 text-6xl mb-4">📊</div>
                                <p className="text-gray-600 font-medium mb-2">No data available</p>
                                <p className="text-sm text-gray-500">No campaign data found for the selected time period</p>
                            </div>
                        ) : (
                            <div className="ag-theme-alpine" style={{ width: '100%' }}>
                                <AgGridReact
                                    rowData={clusterAnalysis}
                                    columnDefs={clusterColumnDefs}
                                    // domLayout="normal"
                                    suppressColumnVirtualisation={true}
                                    suppressAutoSize={false}
                                    tooltipShowDelay={500}
                                    tooltipHideDelay={2000}
                                    rowHeight={60}
                                    domLayout="autoHeight"
                                    headerHeight={50}
                                    enableCellTextSelection={true}
                                    suppressMovableColumns={true}
                                    suppressDragLeaveHidesColumns={true}
                                    animateRows={true}
                                    defaultColDef={{
                                        sortable: true,
                                        filter: true,
                                        resizable: true,
                                        wrapHeaderText: true, // <-- enable this
                                        autoHeaderHeight: true, // <-- enable this
                                        cellStyle: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            padding: '0 12px',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignAnalysisTable;