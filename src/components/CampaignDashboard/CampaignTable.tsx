"use client"
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import CampaignNameRenderer from "../CampaignNameRenderer";
import axios from "axios";
import { MdRefresh } from "react-icons/md";
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
    CellStyleModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    TooltipModule,
    TextFilterModule,
    CustomFilterModule,
    CellStyleModule
]);

interface CampaignData {
    name: string;
    sent: number;
    uniqueClickers: number;
    id: number;
    statId: number;
    totalClicks: number;
    hardBounce: number;
    softBounce: number;
    uniqueOpeners: number;
    unsubscribes: number;
    complaints: number;
    createdAt: string;
}

interface CampaignTableProps {
    accountId: number;
    campaignCountry: string;
    onCampaignNamesUpdate?: (names: string[]) => void;
}

const formatIndianNumber = (num: number): string => {
    if (isNaN(num)) return "0";
    return num
        .toLocaleString("en-IN") // Indian numbering system (12,500 / 1,30,800 / 10,00,000)
        .replace(/,/g, ".");     // replace commas with dots
};

const CampaignTable: React.FC<CampaignTableProps> = ({ accountId, onCampaignNamesUpdate, campaignCountry }) => {
    const [rowData, setRowData] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const gridRef = useRef<AgGridReact>(null);
    console.log(campaignCountry, "country inside table")
    const calculatePercentage = (numerator: number, denominator: number): string => {
        if (denominator === 0) return "0.00%";
        return ((numerator / denominator) * 100).toFixed(2) + "%";
    };
   const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use the accountId prop in the API call
            const query = accountId ? `?accountId=${accountId}` : "";
            const response = await axios.get(`/api/mailcamp/fetch-campaign-data${query}`);
            let responseData = response.data;

            responseData.sort((a: CampaignData, b: CampaignData) => {
                const dateA = parseInt(a.name.split(" ")[0]);
                const dateB = parseInt(b.name.split(" ")[0]);
                return dateB - dateA;
            });

            setRowData(responseData);
            const campaignNames = responseData.map((campaign: CampaignData) => campaign.name);
            if (onCampaignNamesUpdate) {
                onCampaignNamesUpdate(campaignNames);
            }

        } catch (err: any) {
            console.info(err?.message || 'Error fetching data:', err);
            // setError(err?.message);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch data when accountId changes
    useEffect(() => {
        fetchData();
    }, [accountId]);

    const refreshData = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    // Performance Badge Component
    const PerformanceBadge = ({ value, type }: { value: string; type: 'opens' | 'clicks' | 'bounce' }) => {
        const numValue = parseFloat(value.replace('%', ''));
        // let bgColor = 'bg-gray-100 text-gray-600';
        // let borderColor = 'border-gray-200';

        // if (type === 'opens') {
        //     if (numValue >= 25) {
        //         // bgColor = 'bg-green-100 text-green-800';
        //         borderColor = 'border-green-200';
        //     } else if (numValue >= 15) {
        //         // bgColor = 'bg-yellow-100 text-yellow-800';
        //         borderColor = 'border-yellow-200';
        //     } else {
        //         bgColor = 'bg-red-100 text-red-800';
        //         borderColor = 'border-red-200';
        //     }
        // } else if (type === 'clicks') {
        //     if (numValue >= 5) {
        //         bgColor = 'bg-green-100 text-green-800';
        //         borderColor = 'border-green-200';
        //     } else if (numValue >= 2) {
        //         bgColor = 'bg-yellow-100 text-yellow-800';
        //         borderColor = 'border-yellow-200';
        //     } else {
        //         bgColor = 'bg-red-100 text-red-800';
        //         borderColor = 'border-red-200';
        //     }
        // } else if (type === 'bounce') {
        //     if (numValue <= 2) {
        //         bgColor = 'bg-green-100 text-green-800';
        //         borderColor = 'border-green-200';
        //     } else if (numValue <= 5) {
        //         bgColor = 'bg-yellow-100 text-yellow-800';
        //         borderColor = 'border-yellow-200';
        //     } else {
        //         bgColor = 'bg-red-100 text-red-800';
        //         borderColor = 'border-red-200';
        //     }
        // }

        return (
            <span>
                {value}
            </span>
        );
    };


    // Number Badge Component
    const NumberBadge = ({ value, type }: { value: number; type: 'sent' | 'bounce' | 'unsubscribe' | 'complaint' }) => {
        let bgColor = 'bg-blue-100 text-blue-800 border-blue-200';

        if (type === 'bounce' || type === 'unsubscribe' || type === 'complaint') {
            if (value === 0) {
                bgColor = 'bg-green-100 text-green-800 border-green-200';
            } else if (value <= 10) {
                bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            } else {
                bgColor = 'bg-red-100 text-red-800 border-red-200';
            }
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-semibold border ${bgColor}`}>
                {value.toLocaleString()}
            </span>
        );
    };

    const columnDefsAlternative: ColDef[] = [
        {
            headerName: "Campaign Name",
            field: "name",
            flex: 2,
            // width: 220,
            tooltipField: "name",
            headerTooltip: "Campaign Name",
            minWidth: 210,
            // cellRenderer: CampaignNameRenderer,
            cellRenderer: CampaignNameRenderer,
            cellRendererParams: {
                campaignCountry: campaignCountry,
                redirectPath: "/campaignFavotripDetail" // Optional
            }
        },
        {
            headerName: "Sent",
            headerTooltip: "Sent",
            field: "sent",
            width: 100,
            tooltipField: "sent",
           cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Hard\nBounce",
            headerTooltip: "Hard Bounce",
            field: "hardBounce",
            width: 110,
            // flex:2,
            tooltipField: "hardBounce",
            wrapHeaderText: true,
            autoHeaderHeight: true,
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Soft Bounce",
            headerTooltip: "Soft Bounce",
            field: "softBounce",
            width: 110,
            tooltipField: "softBounce",
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },

        {
            headerName: "Unique Openers",
            headerTooltip: "Unique Openers",
            field: "uniqueOpeners",
            width: 110,
            tooltipField: "uniqueOpeners",
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Unique Opens / Sent",
            headerTooltip: "% Unique Opens / Sent",
            field: "uniqueOpeners",
            width: 110,
            cellRenderer: (params: ICellRendererParams) => {
                const uniqueOpeners = params.data?.uniqueOpeners || 0;
                const sent = params.data?.sent || 0;
                const percentage = calculatePercentage(uniqueOpeners, sent);
                return <PerformanceBadge value={percentage} type="opens" />;
            }
        },
        {
            headerName: "Total Clicks",
            headerTooltip: "Total Clicks",
            field: "totalClicks",
            width: 90,
            tooltipField: "totalClicks",
            // cellRenderer: (params: ICellRendererParams) => (
            //     <div className="flex items-center">
            //         <span>
            //             {(params.value || 0).toLocaleString()}
            //         </span>
            //     </div>
            // )
             cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },

        {
            headerName: "Unique Clickers",
            headerTooltip: "Unique Clickers",
            field: "uniqueClickers",
            width: 110,
            tooltipField: "uniqueClickers",
            // cellRenderer: (params: ICellRendererParams) => (
            //     <div className="flex items-center">
            //         <span>
            //             {(params.value || 0).toLocaleString()}
            //         </span>
            //     </div>
            // )
             cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Total Clicks / Sent",
            headerTooltip: "% Total Clicks / Sent",
            field: "totalClicks",
            width: 120,
            cellRenderer: (params: ICellRendererParams) => {
                const totalClicks = params.data?.totalClicks || 0;
                const sent = params.data?.sent || 0;
                const percentage = calculatePercentage(totalClicks, sent);
                return <PerformanceBadge value={percentage} type="clicks" />;
            }
        },
        {
            headerName: "% Unique Clickers / Sent",
            headerTooltip: "% Unique Clickers / Sent",
            field: "uniqueClickers",
            width: 120,
            cellRenderer: (params: ICellRendererParams) => {
                const uniqueClickers = params.data?.uniqueClickers || 0;
                const sent = params.data?.sent || 0;
                const percentage = calculatePercentage(uniqueClickers, sent);
                return <PerformanceBadge value={percentage} type="clicks" />;
            }
        },
        {
            headerName: "Unsubscribes",
            headerTooltip: "Unsubscribes",
            field: "unsubscribes",
            tooltipField: "unsubscribes",
            width: 140,
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Complaints",
            headerTooltip: "Complaints",
            field: "complaints",
            tooltipField: "complaints",
            width: 125,
           cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
    ];

 

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-red-100 rounded-full p-4 mb-4">
                    <div className="text-red-600 text-2xl">⚠️</div>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Campaign Data</h3>
                <p className="text-red-700 text-center max-w-md mb-4">{error}</p>
                <button
                    onClick={refreshData}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <MdRefresh className="w-4 h-4 mr-2" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading campaign data...</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your campaigns</p>
                </div>
            ) : (
                <div className="p-4">
                    <div className="ag-theme-alpine" style={{ width: '100%' }}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefsAlternative}
                            domLayout="autoHeight"
                            suppressHorizontalScroll={true}
                            suppressColumnVirtualisation={true}
                            rowHeight={60}
                            headerHeight={50}
                            animateRows={true}
                            tooltipShowDelay={500}
                            tooltipHideDelay={2000}
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
                </div>
            )}
        </div>
    );
};

export default CampaignTable;
