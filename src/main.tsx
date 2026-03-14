import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/app/router";
import { ReduxProvider } from "@/app/providers";
import "@/styles/legacy-globals.css";
import { setupMocksIfEnabled } from "@/mocks";

setupMocksIfEnabled();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ReduxProvider>
  </React.StrictMode>
);
