import { createBrowserRouter, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ImportUserPage from "@/pages/ImportUserPage";
import UserTablePage from "@/pages/UserTablePage";
import UserDataPage from "@/pages/UserDataPage";
import CampaignAnalysisPage from "@/pages/CampaignAnalysisPage";
import SegmentDetailsPage from "@/pages/SegmentDetailsPage";
import SegmentDashboardPage from "@/pages/SegmentDashboardPage";
import SheetPage from "@/pages/SheetPage";
import CampaignDetailPage from "@/pages/campaignDetail/CampaignDetailPage";
import CampaignFavotripDetailPage from "@/pages/campaignFavotripDetail/CampaignFavotripDetailPage";
import Layout from "@/layout/Layout";

function withLayout(element: ReactNode) {
  return <Layout>{element}</Layout>;
}

function CampaignDetailRoute() {
  const params = useParams();
  return <CampaignDetailPage params={Promise.resolve({ id: params.id || "" })} />;
}

function CampaignFavotripDetailRoute() {
  const params = useParams();
  return <CampaignFavotripDetailPage params={Promise.resolve({ id: params.id || "" })} />;
}

export const router = createBrowserRouter([
  { path: "/", element: withLayout(<HomePage />) },
  { path: "/login", element: withLayout(<LoginPage />) },
  { path: "/reset-password", element: withLayout(<ResetPasswordPage />) },
  { path: "/importUser", element: withLayout(<ImportUserPage />) },
  { path: "/user-table", element: withLayout(<UserTablePage />) },
  { path: "/userdata", element: withLayout(<UserDataPage />) },
  { path: "/campaignAnalysis", element: withLayout(<CampaignAnalysisPage />) },
  { path: "/segment-details", element: withLayout(<SegmentDetailsPage />) },
  { path: "/SegmentDashBoard", element: withLayout(<SegmentDashboardPage />) },
  { path: "/sheet", element: withLayout(<SheetPage />) },
  { path: "/campaignDetail/:id", element: withLayout(<CampaignDetailRoute />) },
  { path: "/campaignFavotripDetail/:id", element: withLayout(<CampaignFavotripDetailRoute />) },
]);
