// // /Users/prateekrajak/Desktop/Basegrow/basgrow-admin-panel/src/app/page.tsx
// "use client";
// import React, { useEffect, useState } from "react";
// import AnalyticsDashboard from "./components/AnalyticsDashboard/analyticsdashboard";
// import Login from "@/components/Login/Login";
// import SegmentDashboard from "./components/SegmentDashboard/SegmentDash";
// import EventDashBoard from "./components/EventDashboard/EventDashbord";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { Listbox } from "@headlessui/react";
// import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
// import { setIsLoggedIn, setView, setCampaignCountry} from "@/store/appSlice";
// // import { setIsLoggedIn, setView } from "@/store/appSlice";
// import CampaignTable from "./components/CampaignDashboard/CampaignTable";
// import CampaignFavotripTable from "./components/CampaignDashboard/CampaignFavotrip";
// import Dashboard from "@/components/Dashboard";
// import { useRouter } from "next/navigation"; // Import useRouter
// export default function Home() {
//   const dispatch = useAppDispatch();
//   const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn);
//   const view = useAppSelector((state) => state.app.view);
//   const country = useAppSelector((state) => state.app.country);
//   const esp = useAppSelector((state) => state.app.esp);
//   const domain = useAppSelector((state) => state.app.domain);
//   // const campaignCountry = useAppSelector((state)=>state.app.campaignCountry)
//   const [campaignCountry, setCampaignCountry] = useState("travelwhale")
//   const router = useRouter();
//   const [loading, setLoading] = useState(true); // Add loading state
//   const [searchTerm, setSearchTerm] = useState("");
//   const campaignCountries = [
//     { value: "travelwhale", label: "Travelwhale NL" ,id:1},
//     { value: "favotrip", label: "Favotrip NL" ,id:2},
//     // Add more countries as needed
//   ];
//   const filteredOptions = campaignCountries.filter((option) =>
//     option.label.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("token");
//       dispatch(setIsLoggedIn(!!token));
//       const storedView = localStorage.getItem("sidebarView") || "Statistics";
//       dispatch(setView(storedView));
//       //  const storedCampaignCountry = localStorage.getItem("campaignCountry") || "travelwhale";
//       //   dispatch(setCampaignCountry(storedCampaignCountry));
//       dispatch(setView(storedView));
//       setLoading(false);
//     }
//   }, [dispatch]);
//   useEffect(() => {
//     const handleStorageChange = () => {
//       const token = localStorage.getItem("token");
//       dispatch(setIsLoggedIn(!!token));
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);
//   useEffect(() => {
//     if (!loading && !isLoggedIn) {
//       router.push("/login"); // Redirects to the login page
//     }
//   }, [loading, isLoggedIn, router]);
//   if (isLoggedIn === null) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }
 
  
//   return (
//     <div className="container mx-auto ">
//       {isLoggedIn ? 
//        <Dashboard/> : (
//         <Login />
//       )}
//       {/* {view === "Statistics" ? (
//         <AnalyticsDashboard type={view} countries={country} esps={esp} domains={domain} />
//       ) : (
//         <EventDashBoard type={view} countries={country} esps={esp} domains={domain} />
//       )} */}
//       {/* <div className="text-center text-xl text-black font-bold">
//         <h2>Campaign Dashboard</h2>
//       </div> */}
    
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import Login from "@/components/Login/Login";
import Dashboard from "@/components/Dashboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsLoggedIn, setView } from "@/store/appSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn);

  const [authChecked, setAuthChecked] = useState(false); // 🚀 NEW

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(setIsLoggedIn(!!token));

    const storedView = localStorage.getItem("sidebarView") || "Statistics";
    dispatch(setView(storedView));

    setAuthChecked(true); // authentication check completed
  }, []);

  // ⛔ जब तक token check नहीं हुआ, कुछ मत दिखाओ
  if (!authChecked) {
    return null;
  }

  return (
    <div className="container mx-auto">
      {isLoggedIn && <Dashboard /> }
    </div>
  );
}
