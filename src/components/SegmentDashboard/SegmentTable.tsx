"use client";
import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import {
  ColDef,
  GridReadyEvent,
  RowClickedEvent,
  ModuleRegistry,
  ICellRendererParams,  // Import ModuleRegistry
} from "ag-grid-community";
import { useSearchParams } from "next/navigation";
import { TooltipModule } from "ag-grid-community"; // Import TooltipModule
import { SegmentData } from "./SegmentType";
import { ColumnAutoSizeModule } from 'ag-grid-community';
import CustomTooltip from "../CustomTooltip";
import { CellStyleModule } from "ag-grid-community";
// Register the TooltipModule
ModuleRegistry.registerModules([TooltipModule, ColumnAutoSizeModule, CellStyleModule,]);

interface SegmentTableProps {
  rowData: SegmentData[];
  columnDefs: ColDef[];
  loading: boolean;
}
interface TableContext {
  isNavigating: boolean;
  clickedRowId: string | null;
}

const SegmentTable: React.FC<SegmentTableProps> = ({
  rowData,
  columnDefs,
  loading,
}) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const eventName = searchParams.get("eventName") || "null";
  const event_id = searchParams.get("eventId") || "null";
  const onGridReady = (params: GridReadyEvent) => {
    // Auto-size all columns after the grid is ready
    params.api.sizeColumnsToFit();
  };


  const updatedColumnDefs: ColDef[] = columnDefs.map((colDef) => ({
    ...colDef,
    headerTooltip: colDef.headerName, // Tooltip for all column headers
    tooltipField: colDef.field, // Tooltip for cell values
    cellRenderer: colDef.cellRenderer || ((params: ICellRendererParams) => {
      // Access context from params which is available in AG Grid's ICellRendererParams
      const context = params.context as TableContext;

      if (context.isNavigating && params.node.id === context.clickedRowId) {
        return (
          <div className="flex items-center">
            <div className="mr-2 animate-spin rounded-full h-4 w-6 border-b-2 border-blue-500"></div>
            <span>{params.valueFormatted || params.value}</span>
          </div>
        );
      }

      return params.valueFormatted || params.value;
    })
  }));

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="p-4 w-[65rem] overflow-x-auto overflow-y-auto cursor-pointer">
            <AgGridReact
              rowData={rowData}
              columnDefs={updatedColumnDefs}
              pagination={true}
              paginationPageSize={10}
              // components={{ customTooltip: CustomTooltip }} //
              paginationAutoPageSize={false}
              domLayout="autoHeight"
              className="quartz"
              onGridReady={onGridReady}
              // onRowClicked={onRowClicked}
              tooltipShowDelay={0}
              tooltipHideDelay={2000}
              context={{ isNavigating, clickedRowId }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SegmentTable;
