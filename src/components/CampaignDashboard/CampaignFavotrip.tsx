"use client"
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import CampaignNameRenderer from "../CampaignNameRenderer";
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

const CampaignFavotripTable = () => {

    const [rowData, setRowData] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const gridRef = useRef<AgGridReact>(null);

    const calculatePercentage = (numerator: number, denominator: number): string => {
        if (denominator === 0) return "0.00%";
        return ((numerator / denominator) * 100).toFixed(2) + "%";
    };

    const columnDefsAlternative: ColDef[] = [
        {
            headerName: "Campaign Name", field: "name", width: 200,
            tooltipField: "name",
            headerTooltip: "Campaign Name",
            minWidth: 150,
            cellRenderer: CampaignNameRenderer,
            cellRendererParams: {
                redirectPath: "/campaignFavotripDetail" // Custom path
            }
        },
        {
            headerName: "Sent",
            headerTooltip: "Sent",
            field: "sent",
            width: 100,
            tooltipField: "sent",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "Hard Bounce",
            headerTooltip: "Hard Bounce",
            field: "hardBounce",
            width: 100,
            tooltipField: "hardBounce",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "Soft Bounce",
            headerTooltip: "Soft Bounce",
            field: "softBounce",
            width: 100,
            tooltipField: "sent",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
         {
            headerName: "Unsubscribes",
            headerTooltip: "Unsubscribes",
            field: "unsubscribes",
            tooltipField: "unsubscribes",
            width: 120,
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "Complaints",
            headerTooltip: "Complaints",
            field: "complaints",
            tooltipField: "complaints",
            width: 115,
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "Unique Openers",
            headerTooltip: "Unique Openers",
            field: "uniqueOpeners",
            width: 110,
            tooltipField: "uniqueOpeners",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "% Unique Opens / Sent",
            headerTooltip: "% Unique Opens / Sent",
            field: "uniqueOpeners",
            width: 110,
            valueFormatter: (params) => {
                const uniqueOpeners = params.data?.uniqueOpeners || 0;
                const sent = params.data?.sent || 0;
                return calculatePercentage(uniqueOpeners, sent);
            }
        },
        {
            headerName: "Total Clicks",
            headerTooltip: "Total Clicks",
            field: "totalClicks",
            width: 120,
            tooltipField: "totalClicks",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
         {
            headerName: "% Total Clicks / Sent",
            headerTooltip: "% Total Clicks / Sent",
            field: "totalClicks",
            width: 120,
            valueFormatter: (params) => {
                const totalClicks = params.data?.totalClicks || 0;
                const sent = params.data?.sent || 0;
                return calculatePercentage(totalClicks, sent);
            }
        },
         {
            headerName: "Unique Clickers",
            headerTooltip: "Unique Clickers",
            field: "uniqueClickers",
            width: 120,
            tooltipField: "uniqueClickers",
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
        },
        {
            headerName: "% Unique Clickers / Sent",
            headerTooltip: "% Unique Clickers / Sent",
            field: "uniqueClickers",
            width: 120,
            valueFormatter: (params) => {
                const uniqueClickers = params.data?.uniqueClickers || 0;
                const sent = params.data?.sent || 0;
                return calculatePercentage(uniqueClickers, sent);
            }
        }
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/mailcamp/fetch-campaign-data?accountId=2');
            let responseData = response.data;

            responseData.sort((a: CampaignData, b: CampaignData) => {
                const dateA = parseInt(a.name.split(" ")[0]);
                const dateB = parseInt(b.name.split(" ")[0]);
                return dateB - dateA;
            });

            setRowData(responseData);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err?.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex flex-col items-center justify-center">
                    <div className="px-4 w-[65rem] min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-red-600">
                            <p className="mb-2">Error loading data: {error}</p>
                            <button
                                onClick={refreshData}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col items-center justify-center">
                {/* <div>
                    <h2 className="mt-2 font-bold text-lg">Favotrip Campaign Table</h2>
                </div> */}

                {
                    loading ? <div className="flex flex-col gap-2">
                        <div className="flex flex-col items-center justify-center">
                            <div className="px-4 w-[65rem] min-h-[400px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p>Loading campaign data...</p>
                                </div>
                            </div>
                        </div>
                    </div> :

                        <div className="px-8 p-4 w-[95rem] mb-4 mt-8">
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefsAlternative}
                                // pagination={true}
                                // paginationPageSize={pageSize}
                                domLayout="autoHeight"
                                className="quartz"
                                suppressColumnVirtualisation={true}
                                suppressAutoSize={true}
                                tooltipShowDelay={500}
                                tooltipHideDelay={2000}
                            />
                        </div>}
            </div>
        </div>
    );
};

export default CampaignFavotripTable;