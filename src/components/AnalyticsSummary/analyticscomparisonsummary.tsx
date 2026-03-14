"use client"
import React from 'react';

interface AnalyticsSummaryProps {
  totalSent: number;
  totalMailClicks: number;
  totalClicks: number;
  totalSocialClicks: number;
}

const AnalyticsComparisonSummary: React.FC<AnalyticsSummaryProps> = ({
  totalSent,
  totalMailClicks,
  totalClicks,
  totalSocialClicks
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-2 mt-8 px-4">
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Sent</h3>
        <p>{totalSent.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Mail Click</h3>
        <p>{totalMailClicks.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Social Clicks</h3>
        <p>{totalSocialClicks.toLocaleString()}</p>
      </div>
      <div className="p-4 border rounded text-center">
        <h3 className="font-bold">Total Clicks</h3>
        <p>{totalClicks.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AnalyticsComparisonSummary;