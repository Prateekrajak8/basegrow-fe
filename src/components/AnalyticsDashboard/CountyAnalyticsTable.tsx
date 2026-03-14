import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { CountryAnalyticsData } from "./types";

interface AnalyticsCountryTableProps {
  data: CountryAnalyticsData[];
  loading: boolean;
}

const AnalyticsCountryTable: React.FC<AnalyticsCountryTableProps> = ({ data, loading }) => {
  // Group data by country
  const countriesData = useMemo(() => {
    const groupedByCountry: Record<string, CountryAnalyticsData[]> = {};

    if (data && data.length > 0) {
      data.forEach(item => {
        if (!groupedByCountry[item.country]) {
          groupedByCountry[item.country] = [];
        }
        groupedByCountry[item.country].push(item);
      });

      // Data is already sorted by date in the processCountryData function
    }

    return groupedByCountry;
  }, [data]);

  // Get unique countries in alphabetical order
  const countries = useMemo(() => {
    return Object.keys(countriesData).sort();
  }, [countriesData]);

  const columnDefs: ColDef[] = [
    {
      headerName: "Date",
      field: "date",
      sortable: true,
      filter: true,
      width: 130,
      flex: 1
    },
    {
      headerName: "Sent",
      field: "totalSent",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? Number(params.value).toLocaleString() : "0",
      width: 120,
      flex: 1
    },

    {
      headerName: "Social Clicks",
      field: "socialClicks",
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        const totalClicks = params.data?.totalSent || 0;
        const value = params.value || 0;
        const percentage = totalClicks ? ((value / totalClicks) * 100).toFixed(2) : "0.00";
        return `${Number(value).toLocaleString()} (${percentage}%)`;
      },
      width: 180,
      flex: 1.5
    },
    {
      headerName: "Email Clicks",
      field: "emailClicks",
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        const totalClicks = params.data?.totalSent || 0;
        const value = params.value || 0;
        const percentage = totalClicks ? ((value / totalClicks) * 100).toFixed(2) : "0.00";
        return `${Number(value).toLocaleString()} (${percentage}%)`;
      },
      width: 180,
      flex: 1.5
    },
    {
      headerName: "Total Clicks",
      field: "totalClicks",
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        const sent = params.data?.totalSent || 0;
        const value = params.value || 0;
        const percentage = sent ? ((value / sent) * 100).toFixed(2) : "0.00";
        return `${Number(value).toLocaleString()} (${percentage}%)`;
      },
      width: 180,
      flex: 1.5
    }
  ];

  // Default options for AG Grid
  const defaultColDef = {
    resizable: true
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        {/* <h2 className="text-xl font-semibold mb-4">Country-specific Analytics</h2> */}
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Loading country data...</span>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        {/* <h2 className="text-xl font-semibold mb-4">Country-specific Analytics</h2> */}
        <div className="text-center py-6 text-gray-500">
          No country-specific data available. Please select "All" as the list ID to view country data.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8 ml-4 mr-4 items-center">
      {/* <h2 className="text-xl font-semibold mb-4">Country-specific Analytics</h2> */}

      {countries.map(country => (
        <div key={country} className="mb-10 gap-4">
          <h3 className="text-lg font-medium mb-3 text-blue-700 pb-2">{country}</h3>
          <div className="ag-theme-quartz w-100 " style={{
            minHeight: 100,
            height: Math.max(
              200,
              Math.min(500, 52 + (countriesData[country]?.length || 0) * 48)
            )
          }}
          //  style={{ height: Math.min(500, 52 + countriesData[country].length * 48) }}
          >
            <AgGridReact
              rowData={countriesData[country]}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
                  pagination={true}
              paginationPageSize={10}
              paginationAutoPageSize={false}
              animateRows={true}
              domLayout="autoHeight"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCountryTable;