import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { AnalyticsData } from "./types";

interface AnalyticsTableProps {
  rowData: AnalyticsData[];
  columnDefs: ColDef[];
  loading: boolean;
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  rowData,
  columnDefs,
  loading,
}) => {
  return (
    <>
      {loading ?  (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
        <div
          // style={{
          //   minHeight: "400px",
          //   maxHeight: "600px",
          //   overflowY: "auto",
          //   width: "100%",
          // }}
          className="p-4 w-[65rem] overflow-x-auto overflow-y-auto"
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={false}
            domLayout="autoHeight"
            className="quartz "
          />
        </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsTable;
