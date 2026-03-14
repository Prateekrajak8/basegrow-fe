import React from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { ComparisonData } from "./types";
import { ListId } from "./types";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
// import { AnalyticsData } from "./types";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import AnalyticsComparisonSummary from "../AnalyticsSummary/analyticscomparisonsummary";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface AnalyticsComparisonTableProps {
  rowData: ComparisonData[];
  loading: boolean;
}
interface RowData {
  total_sent: number;
  mail_clicks: number;
  social_clicks: number;
  total_clicks: number;
}
const AnalyticsComparisonTable: React.FC<AnalyticsComparisonTableProps> = ({
  rowData,
  loading,
}) => {
  const listIds: ListId[] = [
    { name: "All", list_id: "all" },
    { name: "TravelWhale NL Netherland", list_id: 203540 },
    { name: "TravelWhale DE Germany", list_id: 217478 },
    { name: "TravelWhale DK Denmark", list_id: 1259703 },
    { name: "TravelWhale FR France", list_id: 1261035 },
    { name: "TravelWhale SE Sweden", list_id: 1260311 },
    { name: "TravelWhale UK England", list_id: 1261054 },
  ];
  let alternativeRowData = [
    { metric: "TravelWhale NL Netherland",  total_sent: 0, mail_clicks: 0 },
    { metric: "TravelWhale DE Germany", total_sent: 0, mail_clicks: 0 },
    { metric: "TravelWhale DK Denmark", total_sent: 0, mail_clicks: 0 },
    { metric: "TravelWhale SE Sweden", total_sent: 0, mail_clicks: 0 },
    { metric: "TravelWhale UK England", total_sent: 0, mail_clicks: 0 },
    { metric: "TravelWhale FR France", total_sent: 0, mail_clicks: 0  },
  ];
  const columnDefsAlternative: ColDef[] = [
    { headerName: "Metric", field: "metric", pinned: "left" },
    { 
      headerName: "Total Sent", 
      field: "total_sent", 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
    },
    { 
      headerName: "Mail Clicks", 
      field: "mail_clicks", 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
    },
    { 
      headerName: "Social Clicks", 
      field: "social_clicks", 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
    },
    { 
      headerName: "Total Clicks", 
      field: "total_clicks", 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : params.value
    }
  ];  
  if (loading) {
    return <div className="text-center">Loading Data...</div>
  }


  const updatedAlternativeRowData: any = alternativeRowData.map(row => {
    const matchedList = listIds.find(list => list.name.trim() === row.metric.trim());
    if (!matchedList) {
      return { ...row, total_sent: 0, mail_clicks: 0, social_clicks: 0, total_clicks: 0 };
    }

    const listIdNumber = Number(matchedList.list_id);

    const matchingData = rowData.find((item: any) => item.list_id === listIdNumber);

    return {
      ...row,
      total_sent: matchingData?.total_sent || 0,
      mail_clicks: matchingData?.total_clicks || 0,
      social_clicks: 0,
      total_clicks: 0,
    };
  });
 
  const countryLabels = updatedAlternativeRowData.map((item: any) => item.metric);
  const totalSentData = updatedAlternativeRowData.map((item: any) => item.total_sent);
  const mailClicksData = updatedAlternativeRowData.map((item: any) => item.mail_clicks);
  const totalSentSum =  totalSentData?.length ?totalSentData.reduce((acc: number, val: number) => acc + val, 0):0;
const mailClicksSum =  mailClicksData?.length ?mailClicksData.reduce((acc: number, val: number) => acc + val, 0):0;

// Convert values to percentages
const totalSentPercentage = totalSentData.map((value:any) =>
  totalSentSum ? ((value / totalSentSum) * 100).toFixed(2) : "0"
);

const mailClicksPercentage = mailClicksData.map((value:any) =>
  mailClicksSum ? ((value / mailClicksSum) * 100).toFixed(2) : "0"
);

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // `as const` ensures it's a valid literal type
        //  title:{ display: true, text: "Email Campaign Analytics" },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            console.log("Tooltip Data:", tooltipItem);
            
            // Ensure data is available before accessing it
            if (!tooltipItem || !tooltipItem.dataset || !tooltipItem.dataset.data) {
              return "No Data";
            }
  
            // Ensure the index exists in the dataset
            const dataIndex = tooltipItem.dataIndex;
            const dataset = tooltipItem.dataset.data;
  
            if (dataIndex >= dataset.length) {
              return "Invalid Data";
            }
  
            return `Value: ${dataset[dataIndex]}`;
          }
        }
      }
    },
  };
  const pieChartDataTotalSent = {
    labels: countryLabels,
    datasets: [
      {
        label: "Total Sent %",
        data: totalSentPercentage, // Use percentages instead of raw values
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "rgb(222, 92, 164)","rgb(84, 34, 3)","rgb(19, 156, 85)"],
      },
    ],
  };
  const pieChartDataMailClicks = {
    labels: countryLabels,
    datasets: [
      {
        label: "Mail Clicks %",
        data: mailClicksPercentage , // Use percentages instead of raw values
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "rgb(222, 92, 164)","rgb(84, 34, 3)","rgb(19, 156, 85)"],
      },
    ],
  };

  const chartData = {
    labels: updatedAlternativeRowData.map((item: any) => item.metric), // X-axis: Country Names
    datasets: [
      {
        label: "Total Sent",
        data: updatedAlternativeRowData.map((item: any) => item.total_sent), // Y-axis: Total Sent Values
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue color
      },
      {
        label: "Mail Clicks",
        data: updatedAlternativeRowData.map((item: any) => item.mail_clicks),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Teal
      },
      {
        label: "Social Clicks",
        data: updatedAlternativeRowData.map((item: any) => item.social_clicks),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
      },
      {
        label: "Total Clicks",
        data: updatedAlternativeRowData.map((item: any) => item.total_clicks),
        backgroundColor: "rgba(255, 205, 86, 0.6)", // Yellow
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Email Campaign Analytics" },
    },
    scales: {
      x: {
        title: { display: true, text: "Country" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Value" },
        beginAtZero: true,
      },
    },
  };
  const totalSummary = updatedAlternativeRowData.reduce(
    (acc: { totalSent: number; totalMailClicks: number; totalSocialClicks: number; totalClicks: number }, item:RowData) => {
      acc.totalSent += (item.total_sent|| 0);
      acc.totalMailClicks += (item.mail_clicks || 0);
      acc.totalSocialClicks += (item.social_clicks || 0);
      acc.totalClicks += (item.total_clicks || 0);
      return acc;
    },
    { totalSent: 0, totalMailClicks: 0, totalSocialClicks: 0, totalClicks: 0 }
  );
  if (!totalSentData || !mailClicksData) {
    return <p>Loading data...</p>;
  }
  return (
    <div className="flex flex-col gap-2">

      <div className="flex flex-col items-center justify-center">
        <div
          // style={{
          //   minHeight: "400px",
          //   maxHeight: "600px",
          //   overflowY: "auto",
          //   // width: "100%",
          // }}
          className="px-4  w-[65rem] overflow-y-auto min-h-[400px] max-h-[600px]"
        >
          <AgGridReact
            rowData={updatedAlternativeRowData}
            columnDefs={columnDefsAlternative}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={false}
            domLayout="autoHeight"
            className="quartz"
          />
        </div>
      </div>
      <div className="flex flex-row justify-between px-4  h-[700px] shadow-sm">
        {/* <div className="flex flex-col "> */}
        <div className="flex flex-col w-1/3 gap-4 ml-16 ">
          <div className="relative w-full h-[300px]">
            <h3 className="ml-16 font-semibold text-gray-800">Email Campaign Analytics</h3>
            {/* <Pie
              data={{ labels: countryLabels, datasets: [{ label: "Total Sent", data: totalSentData, backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"] }] }}
              options={pieChartOptions}
            /> */}
            <Pie data={pieChartDataTotalSent} options={pieChartOptions} />
            <h3 className="ml-24 font-semibold text-gray-800 mt-2">Total Send (%)</h3>

          </div>
          <div className="relative w-full h-[300px] mt-10">
            {/* <Pie
              data={{ labels: countryLabels, datasets: [{ label: "Mail Clicks", data: mailClicksData, backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"] }] }}
              options={pieChartOptions}
            /> */}
            <Pie data={pieChartDataMailClicks} options={pieChartOptions} />
            <h3 className="ml-24 font-semibold text-gray-800 mt-2"> Email Click (%)</h3>

          </div>
        </div>
        {/* </div> */}
        <div className="w-2/3 min-h-[600px] max-h-[800px]">
          <Bar data={chartData} options={options} />
        </div>
      </div>
      <AnalyticsComparisonSummary 
       totalSent={totalSummary.totalSent}
       totalMailClicks={totalSummary.totalMailClicks}
       totalClicks={totalSummary.totalClicks}
       totalSocialClicks={totalSummary.totalSocialClicks}/>
    </div>
  );
};
export default AnalyticsComparisonTable;
