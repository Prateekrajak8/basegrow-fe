// // // /Users/prateekrajak/Desktop/Basegrow/basgrow-admin-panel/src/app/Layout/Layout.tsx
// // "use client";
// // import React, { useState, useEffect } from "react";
// // import Navbar from "@/components/TopNavBar/Navbar";
// // import Sidebar from "@/components/Sidebar/Sidebar";
// // import { usePathname } from "next/navigation";
// // import { useRouter } from "next/navigation";
// // import { Provider } from "react-redux";
// // import { store } from "@/store/store";
// // import { setIsLoggedIn, setView } from "@/store/appSlice";
// // import { useAppDispatch, useAppSelector } from "@/store/hooks";
// // // import { useAppDispatch } from "@/store/hooks";
// // export default function Layout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const dispatch = useAppDispatch();
// //   const pathname = usePathname();
// //   const showModal = useAppSelector((state) => state.app.showModal);
// //   const isLoggedIn = useAppSelector((state) => state.app.isLoggedIn);
// //   const hideSidebarAndHeader = [ "/login","/reset-password"];
// //   const shouldHideLayout = hideSidebarAndHeader.includes(pathname);
  
// //   useEffect(() => {
// //     if (typeof window !== "undefined") {
// //       const token = localStorage.getItem("token");
// //       dispatch(setIsLoggedIn(!!token));
// //       const storedView = localStorage.getItem("sidebarView") || "Statistics";
// //       dispatch(setView(storedView));
// //     }
// //   }, [dispatch]);
// //   return (
    
// //     <Provider store={store}>
// //     {/* {shouldHideLayout ? (
// //       <div className="h-screen flex items-center justify-center w-full">{children}</div>
// //     ) : (
// //       <div className="flex flex-row h-screen">
       

     
// //         <div className="w-full flex flex-col h-screen">
// //          <Sidebar />
    
// //           <div className="relative flex-1">
   
// //       {showModal && (
// //         <div className="absolute inset-0 bg-opacity-20 z-10"></div>
// //       )}

    
// //       <div className={`relative z-0`}>
// //         {children}
// //       </div>
// //     </div>
// //         </div>
// //       </div>
// //     )} */}
// //      <div className={`relative z-0`}>
// //         {children}
// //       </div>
// //   </Provider>
// //   );
// // };

"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsLoggedIn, setView } from "@/store/appSlice";

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const authFreeRoutes = ["/login", "/reset-password"];

  const [loading, setLoading] = useState(true); // avoid flicker

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
      // logged in
      dispatch(setIsLoggedIn(true));
    } else {
      dispatch(setIsLoggedIn(false));

      // NOT logged in → redirect to login
      if (!authFreeRoutes.includes(pathname)) {
        router.replace("/login");
      }
    }

    // Sidebar view state
    const storedView = localStorage.getItem("sidebarView") || "Statistics";
    dispatch(setView(storedView));

    setLoading(false);
  }, [pathname]);

  // Avoid showing dashboard while checking token
  if (loading) return null;

  return <>{children}</>;
}
