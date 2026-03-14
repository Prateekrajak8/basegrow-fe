'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSheetData } from '../actions/googleSheets';
import { SheetRow } from '../types/sheet';
import { AgGridReact } from 'ag-grid-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AnalyticsDashboard/AnalyticsDashboard.css';

import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ColumnAutoSizeModule,
  TooltipModule,
  CellStyleModule
} from 'ag-grid-community';
import axios from 'axios';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ColumnAutoSizeModule,
  TooltipModule,
  CellStyleModule
]);

interface SpreadsheetViewerProps {
  refreshInterval?: number;
  sheetRange?: string;
  title?: string;
}

export default function SpreadsheetViewer({
  refreshInterval = 30000,
  sheetRange = 'Sheet1!A1:Z1000',
  title = 'Spreadsheet Data'
}: SpreadsheetViewerProps) {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [parsedData, setParsedData] = useState<SheetRow[]>([]);
  const [filteredData, setFilteredData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
 const [spreadSheetUrl,setSpreadSheetUrl] = useState("")
  useEffect(() => {
    const fetchUserSpreadsheetUrl = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = Number(localStorage.getItem("userId"));
            const response = await axios.post("/api/click-stats/get-user-data",{userId},
                {
                    headers: {
                      "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },                  
                });
            setSpreadSheetUrl(response.data[0]?.link)
            console.log(response.data[0].link,"spreatsheet url")
            setLoading(false)
            // setUsers(transformedUsers);
        } catch (error) {
            console.log("Error fetching users:", error);
        }
    };

    fetchUserSpreadsheetUrl();
}, []);
 console.log(spreadSheetUrl,"spreadsheeturl")
  const fetchData = useCallback(async () => {
    if (!spreadSheetUrl) return;
    try {

      setLoading(true);
      const { raw, timestamp } = await fetchSheetData(sheetRange,spreadSheetUrl);
      setRawData(raw);

      const transformedData: SheetRow[] = raw
        .filter(row => row.length >= 3)
        .map(row => {
          const date = new Date(row[0]);
          const formattedDate = !isNaN(date.getTime())
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            : row[0];

          return {
            Date: formattedDate,
            URL: row[1],
            Opens: parseInt(row[2]) || 0
          };
        });

      setParsedData(transformedData);
      setLastUpdated(new Date(timestamp));
      setError(null);
    } catch (err) {
      setError('Failed to fetch spreadsheet data');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [sheetRange,spreadSheetUrl]);

  useEffect(() => {
    if (!spreadSheetUrl) return;
    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval,spreadSheetUrl]);

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(parsedData);
      return;
    }

    const filterStart = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const filterEnd = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

    const filtered = parsedData.filter(row => {
      const rawDate = row.Date;
      const rowDate = new Date(
        typeof rawDate === 'string' || typeof rawDate === 'number' ? rawDate : ''
      );
    
      if (isNaN(rowDate.getTime())) return false;
    
      if (filterStart && rowDate < filterStart) return false;
      if (filterEnd && rowDate > filterEnd) return false;
    
      return true;
    });

    setFilteredData(filtered);
  }, [parsedData, startDate, endDate]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: 'Date',
      field: 'Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      resizable: true,
      flex: 1,
      minWidth: 120,
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          if (isNaN(cellDate.getTime())) return -1;
          if (cellDate < filterLocalDateAtMidnight) return -1;
          if (cellDate > filterLocalDateAtMidnight) return 1;
          return 0;
        }
      },
      valueFormatter: (params: any) => params.value
    },
    {
      headerName: 'Link',
      field: 'URL',
      sortable: true,
      filter: true,
      resizable: true,
      flex: 3,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const url = params.value;
        try {
          const display = new URL(url).href;
          return display.length > 100 ? display.slice(0, 100) + '...' : display;
        } catch {
          return url.length > 100 ? url.slice(0, 100) + '...' : url;
        }
      },
      tooltipField: 'URL'
    },
    {
      headerName: 'Total Opens',
      field: 'Opens',
      sortable: true,
      filter: 'agNumberColumnFilter',
      resizable: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return isNaN(value) ? params.value : value.toLocaleString();
      }
    }
  ], []);

  return (
    <div className="bg-white rounded-lg shadow-md  ">
      <div className="flex gap-4 items-center mb-4  ml-4">
        <label className="text-md font-semibold text-gray-600">Start:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="border w-40 h-10 rounded px-2"
          placeholderText="Select start date"
          maxDate={endDate || new Date()}
          withPortal
        />

        <label className="text-md font-semibold text-gray-600">End:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="border w-40 h-10 rounded px-2"
          placeholderText="Select end date"
          minDate={startDate || undefined}
          maxDate={new Date()}
          withPortal
        />
      </div>  

      {loading  ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data...</span>
        </div>
      ) : (
        <div className="ag-theme-alpine " style={{ width: '100%', height: '500px' }}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            onGridReady={onGridReady}
            tooltipShowDelay={0}
            tooltipHideDelay={2000}
            defaultColDef={{
              flex: 1,
              minWidth: 100,
              filter: true,
              sortable: true,
              resizable: true
            }}
          />
        </div>
      )}
    </div>
  );
}