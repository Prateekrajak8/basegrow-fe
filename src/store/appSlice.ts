// /Users/prateekrajak/Desktop/Basegrow/basgrow-admin-panel/src/store/appSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  country: string | null;
  esp: string | null;
  domain: string | null;
  view: string;
  timePeriod: string;
  listId: string | number ;
  isAlternativeView: boolean;
  startDate: Date | null;
  endDate: Date | null;
  isLoggedIn: boolean;
  showModal: boolean;
  eventName: string | null;
  smtpId: number | null;
  eventDomain:string | null;
  status: string |null;
  campaignCountry: string;
  campaignDomainCountry: string;
}

const getInitialCampaignDomain = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("campaignDomainCountry") || "travelwhale";
  }
  return "travelwhale";
};


const initialState: AppState = {
  country: "All",
  esp: "Ongage",
  domain: "TravelWhale",
  view: "Aggregate",
  timePeriod: "last_7_days",
  listId: "all",
  isAlternativeView: false,
  startDate: null,
  endDate: null,
  isLoggedIn: false,
  showModal: false, // 
  eventName: "all",
  smtpId: null,
  eventDomain: "All",
  status: "Both",
  campaignCountry:"travelwhale",
 campaignDomainCountry: getInitialCampaignDomain(),
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<string | null>) => {
      state.country = action.payload;
    },
    setEsp: (state, action: PayloadAction<string | null>) => {
      state.esp = action.payload;
    },
    setDomain: (state, action: PayloadAction<string | null>) => {
      state.domain = action.payload;
    },
    setView: (state, action: PayloadAction<string>) => {
      state.view = action.payload.charAt(0).toUpperCase() + action.payload.slice(1);
    },
    setTimePeriod: (state, action: PayloadAction<string>) => {
      state.timePeriod = action.payload;
    },
    setListId: (state, action: PayloadAction<string | number>) => {
      state.listId = action.payload;
    },
    setIsAlternativeView: (state, action: PayloadAction<boolean>) => {
      state.isAlternativeView = action.payload;
    },
    setStartDate: (state, action: PayloadAction<Date | null>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<Date | null>) => {
      state.endDate = action.payload;
    },
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload; // ✅ Add this reducer
    },
    setEventName: (state, action: PayloadAction<string | null>) => {
      state.eventName = action.payload;
    },
    setSmtpId: (state, action) => {
      state.smtpId = action.payload;
    },
    setEventDomain: (state, action: PayloadAction<string | null>) => {
      state.eventDomain = action.payload;
    },
    setStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setCampaignCountry: (state, action: PayloadAction<string>) => {
       state.campaignCountry = action.payload;
       console.log("Redux: Setting campaignCountry to:", action.payload); // Debug log
    },
     setCampaignDomainCountry: (state, action: PayloadAction<string>) => {
      state.campaignDomainCountry = action.payload;
      // Also save in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("campaignDomainCountry", action.payload);
      }
    },
 
  },
});

export const {
  setCountry,
  setEsp,
  setDomain,
  setView,
  setTimePeriod,
  setListId,
  setIsAlternativeView,
  setStartDate,
  setEndDate,
  setIsLoggedIn,
  setShowModal,
  setEventName,
  setEventDomain,
  setStatus,
  setCampaignCountry,
  setCampaignDomainCountry,
} = appSlice.actions;

export default appSlice.reducer;
