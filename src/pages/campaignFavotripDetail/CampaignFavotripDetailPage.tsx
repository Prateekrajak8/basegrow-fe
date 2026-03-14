// "use client"
// import React, { use, useState, useEffect } from "react";
// import { AgGridReact } from "ag-grid-react";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import localforage from "localforage";
// import { MdOutlineArrowBackIos, MdAnalytics, MdBarChart, MdAssessment } from "react-icons/md";
// import axios from "axios";
// import {
//     ColDef,
//     CustomFilterModule,
//     DateFilterModule,
//     ModuleRegistry,
//     NumberFilterModule,
//     PaginationModule,
//     TextFilterModule,
//     ValidationModule,
//     TooltipModule,
//     ClientSideRowModelModule,
//     CellStyleModule,
//     ICellRendererParams,
// } from "ag-grid-community";

// ModuleRegistry.registerModules([
//     ClientSideRowModelModule,
//     ValidationModule,
//     PaginationModule,
//     TextFilterModule,
//     NumberFilterModule,
//     DateFilterModule,
//     TooltipModule,
//     TextFilterModule,
//     CustomFilterModule,
//     CellStyleModule,
// ]);

// interface EmailRecord {
//     id: number;
//     campaignId: number;
//     email: string;
//     sent: boolean;
//     hardBounce: boolean;
//     softBounce: boolean;
//     uniqueOpen: boolean;
//     totalClicks: number;
//     uniqueClicker: boolean;
//     createdAt: string;
// }

// interface DomainAnalysis {
//     domain: string;
//     cluster: string;
//     totalEmails: number;
//     sent: number;
//     hardBounces: number;
//     softBounces: number;
//     bounces: number;
//     uniqueOpens: number;
//     uniqueClickers: number;
//     totalClicks: number;
//     hardBounceRate: string;
//     softBounceRate: string;
//     totalClickRate: string;
//     uniqueOpenRate: string;
//     uniqueClickRate: string;
//     performanceScore: number;
// }

// interface SummaryTotals {
//     totalSent: number;
//     totalHardBounces: number;
//     totalSoftBounces: number;
//     totalUniqueOpens: number;
//     totalUniqueClickers: number;
//     totalClicks: number;
//     avgHardBounceRate: string;
//     avgSoftBounceRate: string;
//     avgUniqueOpenRate: string;
//     avgUniqueClickRate: string;
//     avgTotalClickRate: string;
// }

// // Country-specific domain cluster mappings
// const COUNTRY_DOMAIN_CLUSTERS: { [country: string]: { [domain: string]: string } } = {
//     NL: {
//         // Dutch-specific domains
//         "hotmail.nl": "Microsoft",
//         "live.nl": "Microsoft",
//         "outlook.nl": "Microsoft",
//         "msn.nl": "Microsoft",
//         "hotmail.com": "Microsoft",
//         "live.com": "Microsoft",
//         "outlook.com": "Microsoft",
//         "msn.com": "Microsoft",
//         "windowslive.com": "Microsoft",

//         "telenet.be": "Telenet",
//         "pandora.be": "Telenet",

//         "gmail.com": "Gmail",
//         "googlemail.com": "Gmail",

//         "kpnmail.nl": "KPN",
//         "planet.nl": "KPN",
//         "hetnet.nl": "KPN",
//         "freeler.nl": "KPN",
//         "xs4all.nl": "KPN",
//         "surfmail.nl": "KPN",
//         "kpnplanet.nl": "KPN",
//         "telfort.nl": "KPN",
//         "tiscali.nl": "KPN",
//         "12move.nl": "KPN",

//         "ziggo.nl": "Ziggo/UPC",
//         "casema.nl": "Ziggo/UPC",
//         "chello.nl": "Ziggo/UPC",
//         "home.nl": "Ziggo/UPC",
//         "quicknet.nl": "Ziggo/UPC",
//         "upcmail.nl": "Ziggo/UPC",

//         "yahoo.nl": "Yahoo",
//         "yahoo.com": "Yahoo",
//         "ymail.com": "Yahoo",

//         "icloud.com": "Apple",
//         "me.com": "Apple",
//         "mac.com": "Apple",

//         "zeelandnet.nl": "ZeelandNet",
//         "caiway.nl": "Caiway",
//         "kabelfoon.nl": "Caiway",
//         "online.nl": "Online.nl",
//         "solcon.nl": "Solcon",
//         "wxs.nl": "WXS",
//         "hccnet.nl": "HCCnet",
//         "onsbrabantnet.nl": "OnsBrabantNet",
//         "versatel.nl": "Versatel",
//         "mail.com": "Mail.com",
//     },
//     FNL: {
//         // Dutch-specific domains
//         "hotmail.nl": "Microsoft",
//         "live.nl": "Microsoft",
//         "outlook.nl": "Microsoft",
//         "msn.nl": "Microsoft",
//         "hotmail.com": "Microsoft",
//         "live.com": "Microsoft",
//         "outlook.com": "Microsoft",
//         "msn.com": "Microsoft",
//         "windowslive.com": "Microsoft",

//         "telenet.be": "Telenet",
//         "pandora.be": "Telenet",
//         "gmail.com": "Gmail",
//         "googlemail.com": "Gmail",

//         "kpnmail.nl": "KPN",
//         "planet.nl": "KPN",
//         "hetnet.nl": "KPN",
//         "freeler.nl": "KPN",
//         "xs4all.nl": "KPN",
//         "surfmail.nl": "KPN",
//         "kpnplanet.nl": "KPN",
//         "telfort.nl": "KPN",
//         "tiscali.nl": "KPN",
//         "12move.nl": "KPN",

//         "ziggo.nl": "Ziggo/UPC",
//         "casema.nl": "Ziggo/UPC",
//         "chello.nl": "Ziggo/UPC",
//         "home.nl": "Ziggo/UPC",
//         "quicknet.nl": "Ziggo/UPC",
//         "upcmail.nl": "Ziggo/UPC",

//         "yahoo.nl": "Yahoo",
//         "yahoo.com": "Yahoo",
//         "ymail.com": "Yahoo",

//         "icloud.com": "Apple",
//         "me.com": "Apple",
//         "mac.com": "Apple",

//         "zeelandnet.nl": "ZeelandNet",
//         "caiway.nl": "Caiway",
//         "kabelfoon.nl": "Caiway",
//         "online.nl": "Online.nl",
//         "solcon.nl": "Solcon",
//         "wxs.nl": "WXS",
//         "hccnet.nl": "HCCnet",
//         "onsbrabantnet.nl": "OnsBrabantNet",
//         "versatel.nl": "Versatel",
//         "mail.com": "Mail.com",
//     },

//     DK: {
//         // Belgian-specific domains
//         "hotmail.com.uk": "Microsoft",
//         "hotmail.com": "Microsoft",
//         "hotmail.de": "Microsoft",
//         "hotmail.dk": "Microsoft",
//         "hotmail.fr": "Microsoft",
//         "live.co.uk": "Microsoft",
//         "live.com": "Microsoft",
//         "live.dk": "Microsoft",
//         "live.fr": "Microsoft",
//         "msn.com": "Microsoft",
//         "outlook.com": "Microsoft",
//         "outlook.dk": "Microsoft",

//         "gmail.com": "Google",

//         "yahoo.co.uk": "Yahoo",
//         "yahoo.com": "Yahoo",
//         "yahoo.de": "Yahoo",
//         "yahoo.dk": "Yahoo",
//         "yahoo.fr": "Yahoo",
//         "yahoo.no": "Yahoo",
//         "ymail.com": "Yahoo",

//         "icloud.com": "Apple",
//         "me.com": "Apple",
//         "mac.com": "Apple",
//         "aol.com": "AOL",

//         "mail.ru": "Mail.ru",
//         "gmx.de": "GMX",
//         "gmx.net": "GMX",
//         "web.de": "Web.de",
//         "btinternet.com": "BT Group",
//         "bluewin.ch": "Swisscom",
//     },

//     FR: {
//         // French-specific domains
//         "hotmail.com": "Microsoft",
//         "hotmail.fr": "Microsoft",
//         "live.fr": "Microsoft",
//         "msn.com": "Microsoft",
//         "outlook.com": "Microsoft",
//         "outlook.fr": "Microsoft",

//         "gmail.com": "Google",

//         "yahoo.com": "Yahoo",
//         "yahoo.de": "Yahoo",
//         "yahoo.fr": "Yahoo",
//         "ymail.com": "Yahoo",

//         "icloud.com": "Apple",
//         "mac.com": "Apple",
//         "me.com": "Apple",

//         "aol.com": "AOL",
//         "aol.fr": "AOL",
//         "bluewin.ch": "Swisscom",
//         "mail.ru": "Mail.ru",
//         "gmx.de": "GMX",
//         "gmx.net": "GMX",

//         "web.de": "Web.de",
//     },

//     DE: {
//         // German-specific domains
//         "hotmail.com": "Microsoft",
//         "hotmail.de": "Microsoft",
//         "live.com": "Microsoft",
//         "live.de": "Microsoft",
//         "msn.com": "Microsoft",
//         "outlook.com": "Microsoft",
//         "outlook.de": "Microsoft",

//         "gmail.com": "Google",
//         "googlemail.com": "Google",

//         "icloud.com": "Apple",
//         "mac.com": "Apple",
//         "me.com": "Apple",

//         "t-online.de": "Telekom",
//         "yahoo.com": "Yahoo",
//         "yahoo.de": "Yahoo",
//         "yahoo.fr": "Yahoo",
//         "ymail.com": "Yahoo",

//         "arcor.de": "Vodafone",
//         "vodafone.de": "Vodafone",

//         "aol.com": "AOL",
//         "aol.de": "AOL",

//         "gmx.at": "GMX",
//         "gmx.de": "GMX",
//         "gmx.net": "GMX",

//         "web.de": "Web.de",
//         "email.de": "Web.de",

//         "mail.de": "Mail.de",
//         "netcologne.de": "NetCologne",
//         "bluewin.ch": "Swisscom",
//         "onlinehome.de": "1&1 Ionos",
//         "mail.ru": "Mail.ru",
//     },

//     UK: {
//         // UK-specific domains
//         "hotmail.com": "Hotmail",
//         "hotmail.co.uk": "Hotmail",
//         "msn.com": "Hotmail",
//         "live.com": "Hotmail",
//         "outlook.com": "Hotmail",


//         "gmail.com": "Google",
//         "googlemail.com": "Google",

//         "btinternet.com": "BT Group",
//         "btopenworld.com": "BT Group",
//         "talk21.com": "BT Group",
//         "icloud.com": "Apple",
//         "me.com": "Apple",
//         "mac.com": "Apple",

//         "sky.com": "Sky",
//         "blueyonder.co.uk": "Virgin Media",
//         "virginmedia.com": "Virgin Media",
//         "ntlworld.com": "Virgin Media",

//         "yahoo.co.uk": "Yahoo",

//         "mail.ru": "Mail.ru",
//         "aol.com": "AOL",
//     }
// };

// // Country-specific cluster priority orders
// const COUNTRY_CLUSTER_PRIORITIES: { [country: string]: string[] } = {
//     NL: [
//         "Microsoft", "Gmail", "KPN", "Telenet", "Ziggo/UPC", "Yahoo", "Apple",
//         "ZeelandNet", "Caiway", "Online.nl", "Solcon", "WXS",
//         "HCCnet", "OnsBrabantNet", "Versatel", "Mail.com", "Others"
//     ],
//     FNL: [
//         "Microsoft", "Gmail", "KPN", "Telenet", "Ziggo/UPC", "Yahoo", "Apple",
//         "ZeelandNet", "Caiway", "Online.nl", "Solcon", "WXS",
//         "HCCnet", "OnsBrabantNet", "Versatel", "Mail.com", "Others"
//     ],

//     DK: [
//         "Microsoft", "Google", "Yahoo", "Apple", "AOL", "Mail.ru", "GMX", "Web.de",
//         "BT Group", "Swisscom", "Others"
//     ],

//     FR: [
//         "Microsoft", "Google", "Yahoo", "Apple", "AOL", "Swisscom", "Mail.ru", "GMX",
//         "Web.de", "Others"
//     ],

//     DE: [
//         "Microsoft", "Google", "Apple", "Telekom", "Yahoo", "Vodafone", "AOL", "GMX", "Web.de",
//         "Mail.de", "NetCologne", "Swisscom", "1&1 Ionos", "Mail.ru", "Others"
//     ],

//     UK: [
//         "Hotmail", "Google", "BT Group", "Apple", "Sky", "Virgin Media", "Yahoo",
//         "Mail.ru", "AOL", "Others"
//     ]
// };

// // Country-specific domain ordering for detailed view
// const COUNTRY_DOMAIN_ORDERS: { [country: string]: string[] } = {
//     NL: [
//         // Microsoft cluster
//         "hotmail.nl", "live.nl", "outlook.nl", "msn.nl", "hotmail.com",
//         "live.com", "outlook.com", "msn.com", "windowslive.com",
//         "telenet.be", "pandora.be",
//         // Gmail
//         "gmail.com", "googlemail.com",
//         // KPN cluster
//         "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl",
//         "surfmail.nl", "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",
//         // Ziggo cluster
//         "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
//         // Other domains
//         "yahoo.nl", "yahoo.com", "ymail.com", "icloud.com", "me.com", "mac.com",
//         "zeelandnet.nl", "caiway.nl", "kabelfoon.nl", "online.nl", "solcon.nl",
//         "wxs.nl", "hccnet.nl", "onsbrabantnet.nl", "versatel.nl", "mail.com"
//     ],
//     FNL: [
//         // Microsoft cluster
//         "hotmail.nl", "live.nl", "outlook.nl", "msn.nl", "hotmail.com",
//         "live.com", "outlook.com", "msn.com", "windowslive.com",
//         "telenet.be", "pandora.be",
//         // Gmail
//         "gmail.com", "googlemail.com",
//         // KPN cluster
//         "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl",
//         "surfmail.nl", "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",
//         // Ziggo cluster
//         "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
//         // Other domains
//         "yahoo.nl", "yahoo.com", "ymail.com", "icloud.com", "me.com", "mac.com",
//         "zeelandnet.nl", "caiway.nl", "kabelfoon.nl", "online.nl", "solcon.nl",
//         "wxs.nl", "hccnet.nl", "onsbrabantnet.nl", "versatel.nl", "mail.com"
//     ],

//     DK: [
//         "hotmail.co.uk", "hotmail.com", "hotmail.de", "hotmail.dk", "hotmail.fr", "live.co.uk", "live.dk", "live.fr", "outlook.be", "live.com",
//         "outlook.com", "outlook.dk", "msn.com", "gmail.com", "yahoo.co.uk",
//         "yahoo.com", "yahoo.de", "yahoo.dk", "yahoo.fr", "yahoo.no", "ymail.com", "icloud.com", "mac.com", "me.com",
//         "aol.com", "mail.ru", "gmx.de", "gmx.net", "web.de", "btinternet.com", "bluewin.ch",
//     ],

//     FR: [
//         "hotmail.fr", "live.fr", "outlook.fr", "hotmail.com",
//         "outlook.com", "msn.com", "gmail.com",
//         "yahoo.fr", "yahoo.com", "ymail.com", "yahoo.de", "icloud.com",
//         "me.com", "mac.com", "aol.com", "aol.fr", "bluewin.ch", "mail.ru", "gmx.de", "gmx.net", "web.de"
//     ],

//     DE: [
//         "hotmail.com", "hotmail.de", "live.com", "live.de", "msn.com", "outlook.com", "outlook.de",
//         "gmail.com", "googlemail.com", "icloud.com", "mac.com", "me.com", "t-online.de", "yahoo.com",
//         "yahoo.de", "yahoo.fr", "ymail.com", "arcor.de", "vodafone.de", "aol.com", "aol.de",
//         "gmx.at", "gmx.de", "gmx.net", "email.de", "web.de", "mail.de", "netcologne.de", "bluewin.ch",
//         "onlinehome.de", "mail.ru"
//     ],

//     UK: [
//         "hotmail.co.uk", "hotmail.com", "msn.com",
//         "live.com", "outlook.com", "gmail.com", "googlemail.com",
//         "btinternet.com", "btopenworld.com", "talk21.com", "icloud.com", "me.com", "mac.com", "sky.com", "blueyonder.co.uk",
//         "ntlworld.com",
//         "virginmedia.com", "yahoo.co.uk", "mail.ru",
//         "aol.com"
//     ]
// };
// const formatIndianNumber = (num: number): string => {
//     if (isNaN(num)) return "0";
//     return num
//         .toLocaleString("en-IN") // Indian numbering system (12,500 / 1,30,800 / 10,00,000)
//         .replace(/,/g, ".");     // replace commas with dots
// };
// const CampaignDetail = ({ params }: { params: Promise<{ id: string }> }) => {
//     const { id } = use(params);
//     const id1= Number(id);
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const dataParam = searchParams.get("data");
//     const countryParam = searchParams.get("country");

//     let campaignData = null;
//     let detectedCountry = 'NL'; // default
//     const [rawData, setRawData] = useState<any>(null);
//     const [clusterAnalysis, setClusterAnalysis] = useState<DomainAnalysis[]>([]);
//     const [performanceBasedData, setPerformanceBasedData] = useState<DomainAnalysis[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showClusterView, setShowClusterView] = useState(true);
//     const [clusterSummary, setClusterSummary] = useState<SummaryTotals | null>(null);
//     const [domainSummary, setDomainSummary] = useState<SummaryTotals | null>(null);
//     const CACHE_KEY = `campaignData_${id}`;
//     const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.post('http://localhost:3000/api/mailcamp/domain-data-by-campaign', {
//               "campaignId": id1 });
//                console.log(response.data); // raw data store karo
//             } catch (err: any) {
//                 // setError(err.message || 'Unknown error');
//             } finally {
//                 // setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id]);
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.post('http://localhost:3000/api/mailcamp/cluster-data-by-campaign', {
//               "campaignId": id1  });
//                console.log(response.data); // raw data store karo
//             } catch (err: any) {
//                 // setError(err.message || 'Unknown error');
//             } finally {
//                 // setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id]);
//     // useEffect(() => {
//     //     const fetchCampaignData = async () => {
//     //         try {
//     //             setLoading(true);

//     //             const cached = await localforage.getItem(CACHE_KEY);
//     //             if (cached) {
//     //                 const parsed: any = cached;
//     //                 const now = Date.now();
//     //                 if (now - parsed.time < CACHE_DURATION) {
//     //                     setRawData(parsed.data);
//     //                     setLoading(false);
//     //                     return;
//     //                 } else {
//     //                     await localforage.removeItem(CACHE_KEY);
//     //                 }
//     //             }

//     //             const response = await axios.post("/api/mailcamp/fetch-user-data-id", { id });
//     //             const data = response.data;

//     //             setRawData(data);
//     //             await localforage.setItem(CACHE_KEY, { data, time: Date.now() });
//     //         } catch (err: any) {
//     //             setError(err.message || "Failed to fetch campaign data");
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };

//     //     fetchCampaignData();
//     // }, [id]);
//     useEffect(() => {
//         const fetchCampaignData = async () => {
//             try {
//                 setLoading(true);

//                 // ✅ Extract date (e.g. "20251102" from params)
//                 const dataParam = searchParams.get("data");
//                 let campaignDateStr = null;

//                 if (dataParam) {
//                     try {
//                         const parsed = JSON.parse(decodeURIComponent(dataParam));
//                         if (parsed.name) {
//                             // "20251102 - Newsletter TW"
//                             const match = parsed.name.match(/^(\d{8})/);
//                             if (match) {
//                                 campaignDateStr = match[1]; // "20251102"
//                             }
//                         }
//                     } catch (err) {
//                         console.error("Failed to parse campaign date:", err);
//                     }
//                 }

//                 // ✅ Determine cache duration based on campaign date
//                 let CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // default 3h
//                 if (campaignDateStr) {
//                     const year = parseInt(campaignDateStr.substring(0, 4));
//                     const month = parseInt(campaignDateStr.substring(4, 6)) - 1;
//                     const day = parseInt(campaignDateStr.substring(6, 8));
//                     const campaignDate = new Date(year, month, day);
//                     const today = new Date();

//                     // Remove time for accurate day diff
//                     today.setHours(0, 0, 0, 0);
//                     campaignDate.setHours(0, 0, 0, 0);

//                     const diffDays =
//                         (today.getTime() - campaignDate.getTime()) / (1000 * 60 * 60 * 24);

//                     if (diffDays <= 0) {
//                         CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // today → 3 hours
//                     } else if (diffDays > 0 && diffDays <= 4) {
//                         CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // last 4 days → 24 hours
//                     } else {
//                         CACHE_DURATION_MS = 10 * 24 * 60 * 60 * 1000; // older → 10 days
//                     }
//                 }

//                 // ✅ Use localforage cache
//                 const cached = await localforage.getItem(CACHE_KEY);
//                 if (cached) {
//                     const parsed: any = cached;
//                     const now = Date.now();
//                     if (now - parsed.time < CACHE_DURATION_MS) {
//                         setRawData(parsed.data);
//                         setLoading(false);
//                         console.log("🟢 Using cached data");
//                         return;
//                     } else {
//                         await localforage.removeItem(CACHE_KEY);
//                     }
//                 }

//                 // 🔄 Fetch fresh data and store it
//                 console.log("🔄 Fetching fresh data...");
//                 const response = await axios.post("/api/mailcamp/fetch-user-data-id", { id });
//                 const data = response.data;

//                 setRawData(data);
//                 await localforage.setItem(CACHE_KEY, {
//                     data,
//                     time: Date.now(),
//                     expiry: CACHE_DURATION_MS,
//                 });
//             } catch (err: any) {
//                 setError(err.message || "Failed to fetch campaign data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCampaignData();
//     }, [id]);

//     // 2️⃣ Data processing after API returns
//     // useEffect(() => {
//     //     if (!rawData) return;

//     //     // Cluster aur domain calculations asynchronously
//     //     const processData = async () => {
//     //         const clusterStats = analyzeClusterData(rawData, detectedCountry);
//     //         const domainStats = analyzeDomainData(rawData, detectedCountry);

//     //         setClusterAnalysis(clusterStats);
//     //         setPerformanceBasedData(domainStats);
//     //         setClusterSummary(calculateSummaryTotals(clusterStats));
//     //         setDomainSummary(calculateSummaryTotals(domainStats));
//     //     };

//     //     processData();
//     // }, [rawData, detectedCountry]);
//     useEffect(() => {
//         if (!rawData) return;

//         const clusterStats = analyzeClusterData(rawData, detectedCountry);
//         const domainStats = analyzeDomainData(rawData, detectedCountry);

//         setClusterAnalysis(clusterStats);
//         setClusterSummary(calculateSummaryTotals(clusterStats));

//         // ✅ Pre-cache domain data too
//         setPerformanceBasedData(domainStats);
//         setDomainSummary(calculateSummaryTotals(domainStats));
//     }, [rawData, detectedCountry]);

//     // 🔄 Now switch instantly (no recalculation)
//     const loadDomainData = () => {
//         setShowClusterView(false);
//     };

//     // const loadDomainData = () => {
//     //     if (performanceBasedData.length > 0) {
//     //         // Already loaded once
//     //         setShowClusterView(false);
//     //         return;
//     //     }

//     //     setLoading(true);

//     //     // Use timeout so UI doesn't freeze during heavy processing
//     //     setTimeout(() => {
//     //         const domainStats = analyzeDomainData(rawData, detectedCountry);
//     //         setPerformanceBasedData(domainStats);
//     //         setDomainSummary(calculateSummaryTotals(domainStats));
//     //         setShowClusterView(false);
//     //         setLoading(false);
//     //     }, 100);
//     // };
//     // Helper function to validate country parameter
//     const validateCountry = (country: string | null): string => {
//         const supportedCountries = ['NL', 'FNL', 'DK', 'FR', 'DE', 'UK'];

//         if (!country) {
//             console.warn(`No country provided, falling back to NL`);
//             return 'NL';
//         }

//         // Handle "Travelwhale XX" format
//         if (country.startsWith('Travelwhale ')) {
//             const extractedCode = country.replace('Travelwhale ', '');
//             if (supportedCountries.includes(extractedCode)) {
//                 return extractedCode;
//             }
//         }
//         if (country.startsWith('Favotrip ')) {
//             const extractedCode = 'F' + country.replace('Favotrip ', ''); // Add 'F' prefix
//             if (supportedCountries.includes(extractedCode)) {
//                 return extractedCode;
//             }
//         }
//         // Handle direct country code format
//         if (supportedCountries.includes(country)) {
//             return country;
//         }

//         console.warn(`Unsupported country: ${country}, falling back to NL`);
//         return 'NL';
//     };

//     // Helper function to extract country from campaign data
//     const extractCountryFromData = (campaignData: any): string => {
//         if (campaignData?.account?.name) {
//             const accountName = campaignData.account.name;
//             // Extract country code from account name like "Travelwhale DE"
//             if (accountName.startsWith('Travelwhale ')) {
//                 const countryCode = accountName.replace('Travelwhale ', '');
//                 const supportedCountries = ['NL', 'DK', 'FR', 'DE', 'UK'];
//                 if (supportedCountries.includes(countryCode)) {
//                     return countryCode;
//                 }
//             }
//             if (accountName.startsWith('Favotrip ')) {
//                 const countryCode = 'F' + accountName.replace('Favotrip ', ''); // Add 'F' prefix
//                 const supportedCountries = ['FNL', 'FDK', 'FFR', 'FDE', 'FUK'];
//                 if (supportedCountries.includes(countryCode)) {
//                     return countryCode;
//                 }
//             }
//         }
//         return 'NL'; // fallback
//     };

//     // Parse data and detect country
//     if (dataParam) {
//         try {
//             const decodedData = decodeURIComponent(dataParam);
//             campaignData = JSON.parse(decodedData);
//             console.log("Parsed campaign data:", campaignData);

//             // Extract country from campaign data as primary source
//             detectedCountry = extractCountryFromData(campaignData);

//             // If country param is provided, validate and use it as override
//             if (countryParam) {
//                 const validatedFromParam = validateCountry(countryParam);
//                 if (validatedFromParam !== 'NL' || countryParam.includes('NL')) {
//                     detectedCountry = validatedFromParam;
//                 }
//             }

//         } catch (error) {
//             console.error("Error parsing campaign data:", error);
//         }
//     } else if (countryParam) {
//         // Fallback to URL param if no data param
//         detectedCountry = validateCountry(countryParam);
//     }

//     console.log("Detected country:", detectedCountry);

//     const name = campaignData?.name || null;
//     const sent = campaignData?.sent || 0;
//     const hardBounce = campaignData?.hardBounce || 0;
//     const softBounce = campaignData?.softBounce || 0;
//     const uniqueOpeners = campaignData?.uniqueOpeners || 0;
//     const totalClicks = campaignData?.totalClicks || 0;
//     const uniqueClickers = campaignData?.uniqueClickers || 0;
//     const unsubscribes = campaignData?.unsubscribes || 0;
//     const complaints = campaignData?.complaints || 0;
//     const createdAt = campaignData?.createdAt || null;
//     const statId = campaignData?.statId || null;

//     const allSearchParams = Object.fromEntries(searchParams.entries());
//     console.log(allSearchParams, "all search params")

//     const campaignSummaryRow = campaignData
//         ? [{
//             campaignName: campaignData.name,
//             sent: campaignData.sent,
//             hardBounce: campaignData.hardBounce,
//             softBounce: campaignData.softBounce,
//             uniqueOpeners: campaignData.uniqueOpeners,
//             totalClicks: campaignData.totalClicks,
//             uniqueClickers: campaignData.uniqueClickers,
//             unsubscribes: campaignData.unsubscribes,
//             complaints: campaignData.complaints,
//             createdAt: campaignData.createdAt,
//             uniqueOpenRate: ((campaignData.uniqueOpeners / campaignData.sent) * 100).toFixed(2) + "%",
//             uniqueClickRate: ((campaignData.uniqueClickers / campaignData.sent) * 100).toFixed(2) + "%",
//             totalClickRate: ((campaignData.totalClicks / campaignData.sent) * 100).toFixed(2) + "%",
//         }]
//         : [];

//     const summaryColumnDefs: ColDef[] = [
//         {
//             headerName: "Sent", field: "sent", width: 100, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Hard Bounces", field: "hardBounce", width: 120, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Soft Bounces", field: "softBounce", width: 120, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Opens", field: "uniqueOpeners", width: 130, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         { headerName: "% Unique Opens", field: "uniqueOpenRate", width: 120, },
//         {
//             headerName: "Total Clicks", field: "totalClicks", width: 120, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Clickers", field: "uniqueClickers", width: 135, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         { headerName: "% Total Clicks", field: "totalClickRate", width: 130, },
//         { headerName: "% Unique Clickers", field: "uniqueClickRate", width: 130, },
//         {
//             headerName: "Unsubscribes", field: "unsubscribes", width: 135, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Complaints", field: "complaints", width: 120, cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//     ];

//     // Helper functions
//     const extractDomain = (email: string): string => {
//         return email.split('@')[1] || '';
//     };

//     const getCountryDisplayName = (countryCode: string): string => {
//         console.log(countryCode, "country code in details")
//         const countryNames: { [key: string]: string } = {
//             'NL': 'Travelwhale NL',
//             'FNL': 'Favotrip NL',
//             'DE': 'Travelwhale DE',
//             'DK': 'Travelwhale DK',
//             'FR': 'Travelwhale FR',
//             'UK': 'Travelwhale UK'
//         };
//         return countryNames[countryCode] || countryCode;
//     };

//     const getClusterName = (domain: string, country: string): string => {
//         const countryMapping = COUNTRY_DOMAIN_CLUSTERS[country];
//         if (!countryMapping) {
//             return 'Others';
//         }
//         return countryMapping[domain.toLowerCase()] || 'Others';
//     };

//     const getClusterPriority = (cluster: string, country: string): number => {
//         const countryPriorities = COUNTRY_CLUSTER_PRIORITIES[country];
//         if (!countryPriorities) {
//             return 999;
//         }
//         const index = countryPriorities.indexOf(cluster);
//         return index !== -1 ? index : countryPriorities.length;
//     };

//     const getDomainPriority = (domain: string, country: string): number => {
//         const countryOrder = COUNTRY_DOMAIN_ORDERS[country];
//         if (!countryOrder) {
//             return 999;
//         }
//         const index = countryOrder.indexOf(domain.toLowerCase());
//         return index !== -1 ? index : countryOrder.length;
//     };

//     const calculatePercentage = (numerator: number, denominator: number): string => {
//         if (denominator === 0) return "0.00%";
//         return ((numerator / denominator) * 100).toFixed(2) + "%";
//     };

//     const calculatePerformanceScore = (stats: any): number => {
//         return stats.uniqueOpens;
//     };

//     const calculateSummaryTotals = (data: DomainAnalysis[]): SummaryTotals => {
//         const totals = data.reduce((acc, item) => {
//             acc.totalSent += item.sent;
//             acc.totalHardBounces += item.hardBounces;
//             acc.totalSoftBounces += item.softBounces;
//             acc.totalUniqueOpens += item.uniqueOpens;
//             acc.totalUniqueClickers += item.uniqueClickers;
//             acc.totalClicks += item.totalClicks;
//             return acc;
//         }, {
//             totalSent: 0,
//             totalHardBounces: 0,
//             totalSoftBounces: 0,
//             totalUniqueOpens: 0,
//             totalUniqueClickers: 0,
//             totalClicks: 0
//         });

//         return {
//             ...totals,
//             avgHardBounceRate: calculatePercentage(totals.totalHardBounces, totals.totalSent),
//             avgSoftBounceRate: calculatePercentage(totals.totalSoftBounces, totals.totalSent),
//             avgUniqueOpenRate: calculatePercentage(totals.totalUniqueOpens, totals.totalSent),
//             avgUniqueClickRate: calculatePercentage(totals.totalUniqueClickers, totals.totalSent),
//             avgTotalClickRate: calculatePercentage(totals.totalClicks, totals.totalSent)
//         };
//     };

//     const analyzeClusterData = (records: EmailRecord[], country: string): DomainAnalysis[] => {
//         if (!records?.length) return [];

//         const clusterMap: Record<string, any> = Object.create(null);

//         for (let i = 0; i < records.length; i++) {
//             const r = records[i];
//             const cluster = getClusterName(extractDomain(r.email), country);

//             const c = clusterMap[cluster] || {
//                 totalEmails: 0,
//                 hardBounces: 0,
//                 softBounces: 0,
//                 uniqueOpens: 0,
//                 uniqueClickers: 0,
//                 totalClicks: 0,
//                 sent: 0,
//             };

//             c.totalEmails++;
//             if (r.hardBounce) c.hardBounces++;
//             if (r.softBounce) c.softBounces++;
//             if (r.uniqueOpen) c.uniqueOpens++;
//             if (r.uniqueClicker) c.uniqueClickers++;
//             if (r.sent) c.sent++;
//             c.totalClicks += r.totalClicks;

//             clusterMap[cluster] = c;
//         }

//         const result = [];
//         for (const cluster in clusterMap) {
//             const stats = clusterMap[cluster];
//             const bounces = stats.hardBounces + stats.softBounces;
//             const performanceScore = calculatePerformanceScore(stats);

//             result.push({
//                 domain: cluster,
//                 cluster,
//                 totalEmails: stats.totalEmails,
//                 sent: stats.sent,
//                 bounces,
//                 hardBounces: stats.hardBounces,
//                 softBounces: stats.softBounces,
//                 uniqueOpens: stats.uniqueOpens,
//                 uniqueClickers: stats.uniqueClickers,
//                 totalClicks: stats.totalClicks,
//                 hardBounceRate: calculatePercentage(stats.hardBounces, stats.sent),
//                 softBounceRate: calculatePercentage(stats.softBounces, stats.sent),
//                 uniqueOpenRate: calculatePercentage(stats.uniqueOpens, stats.sent),
//                 uniqueClickRate: calculatePercentage(stats.uniqueClickers, stats.sent),
//                 totalClickRate: calculatePercentage(stats.totalClicks, stats.sent),
//                 performanceScore,
//             });
//         }

//         return result.sort((a, b) => {
//             const pa = getClusterPriority(a.cluster, country);
//             const pb = getClusterPriority(b.cluster, country);
//             return pa - pb;
//         });
//     };
//     const analyzeDomainData = (records: EmailRecord[], country: string): DomainAnalysis[] => {
//         if (!records?.length) return [];

//         const domainMap: Record<string, any> = Object.create(null);

//         // ✅ Single loop (fastest possible)
//         for (let i = 0; i < records.length; i++) {
//             const r = records[i];
//             const domain = extractDomain(r.email);

//             const d = domainMap[domain] || {
//                 totalEmails: 0,
//                 hardBounces: 0,
//                 softBounces: 0,
//                 uniqueOpens: 0,
//                 uniqueClickers: 0,
//                 totalClicks: 0,
//                 sent: 0,
//             };

//             d.totalEmails++;
//             if (r.hardBounce) d.hardBounces++;
//             if (r.softBounce) d.softBounces++;
//             if (r.uniqueOpen) d.uniqueOpens++;
//             if (r.uniqueClicker) d.uniqueClickers++;
//             if (r.sent) d.sent++;
//             d.totalClicks += r.totalClicks;

//             domainMap[domain] = d;
//         }

//         // ✅ Map → Array faster conversion
//         const result = [];
//         for (const domain in domainMap) {
//             const stats = domainMap[domain];
//             const bounces = stats.hardBounces + stats.softBounces;
//             const performanceScore = calculatePerformanceScore(stats);
//             const clusterName = getClusterName(domain, country);

//             result.push({
//                 domain,
//                 cluster: clusterName,
//                 totalEmails: stats.totalEmails,
//                 sent: stats.sent,
//                 bounces,
//                 hardBounces: stats.hardBounces,
//                 softBounces: stats.softBounces,
//                 uniqueOpens: stats.uniqueOpens,
//                 uniqueClickers: stats.uniqueClickers,
//                 totalClicks: stats.totalClicks,
//                 hardBounceRate: calculatePercentage(stats.hardBounces, stats.sent),
//                 softBounceRate: calculatePercentage(stats.softBounces, stats.sent),
//                 uniqueOpenRate: calculatePercentage(stats.uniqueOpens, stats.sent),
//                 uniqueClickRate: calculatePercentage(stats.uniqueClickers, stats.sent),
//                 totalClickRate: calculatePercentage(stats.totalClicks, stats.sent),
//                 performanceScore,
//             });
//         }

//         // ✅ Sort only once (fast numeric sort)
//         return result.sort((a, b) => b.uniqueOpens - a.uniqueOpens);
//     };


//     const clusterColumnDefs: ColDef[] = [
//         {
//             headerName: "Cluster", field: "domain", width: 150, minWidth: 130,
//             tooltipField: "domain", headerTooltip: "Email Domain Cluster"
//         },
//         {
//             headerName: "Sent", field: "sent", width: 130,
//             tooltipField: "sent", headerTooltip: "Sent",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Hard Bounces", field: "hardBounces", width: 130,
//             headerTooltip: "Hard Bounces",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Soft Bounces", field: "softBounces", width: 130,
//             headerTooltip: "Soft Bounces",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Opens", field: "uniqueOpens", width: 140,
//             headerTooltip: "Unique Opens",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "% Unique Opens", field: "uniqueOpenRate", width: 140,
//             headerTooltip: "% Unique Opens /Sent",
//         },
//         {
//             headerName: "Total Clicks", field: "totalClicks", width: 140,
//             headerTooltip: "Total Clicks",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Clickers", field: "uniqueClickers", width: 140,
//             headerTooltip: "Unique Clickers",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "% Total Clicks / Sent", field: "totalClickRate", width: 140,
//             headerTooltip: "% Total Clicks/ Sent",
//         },
//         {
//             headerName: "% Unique Clickers / Sent", field: "uniqueClickRate", width: 150,
//             headerTooltip: "% Unique Clickers/ Sent",
//         },
//     ];

//     const domainColumnDefs: ColDef[] = [
//         {
//             headerName: "Domain", field: "domain", width: 150,
//             tooltipField: "domain", headerTooltip: "Email Domain"
//         },
//         {
//             headerName: "Sent", field: "sent", width: 140,
//             tooltipField: "sent", headerTooltip: "Sent",
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Hard Bounces", field: "hardBounces", width: 140,
//             headerTooltip: "Hard Bounces",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Soft Bounces", field: "softBounces", width: 130,
//             headerTooltip: "Soft Bounces",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Opens", field: "uniqueOpens", width: 130,
//             headerTooltip: "Unique Opens",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "% Unique Opens", field: "uniqueOpenRate", width: 130,
//             headerTooltip: "% Unique Opens /Sent",
//         },
//         {
//             headerName: "Total Clicks", field: "totalClicks", width: 140,
//             headerTooltip: "Total Clicks",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "Unique Clickers", field: "uniqueClickers", width: 140,
//             headerTooltip: "Unique Clickers",
//             valueFormatter: (params) => Number(params.value).toLocaleString(),
//             cellRenderer: (params: ICellRendererParams) => (
//                 <span>{formatIndianNumber(params.value || 0)}</span>
//             )
//         },
//         {
//             headerName: "% Total Clicks / Sent", field: "totalClickRate", width: 140,
//             headerTooltip: "% Total Clicks/ Sent",
//         },
//         {
//             headerName: "% Unique Clickers / Sent", field: "uniqueClickRate", width: 140,
//             headerTooltip: "% Unique Clickers/ Sent",
//         },
//     ];

//     const SummaryCard = ({ summary, title }: { summary: SummaryTotals; title: string }) => (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
//             <h4 className="font-semibold text-lg mb-6 text-gray-900 flex items-center">
//                 <MdBarChart className="w-5 h-5 mr-2 text-blue-600" />
//                 {title} Summary
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
//                     <div className="text-blue-100 text-sm font-medium">Total Sent</div>
//                     <div className="font-bold text-xl">{summary.totalSent.toLocaleString()}</div>
//                 </div>
//                 <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
//                     <div className="text-red-100 text-sm font-medium">Hard Bounces</div>
//                     <div className="font-bold text-xl">{summary.totalHardBounces.toLocaleString()}</div>
//                     <div className="text-xs text-red-100 mt-1">({summary.avgHardBounceRate})</div>
//                 </div>
//                 <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
//                     <div className="text-orange-100 text-sm font-medium">Soft Bounces</div>
//                     <div className="font-bold text-xl">{summary.totalSoftBounces.toLocaleString()}</div>
//                     <div className="text-xs text-orange-100 mt-1">({summary.avgSoftBounceRate})</div>
//                 </div>
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
//                     <div className="text-green-100 text-sm font-medium">Unique Opens</div>
//                     <div className="font-bold text-xl">{summary.totalUniqueOpens.toLocaleString()}</div>
//                     <div className="text-xs text-green-100 mt-1">({summary.avgUniqueOpenRate})</div>
//                 </div>
//                 <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
//                     <div className="text-purple-100 text-sm font-medium">Unique Clickers</div>
//                     <div className="font-bold text-xl">{summary.totalUniqueClickers.toLocaleString()}</div>
//                     <div className="text-xs text-purple-100 mt-1">({summary.avgUniqueClickRate})</div>
//                 </div>
//                 <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 rounded-lg text-white">
//                     <div className="text-indigo-100 text-sm font-medium">Total Clicks</div>
//                     <div className="font-bold text-xl">{summary.totalClicks.toLocaleString()}</div>
//                     <div className="text-xs text-indigo-100 mt-1">({summary.avgTotalClickRate})</div>
//                 </div>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//             {/* Header Section */}
//             <div className="bg-white shadow-sm border-b border-gray-200">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex items-center justify-between py-6">
//                         <div className="flex items-center space-x-4">
//                             <button
//                                 onClick={() => router.push('/')}
//                                 className="inline-flex items-center px-4 py-2 shadow-sm rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                             >
//                                 <MdOutlineArrowBackIos className="w-4 h-4 mr-2" />
//                                 <span className="font-medium">HOME</span>
//                             </button>
//                         </div>

//                         <div className="flex items-center space-x-3">
//                             <MdAssessment className="w-8 h-8 text-blue-600" />
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-900">Campaign Details</h1>
//                                 <p className="text-sm text-gray-600 mt-1">Detailed performance analysis</p>
//                             </div>
//                         </div>

//                         <div className="w-32"></div> {/* Spacer for center alignment */}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
//                 {/* Campaign Info Card */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//                     <div className="flex items-center justify-between mb-6">
//                         <div>
//                             <h2 className="text-xl font-bold text-gray-900 flex items-center">
//                                 📊 OVERALL STATS
//                             </h2>
//                             <h3 className="text-lg font-semibold text-blue-600 mt-2">{name}</h3>
//                         </div>

//                         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg px-6 py-3 text-white">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-indigo-100 text-sm">Active Domain</p>
//                                     <p className="text-lg font-bold">
//                                         {getCountryDisplayName(detectedCountry)}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex items-center space-x-4">
//                             <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white text-center">
//                                 <div className="text-blue-100 text-xs">Campaign ID</div>
//                                 <div className="font-bold">{id}</div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Campaign Summary Table */}
//                     <div >
//                         <div className="h-fit">
//                             <div className="ag-theme-alpine" style={{ width: '1370px', height: '120px' }}>
//                                 <AgGridReact
//                                     rowData={campaignSummaryRow}
//                                     columnDefs={summaryColumnDefs}
//                                     suppressColumnVirtualisation={true}
//                                     suppressAutoSize={false}
//                                     headerHeight={40}
//                                     rowHeight={50}
//                                     domLayout="normal"
//                                     defaultColDef={{
//                                         sortable: true,
//                                         filter: true,
//                                         resizable: true,
//                                         wrapHeaderText: true,
//                                         autoHeaderHeight: true,
//                                         cellStyle: {
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             fontSize: '14px',
//                                             padding: '0 12px',
//                                             whiteSpace: 'nowrap'
//                                         }
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                         {/* )} */}
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
//                     <div className="flex flex-wrap items-center gap-4">
//                         <button
//                             onClick={() => setShowClusterView(!showClusterView)}
//                             // onClick={showClusterView ? loadDomainData : () => setShowClusterView(true)}
//                             className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg ${showClusterView
//                                 ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
//                                 : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
//                                 }`}
//                         >
//                             <MdBarChart className="w-5 h-5 mr-2" />
//                             {showClusterView ? "📧 Cluster Analysis" : "🌐 Domain Analysis"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Analysis Table Section */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//                         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                             {showClusterView ? `📧 Domain Analysis By Fixed Domains for ${getCountryDisplayName(detectedCountry)}` : `🌐 Domain Analysis Performance Wise for ${getCountryDisplayName(detectedCountry)}`}
//                         </h3>
//                         <p className="text-sm text-gray-600 mt-1">
//                             {showClusterView
//                                 ? "Performance metrics grouped by email domain clusters"
//                                 : "Domain performance ranked by unique opens"
//                             }
//                         </p>
//                     </div>

//                     <div className="p-4">
//                         {loading ? (
//                             <div className="flex flex-col items-center justify-center py-16">
//                                 <div className="relative">
//                                     <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
//                                     <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
//                                 </div>
//                                 <p className="mt-4 text-gray-600 font-medium">Loading analysis data...</p>
//                                 <p className="text-sm text-gray-500 mt-1">Please wait while we analyze your campaign performance</p>
//                             </div>
//                         ) : error ? (
//                             <div className="flex flex-col items-center justify-center py-16">
//                                 <div className="bg-red-100 rounded-full p-4 mb-4">
//                                     <div className="text-red-600 text-2xl">⚠️</div>
//                                 </div>
//                                 <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
//                                 <p className="text-red-700 text-center max-w-md">{error}</p>
//                             </div>
//                         ) : (
//                             <div className="w-full overflow-x-auto">
//                                 <div className="ag-theme-alpine" style={{ minWidth: '1300px' }}>
//                                     {
//                                         showClusterView ?
//                                             <AgGridReact
//                                                 rowData={clusterAnalysis}
//                                                 columnDefs={clusterColumnDefs}
//                                                 domLayout="autoHeight"
//                                                 suppressColumnVirtualisation={true}
//                                                 suppressAutoSize={false}
//                                                 tooltipShowDelay={500}
//                                                 tooltipHideDelay={2000}
//                                                 rowHeight={50}
//                                                 headerHeight={50}
//                                                 enableCellTextSelection={true}
//                                                 suppressMovableColumns={true}
//                                                 suppressDragLeaveHidesColumns={true}
//                                                 animateRows={true}
//                                                 defaultColDef={{
//                                                     sortable: true,
//                                                     filter: true,
//                                                     resizable: true,
//                                                     wrapHeaderText: true,
//                                                     autoHeaderHeight: true,
//                                                     cellStyle: {
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         fontSize: '14px',
//                                                         padding: '0 12px',
//                                                         whiteSpace: 'nowrap'
//                                                     }
//                                                 }}
//                                             /> : <AgGridReact
//                                                 rowData={performanceBasedData}
//                                                 columnDefs={domainColumnDefs}
//                                                 domLayout="autoHeight"
//                                                 suppressColumnVirtualisation={true}
//                                                 suppressAutoSize={false}
//                                                 tooltipShowDelay={500}
//                                                 tooltipHideDelay={2000}
//                                                 rowHeight={50}
//                                                 headerHeight={50}
//                                                 enableCellTextSelection={true}
//                                                 suppressMovableColumns={true}
//                                                 suppressDragLeaveHidesColumns={true}
//                                                 animateRows={true}
//                                                 defaultColDef={{
//                                                     sortable: true,
//                                                     filter: true,
//                                                     resizable: true,
//                                                     wrapHeaderText: true,
//                                                     autoHeaderHeight: true,
//                                                     cellStyle: {
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         fontSize: '14px',
//                                                         padding: '0 12px',
//                                                         whiteSpace: 'nowrap'
//                                                     }
//                                                 }}
//                                             />
//                                     }

//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <div className="mt-4 px-28 ">
//                 {/* Summary Cards */}
//                 {!loading && !error && (
//                     <>
//                         {showClusterView && clusterSummary && (
//                             <SummaryCard summary={clusterSummary} title="Cluster Analysis" />
//                         )}
//                         {!showClusterView && domainSummary && (
//                             <SummaryCard summary={domainSummary} title="Domain Analysis" />
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
// export default CampaignDetail;

"use client"
import React, { use, useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import localforage from "localforage";
import { MdOutlineArrowBackIos, MdAnalytics, MdBarChart, MdAssessment } from "react-icons/md";
import axios from "axios";
import {
    ColDef,
    CustomFilterModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ValidationModule,
    TooltipModule,
    ClientSideRowModelModule,
    CellStyleModule,
    ICellRendererParams,
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    TooltipModule,
    TextFilterModule,
    CustomFilterModule,
    CellStyleModule,
]);

interface EmailRecord {
    id: number;
    campaignId: number;
    email: string;
    sent: boolean;
    hardBounce: boolean;
    softBounce: boolean;
    uniqueOpen: boolean;
    totalClicks: number;
    uniqueClicker: boolean;
    createdAt: string;
}

interface DomainAnalysis {
    domainName: string;
    sent: number;
    hardBounce: number;
    softBounce: number;
    uniqueOpen: number;
    uniqueClicks: number;
    totalClicks: number;
    toalClickRate: string;
    uniqueOpenRate: string;
    uniqueClicksRate: string;
}
interface ClusterAnalysis {
    clusterName: string;
    sent: number;
    hardBounce: number;
    softBounce: number;
    bounces: number;
    uniqueOpens: number;
    uniqueClickers: number;
    totalClicks: number;
    hardBounceRate: string;
    softBounceRate: string;
    toalClickRate: string;
    uniqueOpenRate: string;
    uniqueClickRate: string;
    performanceScore: number;
}

interface SummaryTotals {
    totalSent: number;
    totalHardBounces: number;
    totalSoftBounces: number;
    totalUniqueOpens: number;
    totalUniqueClickers: number;
    totalClicks: number;
    avgHardBounceRate: string;
    avgSoftBounceRate: string;
    avgUniqueOpenRate: string;
    avgUniqueClickRate: string;
    avgTotalClickRate: string;
}

// Country-specific domain cluster mappings
const COUNTRY_DOMAIN_CLUSTERS: { [country: string]: { [domain: string]: string } } = {
    NL: {
        // Dutch-specific domains
        "hotmail.nl": "Microsoft",
        "live.nl": "Microsoft",
        "outlook.nl": "Microsoft",
        "msn.nl": "Microsoft",
        "hotmail.com": "Microsoft",
        "live.com": "Microsoft",
        "outlook.com": "Microsoft",
        "msn.com": "Microsoft",
        "windowslive.com": "Microsoft",

        "telenet.be": "Telenet",
        "pandora.be": "Telenet",

        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        "kpnmail.nl": "KPN",
        "planet.nl": "KPN",
        "hetnet.nl": "KPN",
        "freeler.nl": "KPN",
        "xs4all.nl": "KPN",
        "surfmail.nl": "KPN",
        "kpnplanet.nl": "KPN",
        "telfort.nl": "KPN",
        "tiscali.nl": "KPN",
        "12move.nl": "KPN",

        "ziggo.nl": "Ziggo/UPC",
        "casema.nl": "Ziggo/UPC",
        "chello.nl": "Ziggo/UPC",
        "home.nl": "Ziggo/UPC",
        "quicknet.nl": "Ziggo/UPC",
        "upcmail.nl": "Ziggo/UPC",

        "yahoo.nl": "Yahoo",
        "yahoo.com": "Yahoo",
        "ymail.com": "Yahoo",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "zeelandnet.nl": "ZeelandNet",
        "caiway.nl": "Caiway",
        "kabelfoon.nl": "Caiway",
        "online.nl": "Online.nl",
        "solcon.nl": "Solcon",
        "wxs.nl": "WXS",
        "hccnet.nl": "HCCnet",
        "onsbrabantnet.nl": "OnsBrabantNet",
        "versatel.nl": "Versatel",
        "mail.com": "Mail.com",
    },
    FNL: {
        // Dutch-specific domains
        "hotmail.nl": "Microsoft",
        "live.nl": "Microsoft",
        "outlook.nl": "Microsoft",
        "msn.nl": "Microsoft",
        "hotmail.com": "Microsoft",
        "live.com": "Microsoft",
        "outlook.com": "Microsoft",
        "msn.com": "Microsoft",
        "windowslive.com": "Microsoft",

        "telenet.be": "Telenet",
        "pandora.be": "Telenet",
        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        "kpnmail.nl": "KPN",
        "planet.nl": "KPN",
        "hetnet.nl": "KPN",
        "freeler.nl": "KPN",
        "xs4all.nl": "KPN",
        "surfmail.nl": "KPN",
        "kpnplanet.nl": "KPN",
        "telfort.nl": "KPN",
        "tiscali.nl": "KPN",
        "12move.nl": "KPN",

        "ziggo.nl": "Ziggo/UPC",
        "casema.nl": "Ziggo/UPC",
        "chello.nl": "Ziggo/UPC",
        "home.nl": "Ziggo/UPC",
        "quicknet.nl": "Ziggo/UPC",
        "upcmail.nl": "Ziggo/UPC",

        "yahoo.nl": "Yahoo",
        "yahoo.com": "Yahoo",
        "ymail.com": "Yahoo",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "zeelandnet.nl": "ZeelandNet",
        "caiway.nl": "Caiway",
        "kabelfoon.nl": "Caiway",
        "online.nl": "Online.nl",
        "solcon.nl": "Solcon",
        "wxs.nl": "WXS",
        "hccnet.nl": "HCCnet",
        "onsbrabantnet.nl": "OnsBrabantNet",
        "versatel.nl": "Versatel",
        "mail.com": "Mail.com",
    },

    DK: {
        // Belgian-specific domains
        "hotmail.com.uk": "Microsoft",
        "hotmail.com": "Microsoft",
        "hotmail.de": "Microsoft",
        "hotmail.dk": "Microsoft",
        "hotmail.fr": "Microsoft",
        "live.co.uk": "Microsoft",
        "live.com": "Microsoft",
        "live.dk": "Microsoft",
        "live.fr": "Microsoft",
        "msn.com": "Microsoft",
        "outlook.com": "Microsoft",
        "outlook.dk": "Microsoft",

        "gmail.com": "Google",

        "yahoo.co.uk": "Yahoo",
        "yahoo.com": "Yahoo",
        "yahoo.de": "Yahoo",
        "yahoo.dk": "Yahoo",
        "yahoo.fr": "Yahoo",
        "yahoo.no": "Yahoo",
        "ymail.com": "Yahoo",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",
        "aol.com": "AOL",

        "mail.ru": "Mail.ru",
        "gmx.de": "GMX",
        "gmx.net": "GMX",
        "web.de": "Web.de",
        "btinternet.com": "BT Group",
        "bluewin.ch": "Swisscom",
    },

    FR: {
        // French-specific domains
        "hotmail.com": "Microsoft",
        "hotmail.fr": "Microsoft",
        "live.fr": "Microsoft",
        "msn.com": "Microsoft",
        "outlook.com": "Microsoft",
        "outlook.fr": "Microsoft",

        "gmail.com": "Google",

        "yahoo.com": "Yahoo",
        "yahoo.de": "Yahoo",
        "yahoo.fr": "Yahoo",
        "ymail.com": "Yahoo",

        "icloud.com": "Apple",
        "mac.com": "Apple",
        "me.com": "Apple",

        "aol.com": "AOL",
        "aol.fr": "AOL",
        "bluewin.ch": "Swisscom",
        "mail.ru": "Mail.ru",
        "gmx.de": "GMX",
        "gmx.net": "GMX",

        "web.de": "Web.de",
    },

    DE: {
        // German-specific domains
        "hotmail.com": "Microsoft",
        "hotmail.de": "Microsoft",
        "live.com": "Microsoft",
        "live.de": "Microsoft",
        "msn.com": "Microsoft",
        "outlook.com": "Microsoft",
        "outlook.de": "Microsoft",

        "gmail.com": "Google",
        "googlemail.com": "Google",

        "icloud.com": "Apple",
        "mac.com": "Apple",
        "me.com": "Apple",

        "t-online.de": "Telekom",
        "yahoo.com": "Yahoo",
        "yahoo.de": "Yahoo",
        "yahoo.fr": "Yahoo",
        "ymail.com": "Yahoo",

        "arcor.de": "Vodafone",
        "vodafone.de": "Vodafone",

        "aol.com": "AOL",
        "aol.de": "AOL",

        "gmx.at": "GMX",
        "gmx.de": "GMX",
        "gmx.net": "GMX",

        "web.de": "Web.de",
        "email.de": "Web.de",

        "mail.de": "Mail.de",
        "netcologne.de": "NetCologne",
        "bluewin.ch": "Swisscom",
        "onlinehome.de": "1&1 Ionos",
        "mail.ru": "Mail.ru",
    },

    UK: {
        // UK-specific domains
        "hotmail.com": "Hotmail",
        "hotmail.co.uk": "Hotmail",
        "msn.com": "Hotmail",
        "live.com": "Hotmail",
        "outlook.com": "Hotmail",


        "gmail.com": "Google",
        "googlemail.com": "Google",

        "btinternet.com": "BT Group",
        "btopenworld.com": "BT Group",
        "talk21.com": "BT Group",
        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "sky.com": "Sky",
        "blueyonder.co.uk": "Virgin Media",
        "virginmedia.com": "Virgin Media",
        "ntlworld.com": "Virgin Media",

        "yahoo.co.uk": "Yahoo",

        "mail.ru": "Mail.ru",
        "aol.com": "AOL",
    }
};

// Country-specific cluster priority orders
const COUNTRY_CLUSTER_PRIORITIES: { [country: string]: string[] } = {
    NL: [
        "Microsoft", "Gmail", "KPN", "Telenet", "Ziggo/UPC", "Yahoo", "Apple",
        "ZeelandNet", "Caiway", "Online.nl", "Solcon", "WXS",
        "HCCnet", "OnsBrabantNet", "Versatel", "Mail.com", "Others"
    ],
    FNL: [
        "Microsoft", "Gmail", "KPN", "Telenet", "Ziggo/UPC", "Yahoo", "Apple",
        "ZeelandNet", "Caiway", "Online.nl", "Solcon", "WXS",
        "HCCnet", "OnsBrabantNet", "Versatel", "Mail.com", "Others"
    ],

    DK: [
        "Microsoft", "Google", "Yahoo", "Apple", "AOL", "Mail.ru", "GMX", "Web.de",
        "BT Group", "Swisscom", "Others"
    ],

    FR: [
        "Microsoft", "Google", "Yahoo", "Apple", "AOL", "Swisscom", "Mail.ru", "GMX",
        "Web.de", "Others"
    ],

    DE: [
        "Microsoft", "Google", "Apple", "Telekom", "Yahoo", "Vodafone", "AOL", "GMX", "Web.de",
        "Mail.de", "NetCologne", "Swisscom", "1&1 Ionos", "Mail.ru", "Others"
    ],

    UK: [
        "Hotmail", "Google", "BT Group", "Apple", "Sky", "Virgin Media", "Yahoo",
        "Mail.ru", "AOL", "Others"
    ]
};

// Country-specific domain ordering for detailed view
const COUNTRY_DOMAIN_ORDERS: { [country: string]: string[] } = {
    NL: [
        // Microsoft cluster
        "hotmail.nl", "live.nl", "outlook.nl", "msn.nl", "hotmail.com",
        "live.com", "outlook.com", "msn.com", "windowslive.com",
        "telenet.be", "pandora.be",
        // Gmail
        "gmail.com", "googlemail.com",
        // KPN cluster
        "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl",
        "surfmail.nl", "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",
        // Ziggo cluster
        "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
        // Other domains
        "yahoo.nl", "yahoo.com", "ymail.com", "icloud.com", "me.com", "mac.com",
        "zeelandnet.nl", "caiway.nl", "kabelfoon.nl", "online.nl", "solcon.nl",
        "wxs.nl", "hccnet.nl", "onsbrabantnet.nl", "versatel.nl", "mail.com"
    ],
    FNL: [
        // Microsoft cluster
        "hotmail.nl", "live.nl", "outlook.nl", "msn.nl", "hotmail.com",
        "live.com", "outlook.com", "msn.com", "windowslive.com",
        "telenet.be", "pandora.be",
        // Gmail
        "gmail.com", "googlemail.com",
        // KPN cluster
        "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl",
        "surfmail.nl", "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",
        // Ziggo cluster
        "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
        // Other domains
        "yahoo.nl", "yahoo.com", "ymail.com", "icloud.com", "me.com", "mac.com",
        "zeelandnet.nl", "caiway.nl", "kabelfoon.nl", "online.nl", "solcon.nl",
        "wxs.nl", "hccnet.nl", "onsbrabantnet.nl", "versatel.nl", "mail.com"
    ],

    DK: [
        "hotmail.co.uk", "hotmail.com", "hotmail.de", "hotmail.dk", "hotmail.fr", "live.co.uk", "live.dk", "live.fr", "outlook.be", "live.com",
        "outlook.com", "outlook.dk", "msn.com", "gmail.com", "yahoo.co.uk",
        "yahoo.com", "yahoo.de", "yahoo.dk", "yahoo.fr", "yahoo.no", "ymail.com", "icloud.com", "mac.com", "me.com",
        "aol.com", "mail.ru", "gmx.de", "gmx.net", "web.de", "btinternet.com", "bluewin.ch",
    ],

    FR: [
        "hotmail.fr", "live.fr", "outlook.fr", "hotmail.com",
        "outlook.com", "msn.com", "gmail.com",
        "yahoo.fr", "yahoo.com", "ymail.com", "yahoo.de", "icloud.com",
        "me.com", "mac.com", "aol.com", "aol.fr", "bluewin.ch", "mail.ru", "gmx.de", "gmx.net", "web.de"
    ],

    DE: [
        "hotmail.com", "hotmail.de", "live.com", "live.de", "msn.com", "outlook.com", "outlook.de",
        "gmail.com", "googlemail.com", "icloud.com", "mac.com", "me.com", "t-online.de", "yahoo.com",
        "yahoo.de", "yahoo.fr", "ymail.com", "arcor.de", "vodafone.de", "aol.com", "aol.de",
        "gmx.at", "gmx.de", "gmx.net", "email.de", "web.de", "mail.de", "netcologne.de", "bluewin.ch",
        "onlinehome.de", "mail.ru"
    ],

    UK: [
        "hotmail.co.uk", "hotmail.com", "msn.com",
        "live.com", "outlook.com", "gmail.com", "googlemail.com",
        "btinternet.com", "btopenworld.com", "talk21.com", "icloud.com", "me.com", "mac.com", "sky.com", "blueyonder.co.uk",
        "ntlworld.com",
        "virginmedia.com", "yahoo.co.uk", "mail.ru",
        "aol.com"
    ]
};
const formatIndianNumber = (num: number): string => {
    if (isNaN(num)) return "0";
    return num
        .toLocaleString("en-IN") // Indian numbering system (12,500 / 1,30,800 / 10,00,000)
        .replace(/,/g, ".");     // replace commas with dots
};
const CampaignDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const id1 = Number(id);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dataParam = searchParams.get("data");
    const countryParam = searchParams.get("country");

    let campaignData = null;
    let detectedCountry = 'NL'; // default
    const [rawData, setRawData] = useState<any>(null);
    const [clusterAnalysis, setClusterAnalysis] = useState<ClusterAnalysis[]>([]);
    const [performanceBasedData, setPerformanceBasedData] = useState<DomainAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showClusterView, setShowClusterView] = useState(true);
    const [clusterSummary, setClusterSummary] = useState<SummaryTotals | null>(null);
    const [domainSummary, setDomainSummary] = useState<SummaryTotals | null>(null);
    const CACHE_KEY = `campaignData_${id}`;
    const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours
    const memoClusterData = useMemo(() => clusterAnalysis, [clusterAnalysis]);
    const memoDomainData = useMemo(() => performanceBasedData, [performanceBasedData]);

    const fetchWithCache = async (key: string, duration: number, fetcher: () => Promise<any>) => {
        const cached: any = await localforage.getItem(key);

        if (cached && Date.now() - cached.time < duration) {
            return { data: cached.data, cached: true };
        }

        const freshData = await fetcher();
        await localforage.setItem(key, {
            data: freshData,
            time: Date.now()
        });

        return { data: freshData, cached: false };
    };

    const getDynamicCacheDuration = () => {
    const dataParam = searchParams.get("data");
    let campaignDateStr = null;

    if (dataParam) {
        try {
            const parsed = JSON.parse(decodeURIComponent(dataParam));
            if (parsed.name) {
                const match = parsed.name.match(/^(\d{8})/);
                if (match) campaignDateStr = match[1];
            }
        } catch (err) {
            console.error("Date parse error:", err);
        }
    }

    let CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // default 3 hours

    if (campaignDateStr) {
        const year = parseInt(campaignDateStr.substring(0, 4));
        const month = parseInt(campaignDateStr.substring(4, 6)) - 1;
        const day = parseInt(campaignDateStr.substring(6, 8));

        const campaignDate = new Date(year, month, day);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        campaignDate.setHours(0, 0, 0, 0);

        const diffDays =
            (today.getTime() - campaignDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays <= 0) {
            CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // Today → 3 hours
        } else if (diffDays > 0 && diffDays <= 4) {
            CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // Last 4 days → 24 hours
        } else {
            CACHE_DURATION_MS = 10 * 24 * 60 * 60 * 1000; // Older → 10 days
        }
    }

    return CACHE_DURATION_MS;
};

useEffect(() => {
    const loadAllData = async () => {
        try {
            setLoading(true);

            const CLUSTER_KEY = `campaign_cluster_${id}`;
            const DOMAIN_KEY  = `campaign_domain_${id}`;

            // ⭐ Dynamic Cache Time Based on Campaign Date ⭐
            const DYNAMIC_CACHE_DURATION = getDynamicCacheDuration();
            console.log("CACHE DURATION:", DYNAMIC_CACHE_DURATION / (60*60*1000), "hours");

            // ⭐ Fetch Cluster + Domain in Parallel
            const [clusterResult, domainResult] = await Promise.all([
                fetchWithCache(CLUSTER_KEY, DYNAMIC_CACHE_DURATION, async () => {
                    const res = await axios.post(
                        "/api/mailcamp/cluster-data-by-campaign",
                        { campaignId: id1 }
                    );
                    return res.data.data;
                }),
                fetchWithCache(DOMAIN_KEY, DYNAMIC_CACHE_DURATION, async () => {
                    const res = await axios.post(
                        "/api/mailcamp/domain-data-by-campaign",
                        { campaignId: id1 }
                    );
                    return res.data.data;
                })
            ]);

            // ⭐ Store Cluster
            setClusterAnalysis(clusterResult.data);
            setClusterSummary(calculateSummaryTotals(clusterResult.data));

            // ⭐ Store Domain
            setPerformanceBasedData(domainResult.data);
            setDomainSummary(calculateSummaryTotals(domainResult.data));

        } catch (err: any) {
            setError(err.message || "API error");
        } finally {
            setLoading(false);
        }
    };

    loadAllData();
}, [id]);

    const validateCountry = (country: string | null): string => {
        const supportedCountries = ['NL', 'FNL', 'DK', 'FR', 'DE', 'UK'];

        if (!country) {
            console.warn(`No country provided, falling back to NL`);
            return 'NL';
        }

        // Handle "Travelwhale XX" format
        if (country.startsWith('Travelwhale ')) {
            const extractedCode = country.replace('Travelwhale ', '');
            if (supportedCountries.includes(extractedCode)) {
                return extractedCode;
            }
        }
        if (country.startsWith('Favotrip ')) {
            const extractedCode = 'F' + country.replace('Favotrip ', ''); // Add 'F' prefix
            if (supportedCountries.includes(extractedCode)) {
                return extractedCode;
            }
        }
        // Handle direct country code format
        if (supportedCountries.includes(country)) {
            return country;
        }

        console.warn(`Unsupported country: ${country}, falling back to NL`);
        return 'NL';
    };

    // Helper function to extract country from campaign data
    const extractCountryFromData = (campaignData: any): string => {
        if (campaignData?.account?.name) {
            const accountName = campaignData.account.name;
            // Extract country code from account name like "Travelwhale DE"
            if (accountName.startsWith('Travelwhale ')) {
                const countryCode = accountName.replace('Travelwhale ', '');
                const supportedCountries = ['NL', 'DK', 'FR', 'DE', 'UK'];
                if (supportedCountries.includes(countryCode)) {
                    return countryCode;
                }
            }
            if (accountName.startsWith('Favotrip ')) {
                const countryCode = 'F' + accountName.replace('Favotrip ', ''); // Add 'F' prefix
                const supportedCountries = ['FNL', 'FDK', 'FFR', 'FDE', 'FUK'];
                if (supportedCountries.includes(countryCode)) {
                    return countryCode;
                }
            }
        }
        return 'NL'; // fallback
    };

    // Parse data and detect country
    if (dataParam) {
        try {
            const decodedData = decodeURIComponent(dataParam);
            campaignData = JSON.parse(decodedData);
            console.log("Parsed campaign data:", campaignData);

            // Extract country from campaign data as primary source
            detectedCountry = extractCountryFromData(campaignData);

            // If country param is provided, validate and use it as override
            if (countryParam) {
                const validatedFromParam = validateCountry(countryParam);
                if (validatedFromParam !== 'NL' || countryParam.includes('NL')) {
                    detectedCountry = validatedFromParam;
                }
            }

        } catch (error) {
            console.error("Error parsing campaign data:", error);
        }
    } else if (countryParam) {
        // Fallback to URL param if no data param
        detectedCountry = validateCountry(countryParam);
    }

    console.log("Detected country:", detectedCountry);

    const name = campaignData?.name || null;
    const sent = campaignData?.sent || 0;
    const hardBounce = campaignData?.hardBounce || 0;
    const softBounce = campaignData?.softBounce || 0;
    const uniqueOpeners = campaignData?.uniqueOpeners || 0;
    const totalClicks = campaignData?.totalClicks || 0;
    const uniqueClickers = campaignData?.uniqueClickers || 0;
    const unsubscribes = campaignData?.unsubscribes || 0;
    const complaints = campaignData?.complaints || 0;
    const createdAt = campaignData?.createdAt || null;
    const statId = campaignData?.statId || null;

    const allSearchParams = Object.fromEntries(searchParams.entries());
    console.log(allSearchParams, "all search params")

    const campaignSummaryRow = campaignData
        ? [{
            campaignName: campaignData.name,
            sent: campaignData.sent,
            hardBounce: campaignData.hardBounce,
            softBounce: campaignData.softBounce,
            uniqueOpeners: campaignData.uniqueOpeners,
            totalClicks: campaignData.totalClicks,
            uniqueClickers: campaignData.uniqueClickers,
            unsubscribes: campaignData.unsubscribes,
            complaints: campaignData.complaints,
            createdAt: campaignData.createdAt,
            uniqueOpenRate: ((campaignData.uniqueOpeners / campaignData.sent) * 100).toFixed(2) + "%",
            uniqueClickRate: ((campaignData.uniqueClickers / campaignData.sent) * 100).toFixed(2) + "%",
            totalClickRate: ((campaignData.totalClicks / campaignData.sent) * 100).toFixed(2) + "%",
        }]
        : [];

    const summaryColumnDefs: ColDef[] = [
        {
            headerName: "Sent", field: "sent", width: 100, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Hard Bounces", field: "hardBounce", width: 120, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Soft Bounces", field: "softBounce", width: 120, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Opens", field: "uniqueOpeners", width: 130, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        { headerName: "% Unique Opens", field: "uniqueOpenRate", width: 120, },
        {
            headerName: "Total Clicks", field: "totalClicks", width: 120, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Clickers", field: "uniqueClickers", width: 135, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        { headerName: "% Total Clicks", field: "totalClickRate", width: 130, },
        { headerName: "% Unique Clickers", field: "uniqueClickRate", width: 130, },
        {
            headerName: "Unsubscribes", field: "unsubscribes", width: 135, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Complaints", field: "complaints", width: 120, cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
    ];

    const getCountryDisplayName = (countryCode: string): string => {
        console.log(countryCode, "country code in details")
        const countryNames: { [key: string]: string } = {
            'NL': 'Travelwhale NL',
            'FNL': 'Favotrip NL',
            'DE': 'Travelwhale DE',
            'DK': 'Travelwhale DK',
            'FR': 'Travelwhale FR',
            'UK': 'Travelwhale UK'
        };
        return countryNames[countryCode] || countryCode;
    };

    const calculatePercentage = (numerator: number, denominator: number): string => {
        if (denominator === 0) return "0.00%";
        return ((numerator / denominator) * 100).toFixed(2) + "%";
    };

    const calculatePerformanceScore = (stats: any): number => {
        return stats.uniqueOpens;
    };

    const calculateSummaryTotals = (data: DomainAnalysis[]): SummaryTotals => {
        const totals = data.reduce((acc, item) => {
            acc.totalSent += item.sent;
            acc.totalHardBounces += item.hardBounce;
            acc.totalSoftBounces += item.softBounce;
            acc.totalUniqueOpens += item.uniqueOpen;
            acc.totalUniqueClickers += item.uniqueClicks;
            acc.totalClicks += item.totalClicks;
            return acc;
        }, {
            totalSent: 0,
            totalHardBounces: 0,
            totalSoftBounces: 0,
            totalUniqueOpens: 0,
            totalUniqueClickers: 0,
            totalClicks: 0
        });

        return {
            ...totals,
            avgHardBounceRate: calculatePercentage(totals.totalHardBounces, totals.totalSent),
            avgSoftBounceRate: calculatePercentage(totals.totalSoftBounces, totals.totalSent),
            avgUniqueOpenRate: calculatePercentage(totals.totalUniqueOpens, totals.totalSent),
            avgUniqueClickRate: calculatePercentage(totals.totalUniqueClickers, totals.totalSent),
            avgTotalClickRate: calculatePercentage(totals.totalClicks, totals.totalSent)
        };
    };

    const clusterColumnDefs: ColDef[] = [
        {
            headerName: "Cluster", field: "clusterName", width: 150, minWidth: 130,
            tooltipField: "Cluster", headerTooltip: "Email Domain Cluster"
        },
        {
            headerName: "Sent", field: "sent", width: 130,
            tooltipField: "sent", headerTooltip: "Sent",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Hard Bounces", field: "hardBounce", width: 130,
            headerTooltip: "Hard Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Soft Bounces", field: "softBounce", width: 130,
            headerTooltip: "Soft Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Opens", field: "uniqueOpen", width: 140,
            headerTooltip: "Unique Opens",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Unique Opens", field: "uniqueOpenRate", width: 140,
            headerTooltip: "% Unique Opens /Sent",
        },
        {
            headerName: "Total Clicks", field: "totalClicks", width: 140,
            headerTooltip: "Total Clicks",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Clickers", field: "uniqueClicks", width: 140,
            headerTooltip: "Unique Clickers",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Total Clicks / Sent", field: "toalClickRate", width: 140,
            headerTooltip: "% Total Clicks/ Sent",
        },
        {
            headerName: "% Unique Clickers / Sent", field: "uniqueClicksRate", width: 150,
            headerTooltip: "% Unique Clickers/ Sent",
        },
    ];

    const domainColumnDefs: ColDef[] = [
        {
            headerName: "Domain", field: "domainName", width: 150,
            tooltipField: "domain", headerTooltip: "Email Domain"
        },
        {
            headerName: "Sent", field: "sent", width: 140,
            tooltipField: "sent", headerTooltip: "Sent",
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Hard Bounces", field: "hardBounce", width: 140,
            headerTooltip: "Hard Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Soft Bounces", field: "softBounce", width: 130,
            headerTooltip: "Soft Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Opens", field: "uniqueOpen", width: 130,
            headerTooltip: "Unique Opens",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Unique Opens", field: "uniqueOpenRate", width: 130,
            headerTooltip: "% Unique Opens /Sent",
        },
        {
            headerName: "Total Clicks", field: "totalClicks", width: 140,
            headerTooltip: "Total Clicks",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "Unique Clickers", field: "uniqueClicks", width: 140,
            headerTooltip: "Unique Clickers",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
            cellRenderer: (params: ICellRendererParams) => (
                <span>{formatIndianNumber(params.value || 0)}</span>
            )
        },
        {
            headerName: "% Total Clicks / Sent", field: "toalClickRate", width: 140,
            headerTooltip: "% Total Clicks/ Sent",
        },
        {
            headerName: "% Unique Clickers / Sent", field: "uniqueClicksRate", width: 140,
            headerTooltip: "% Unique Clickers/ Sent",
        },
    ];

    const SummaryCard = ({ summary, title }: { summary: SummaryTotals; title: string }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h4 className="font-semibold text-lg mb-6 text-gray-900 flex items-center">
                <MdBarChart className="w-5 h-5 mr-2 text-blue-600" />
                {title} Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                    <div className="text-blue-100 text-sm font-medium">Total Sent</div>
                    <div className="font-bold text-xl">{summary.totalSent.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
                    <div className="text-red-100 text-sm font-medium">Hard Bounces</div>
                    <div className="font-bold text-xl">{summary.totalHardBounces.toLocaleString()}</div>
                    <div className="text-xs text-red-100 mt-1">({summary.avgHardBounceRate})</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                    <div className="text-orange-100 text-sm font-medium">Soft Bounces</div>
                    <div className="font-bold text-xl">{summary.totalSoftBounces.toLocaleString()}</div>
                    <div className="text-xs text-orange-100 mt-1">({summary.avgSoftBounceRate})</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                    <div className="text-green-100 text-sm font-medium">Unique Opens</div>
                    <div className="font-bold text-xl">{summary.totalUniqueOpens.toLocaleString()}</div>
                    <div className="text-xs text-green-100 mt-1">({summary.avgUniqueOpenRate})</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                    <div className="text-purple-100 text-sm font-medium">Unique Clickers</div>
                    <div className="font-bold text-xl">{summary.totalUniqueClickers.toLocaleString()}</div>
                    <div className="text-xs text-purple-100 mt-1">({summary.avgUniqueClickRate})</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 rounded-lg text-white">
                    <div className="text-indigo-100 text-sm font-medium">Total Clicks</div>
                    <div className="font-bold text-xl">{summary.totalClicks.toLocaleString()}</div>
                    <div className="text-xs text-indigo-100 mt-1">({summary.avgTotalClickRate})</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center px-4 py-2 shadow-sm rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <MdOutlineArrowBackIos className="w-4 h-4 mr-2" />
                                <span className="font-medium">HOME</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MdAssessment className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Campaign Details</h1>
                                <p className="text-sm text-gray-600 mt-1">Detailed performance analysis</p>
                            </div>
                        </div>

                        <div className="w-32"></div> {/* Spacer for center alignment */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
                {/* Campaign Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                📊 OVERALL STATS
                            </h2>
                            <h3 className="text-lg font-semibold text-blue-600 mt-2">{name}</h3>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg px-6 py-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">Active Domain</p>
                                    <p className="text-lg font-bold">
                                        {getCountryDisplayName(detectedCountry)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white text-center">
                                <div className="text-blue-100 text-xs">Campaign ID</div>
                                <div className="font-bold">{id}</div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Summary Table */}
                    <div >
                        <div className="h-fit">
                            <div className="ag-theme-alpine" style={{ width: '1370px', height: '120px' }}>
                                <AgGridReact
                                    rowData={campaignSummaryRow}
                                    columnDefs={summaryColumnDefs}
                                    suppressColumnVirtualisation={true}
                                    suppressAutoSize={false}
                                    headerHeight={40}
                                    rowHeight={50}
                                    domLayout="normal"
                                    defaultColDef={{
                                        sortable: true,
                                        filter: true,
                                        resizable: true,
                                        wrapHeaderText: true,
                                        autoHeaderHeight: true,
                                        cellStyle: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            padding: '0 12px',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        {/* )} */}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            // onClick={() => setShowClusterView(!showClusterView)}
                            onClick={async () => {
                                const newView = !showClusterView;
                                setShowClusterView(newView);
                                setLoading(true);

                                const CLUSTER_KEY = `campaign_cluster_${id}`;
                                const DOMAIN_KEY = `campaign_domain_${id}`;
                                const CACHE_DURATION = 3 * 60 * 60 * 1000;

                                if (newView === true) {
                                    // Load Cluster data from cache
                                    const cached: any = await localforage.getItem(CLUSTER_KEY);
                                    if (cached) {
                                        setClusterAnalysis(cached.data);
                                        setClusterSummary(calculateSummaryTotals(cached.data));
                                    }
                                } else {
                                    // Load Domain data from cache
                                    const cached: any = await localforage.getItem(DOMAIN_KEY);
                                    if (cached) {
                                        setPerformanceBasedData(cached.data);
                                        setDomainSummary(calculateSummaryTotals(cached.data));
                                    }
                                }

                                setLoading(false);
                            }}
                            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg ${showClusterView
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                                }`}
                        >
                            <MdBarChart className="w-5 h-5 mr-2" />
                            {showClusterView ? "📧 Cluster Analysis" : "🌐 Domain Analysis"}
                        </button>
                    </div>
                </div>

                {/* Analysis Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {showClusterView ? `📧 Domain Analysis By Fixed Domains for ${getCountryDisplayName(detectedCountry)}` : `🌐 Domain Analysis Performance Wise for ${getCountryDisplayName(detectedCountry)}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {showClusterView
                                ? "Performance metrics grouped by email domain clusters"
                                : "Domain performance ranked by unique opens"
                            }
                        </p>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                                </div>
                                <p className="mt-4 text-gray-600 font-medium">Loading analysis data...</p>
                                <p className="text-sm text-gray-500 mt-1">Please wait while we analyze your campaign performance</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="bg-red-100 rounded-full p-4 mb-4">
                                    <div className="text-red-600 text-2xl">⚠️</div>
                                </div>
                                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
                                <p className="text-red-700 text-center max-w-md">{error}</p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <div className="ag-theme-alpine" style={{ minWidth: '1300px' }}>
                                    {
                                        showClusterView ?
                                            <AgGridReact
                                                rowData={clusterAnalysis}

                                                columnDefs={clusterColumnDefs}
                                                domLayout="autoHeight"
                                                suppressColumnVirtualisation={true}
                                                suppressAutoSize={false}
                                                tooltipShowDelay={500}
                                                tooltipHideDelay={2000}
                                                rowHeight={50}
                                                headerHeight={50}
                                                enableCellTextSelection={true}
                                                suppressMovableColumns={true}
                                                suppressDragLeaveHidesColumns={true}
                                                animateRows={true}
                                                defaultColDef={{
                                                    sortable: true,
                                                    filter: true,
                                                    resizable: true,
                                                    wrapHeaderText: true,
                                                    autoHeaderHeight: true,
                                                    cellStyle: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '14px',
                                                        padding: '0 12px',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                }}
                                            /> : <AgGridReact
                                                rowData={performanceBasedData}

                                                columnDefs={domainColumnDefs}
                                                domLayout="autoHeight"
                                                suppressColumnVirtualisation={true}
                                                suppressAutoSize={false}
                                                tooltipShowDelay={500}
                                                tooltipHideDelay={2000}
                                                rowHeight={50}
                                                headerHeight={50}
                                                enableCellTextSelection={true}
                                                suppressMovableColumns={true}
                                                suppressDragLeaveHidesColumns={true}
                                                animateRows={true}
                                                defaultColDef={{
                                                    sortable: true,
                                                    filter: true,
                                                    resizable: true,
                                                    wrapHeaderText: true,
                                                    autoHeaderHeight: true,
                                                    cellStyle: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '14px',
                                                        padding: '0 12px',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                }}
                                            />
                                    }

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4 px-28 ">
                {/* Summary Cards */}
                {/* {!loading && !error && ( */}
                <>
                    {showClusterView && clusterSummary && (
                        <SummaryCard summary={clusterSummary} title="Cluster Analysis" />
                    )}
                    {!showClusterView && domainSummary && (
                        <SummaryCard summary={domainSummary} title="Domain Analysis" />
                    )}
                </>
                {/* )} */}
            </div>
        </div>
    );
};
export default CampaignDetail;