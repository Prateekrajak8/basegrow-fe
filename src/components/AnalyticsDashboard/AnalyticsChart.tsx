import React from "react";
import { Bar } from "react-chartjs-2";
import { AnalyticsData } from "./types";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnalyticsChartProps {
  data: AnalyticsData[];
  loading: boolean;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="text-center">Loading Chart...</div>;
  }
  if (data.length === 0) {
    return <div className="text-center">No data available</div>;
  }

  const chartData = {
    labels: data.map((item) => item.date), // X-axis (Dates)
    datasets: [
      {
        label: "Sent",
        data: data.map((item) => item.sent),
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
      },
      {
        label: "Unique Opens",
        data: data.map((item) => item.uniqueOpens),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Teal
      },
      {
        label: "Total Clicks",
        data: data.map((item) => item.totalClicks),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Red
      },
      {
        label: "Unique Clicks",
        data: data.map((item) => item.uniqueClicks),
        backgroundColor: "rgba(255, 205, 86, 0.6)", // Yellow
      },
    ],
  };
 
  const chartCrtData = {
    labels: data.map((item) => item.date), // X-axis (Dates)
    datasets: [
      {
        label: "CTR",
        data: data.map((item) => item.ctrrate),
        // data: [avgCtr],
        backgroundColor: "rgb(2, 122, 184)", // Blue
      },
      {
        label: "UCTR",
        data: data.map((item) => item.uctrrate),
        // data: [avgCtr, avgUctr],
        backgroundColor: "rgb(255, 187, 40)", // Teal
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
      x: { title: { display: true, text: "Date" }, grid: { display: false } },
      y: { title: { display: true, text: "Value" }, beginAtZero: true },
    },
    onHover: (event: any, chartElement: any) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
  };
  const optionsCtr = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Email Campaign Analytics" },
    },
    scales: {
      x: { title: { display: true, text: "Date" }, grid: { display: false } },
      y: { title: { display: true, text: "Value (%)" }, beginAtZero: true },
    },
    onHover: (event: any, chartElement: any) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
  };

  return (
    <div className={`flex  gap-8 p-4 ${data.length===1?"flex-row":"flex-col"}` }>
    <div style={{ height: "400px", width: "100%" }} className="shadow-sm border border-gray-100 ">
      <Bar data={chartData} options={options} className="p-4"/>
    </div>
    <div style={{ height: "400px", width: "100%" }} className="shadow-sm border border-gray-100">
      <Bar data={chartCrtData} options={optionsCtr} className="p-4"/>
    </div>
    </div>
  );
};

export default AnalyticsChart;
