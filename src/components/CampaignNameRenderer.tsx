"use client";
import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { useRouter } from "next/navigation";

interface CampaignNameRendererProps extends ICellRendererParams {
  redirectPath?: string; // Optional prop for custom redirect path
  campaignCountry?: string;
}

const CampaignNameRenderer = ({
  data,
  value,
  redirectPath = "/campaignDetail", // Default path
  campaignCountry,
}: CampaignNameRendererProps) => {
  const router = useRouter();

  if (!data?.id || !data?.name) return null;

  // Encode the entire row data as JSON
  const encodedData = encodeURIComponent(JSON.stringify(data));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent full page reload
    const href = `${redirectPath}/${data.id}?country=${campaignCountry}&data=${encodedData}`;
    router.push(href); // ✅ Client-side SPA navigation
  };

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer "
    >
      {value}
    </span>
  );
};

export default CampaignNameRenderer;
