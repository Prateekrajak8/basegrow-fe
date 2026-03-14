'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSheetData } from '../actions/googleSheets';
import { SheetRow } from '../types/sheet';
import { AgGridReact } from 'ag-grid-react';
import "./AnalyticsDashboard/AnalyticsDashboard.css";
import {
    ColDef,
    CustomFilterModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ValidationModule,
    GridReadyEvent,
    ColumnAutoSizeModule
} from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  TextFilterModule,
  CustomFilterModule,
  ColumnAutoSizeModule, 
]);
interface SpreadsheetViewerProps {
  refreshInterval?: number; // in milliseconds
  sheetRange?: string;
  title?: string;
}

export default function SpreadsheetViewer({
  refreshInterval = 30000, // Default: refresh every 30 seconds
  sheetRange = 'Sheet1!A1:Z1000',
  title = 'Spreadsheet Data'
}: SpreadsheetViewerProps) {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [parsedData, setParsedData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // const { raw, parsed, timestamp } ="", 
      const raw:any=""
      const parsed:any=""
      const timestamp:any=""
      //  await fetchSheetData(sheetRange);
      setRawData(raw);
      setParsedData(parsed);
      setLastUpdated(new Date(timestamp));
      setError(null);
    } catch (err) {
      setError('Failed to fetch spreadsheet data');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [sheetRange]);

  useEffect(() => {
    fetchData();
    
    // Set up polling interval to refresh data
    const intervalId = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval]);
  const onGridReady = (params: GridReadyEvent) => {
        // You can perform operations when the grid is ready
        params.api.sizeColumnsToFit();
      };

  // Extract headers from the first row of raw data
  const headers = rawData.length > 0 ? rawData[0] : [];
  const columnDefs = useMemo(() => {
    return headers.map((header) => ({
      headerName: header,
      field: header,
      sortable: true,
      filter: true,
      resizable: true,
    }));
  }, [headers]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        {/* <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </span>
          ) : 'Refresh Data'}
        </button> */}
      </div>
      
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {loading && !rawData.length ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              {/* <tr>
                {headers.map((header, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr> */}
              <tr>
                <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left  text-gray-500 uppercase tracking-wider">Link</th>
                <th className="px-6 py-3 text-left  text-gray-500 uppercase tracking-wider">Total Open</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parsedData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {headers.map((header, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
              {parsedData.length === 0 && !loading && (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="ag-theme-alpine w-full h-[600px]">
            
            <AgGridReact
                 rowData={parsedData}
                 columnDefs={columnDefs}
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
            />
        </div>

        </div>
      )}
    </div>
  );
}