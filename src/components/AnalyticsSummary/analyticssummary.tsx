"use client"
import React from 'react';

interface AnalyticsSummaryProps {
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  totalUniqueClicks: number;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  totalSent,
  totalOpens,
  totalClicks,
  totalUniqueClicks
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-2 mt-4">
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Sent</h3>
        <p>{totalSent.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Opens</h3>
        <p>{totalOpens.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Clicks</h3>
        <p>{totalClicks.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Unique Clicks</h3>
        <p>{totalUniqueClicks.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AnalyticsSummary;