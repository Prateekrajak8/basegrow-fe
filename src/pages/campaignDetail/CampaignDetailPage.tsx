"use client"
import React, { use, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
    domain: string;
    cluster: string;
    totalEmails: number;
    sent: number;
    hardBounces: number;
    softBounces: number;
    bounces: number;
    uniqueOpens: number;
    uniqueClickers: number;
    totalClicks: number;
    hardBounceRate: string;
    softBounceRate: string;
    totalClickRate: string;
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

// Domain to Cluster mapping based on your Excel data
const DOMAIN_CLUSTER_MAP: { [key: string]: string } = {
    // Microsoft cluster
    "hotmail.com": "Microsoft",
    "hotmail.nl": "Microsoft",
    "live.com": "Microsoft",
    "live.nl": "Microsoft",
    "outlook.com": "Microsoft",
    "outlook.nl": "Microsoft",
    "msn.com": "Microsoft",
    "msn.nl": "Microsoft",
    "windowslive.com": "Microsoft",
    "hotmail.be": "Microsoft",
    "live.be": "Microsoft",
    "outlook.be": "Microsoft",

    // Gmail cluster
    "gmail.com": "Gmail",
    "googlemail.com": "Gmail",

    // KPN cluster
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

    // Ziggo cluster
    "ziggo.nl": "Ziggo/UPC",
    "casema.nl": "Ziggo/UPC",
    "chello.nl": "Ziggo/UPC",
    "home.nl": "Ziggo/UPC",
    "quicknet.nl": "Ziggo/UPC",
    "upcmail.nl": "Ziggo/UPC",

    // Telenet cluster
    "telenet.be": "Telenet",

    // Skynet cluster
    "skynet.be": "Skynet/Proximus",
    "proximus.be": "Skynet/Proximus",

    // Yahoo cluster
    "yahoo.com": "Yahoo",
    "yahoo.fr": "Yahoo",
    "ymail.com": "Yahoo",
    "laposte.net": "Yahoo",

    // Apple cluster
    "icloud.com": "Apple",
    "me.com": "Apple",
    "mac.com": "Apple",

    // Pandora cluster
    "pandora.be": "Pandora",

    // Zeeland cluster
    "zeelandnet.nl": "ZeelandNet",

    // Caiway cluster
    "caiway.nl": "Caiway",
    "kabelfoon.nl": "Caiway",

    // Online.nl cluster
    "online.nl": "Online.nl",

    // Scarlet cluster
    "scarlet.be": "Scarlet",

    // Solcon cluster
    "solcon.nl": "Solcon",

    // VXS cluster
    "wxs.nl": "WXS",

    // HCCnet cluster
    "hccnet.nl": "HCCnet",

    // OnsBrabant cluster
    "onsbrabantnet.nl": "OnsBrabantNet",

    // Mail.com cluster
    "mail.com": "Mail.com",

    // Versatel cluster
    "versatel.nl": "Versatel",
};
const COUNTRY_DOMAIN_CLUSTERS: { [country: string]: { [domain: string]: string } } = {
    NL: {
        // Microsoft cluster
        "hotmail.com": "Microsoft",
        "hotmail.nl": "Microsoft",
        "live.com": "Microsoft",
        "live.nl": "Microsoft",
        "outlook.com": "Microsoft",
        "outlook.nl": "Microsoft",
        "msn.com": "Microsoft",
        "msn.nl": "Microsoft",
        "windowslive.com": "Microsoft",
        "hotmail.be": "Microsoft",
        "live.be": "Microsoft",
        "outlook.be": "Microsoft",

        // Gmail cluster
        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        // KPN cluster
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

        // Ziggo cluster
        "ziggo.nl": "Ziggo/UPC",
        "casema.nl": "Ziggo/UPC",
        "chello.nl": "Ziggo/UPC",
        "home.nl": "Ziggo/UPC",
        "quicknet.nl": "Ziggo/UPC",
        "upcmail.nl": "Ziggo/UPC",

        // Telenet cluster
        "telenet.be": "Telenet",

        // Skynet cluster
        "skynet.be": "Skynet/Proximus",
        "proximus.be": "Skynet/Proximus",

        // Yahoo cluster
        "yahoo.com": "Yahoo",
        "yahoo.fr": "Yahoo",
        "ymail.com": "Yahoo",
        "laposte.net": "Yahoo",

        // Apple cluster
        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        // Pandora cluster
        "pandora.be": "Pandora",

        // Zeeland cluster
        "zeelandnet.nl": "ZeelandNet",

        // Caiway cluster
        "caiway.nl": "Caiway",
        "kabelfoon.nl": "Caiway",

        // Online.nl cluster
        "online.nl": "Online.nl",

        // Scarlet cluster
        "scarlet.be": "Scarlet",

        // Solcon cluster
        "solcon.nl": "Solcon",

        // VXS cluster
        "wxs.nl": "WXS",

        // HCCnet cluster
        "hccnet.nl": "HCCnet",

        // OnsBrabant cluster
        "onsbrabantnet.nl": "OnsBrabantNet",

        // Mail.com cluster
        "mail.com": "Mail.com",

        // Versatel cluster
        "versatel.nl": "Versatel",
    },

    DK: {
        // Belgian-specific domains
        "hotmail.be": "Microsoft",
        "live.be": "Microsoft",
        "outlook.be": "Microsoft",
        "hotmail.com": "Microsoft",
        "live.com": "Microsoft",
        "outlook.com": "Microsoft",
        "msn.com": "Microsoft",

        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        "telenet.be": "Telenet",
        "skynet.be": "Skynet/Proximus",
        "proximus.be": "Skynet/Proximus",
        "pandora.be": "Pandora",
        "scarlet.be": "Scarlet",
        "belgacom.net": "Belgacom",

        "yahoo.com": "Yahoo",
        "yahoo.fr": "Yahoo",
        "ymail.com": "Yahoo",
        "laposte.net": "Yahoo",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "mail.com": "Mail.com",
    },

    FR: {
        // French-specific domains
        "hotmail.fr": "Microsoft",
        "live.fr": "Microsoft",
        "outlook.fr": "Microsoft",
        "hotmail.com": "Microsoft",
        "live.com": "Microsoft",
        "outlook.com": "Microsoft",
        "msn.com": "Microsoft",

        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        "orange.fr": "Orange",
        "wanadoo.fr": "Orange",
        "voila.fr": "Orange",

        "free.fr": "Free",
        "sfr.fr": "SFR",
        "neuf.fr": "SFR",
        "cegetel.net": "SFR",

        "yahoo.fr": "Yahoo",
        "yahoo.com": "Yahoo",
        "ymail.com": "Yahoo",
        "laposte.net": "La Poste",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "mail.com": "Mail.com",
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
        // "t-online.de": "T-Mobile",
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

        "web.de": "GMX",
        "email.de": "GMX",

        "mail.de": "Mail.de",
        "netcologne.de": "NetCologne",
        "bluewin.ch": "Swisscom",
        "onlinehome.de": "1&1 Ionos",
        "mail.ru": "Mail.ru",
    },

    UK: {
        // UK-specific domains
        "hotmail.co.uk": "Microsoft",
        "live.co.uk": "Microsoft",
        "outlook.co.uk": "Microsoft",
        "hotmail.com": "Microsoft",
        "live.com": "Microsoft",
        "outlook.com": "Microsoft",
        "msn.com": "Microsoft",

        "gmail.com": "Gmail",
        "googlemail.com": "Gmail",

        "btinternet.com": "BT",
        "btopenworld.com": "BT",
        "bt.com": "BT",

        "sky.com": "Sky",
        "virgin.net": "Virgin Media",
        "virginmedia.com": "Virgin Media",
        "ntlworld.com": "Virgin Media",

        "yahoo.co.uk": "Yahoo",
        "yahoo.com": "Yahoo",

        "icloud.com": "Apple",
        "me.com": "Apple",
        "mac.com": "Apple",

        "mail.com": "Mail.com",
    }
};

const COUNTRY_CLUSTER_PRIORITIES: { [country: string]: string[] } = {
    NL: [
        "Microsoft", "Gmail", "KPN", "Ziggo/UPC", "Telenet", "Skynet/Proximus", "Yahoo", "Apple", "Pandora",
        "ZeelandNet", "Caiway", "Online.nl", "Telfort", "Scarlet", "Solcon", "WXS", "HCCnet", "OnsBrabantNet",
        "Mail.com", "Versatel", "Others"
    ],
    DE: [
        "Microsoft", "Google", "Apple", "Telekom", "Yahoo", "Vodafone", "AOL", "GMX", "Web.de",
        "Mail.de", "NetCologne", "Swisscom", "1&1 Ionos", "Mail.ru", "Others"
    ],

    DK: [
        "Microsoft", "Gmail", "Telenet", "Skynet/Proximus", "Pandora",
        "Scarlet", "Belgacom", "Yahoo", "Apple", "Mail.com", "Others"
    ],

    FR: [
        "Microsoft", "Gmail", "Orange", "Free", "SFR", "Yahoo",
        "La Poste", "Apple", "Mail.com", "Others"
    ],



    UK: [
        "Microsoft", "Gmail", "BT", "Sky", "Virgin Media", "Yahoo",
        "Apple", "Mail.com", "Others"
    ]
};

const COUNTRY_DOMAIN_ORDERS: { [country: string]: string[] } = {
    NL: [
        // Microsoft Cluster domains
        "hotmail.com", "hotmail.nl", "live.com", "live.nl", "outlook.com", "outlook.nl", "msn.com", "msn.nl", "windowslive.com", "hotmail.be",
        "live.be", "outlook.be",
        // Gmail Cluster domains
        "gmail.com", "googlemail.com",
        // KPN Cluster domains
        "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl", "surfmail.nl",
        "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",

        // Ziggo Cluster domains
        "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
        // Telenet Cluster domains
        "telenet.be",
        // Skynet Cluster domains
        "skynet.be", "proximus.be",
        // Yahoo cluster
        "yahoo.com", "yahoo.fr", "ymail.com", "laposte.net", "icloud.com", "me.com", "mac.com", "pandora.be", "zeelandnet.nl",
        "caiway.nl", "kabelfoon.nl", "online.nl", "scarlet.be", "solcon.nl", "wxs.nl", "hccnet.nl", "onsbrabantnet.nl",
        "mail.com", "versatel.nl",
        // UPC Cluster domains
        "upc.nl", "upcmail.nl", "belgacom.net",
        // Other high volume domains
        "yahoo.nl", "aol.com", "comcast.net", "verizon.net",
        "wxs.nl", "hccnet.nl", "onsbrabantnet.nl", "versatel.nl", "mail.com"
    ],

    DK: [
        "hotmail.be", "live.be", "outlook.be", "hotmail.com", "live.com",
        "outlook.com", "msn.com", "gmail.com", "googlemail.com", "telenet.be",
        "skynet.be", "proximus.be", "pandora.be", "scarlet.be", "belgacom.net",
        "yahoo.com", "yahoo.fr", "ymail.com", "laposte.net", "icloud.com",
        "me.com", "mac.com", "mail.com"
    ],

    FR: [
        "hotmail.fr", "live.fr", "outlook.fr", "hotmail.com", "live.com",
        "outlook.com", "msn.com", "gmail.com", "googlemail.com", "orange.fr",
        "wanadoo.fr", "voila.fr", "free.fr", "sfr.fr", "neuf.fr", "cegetel.net",
        "yahoo.fr", "yahoo.com", "ymail.com", "laposte.net", "icloud.com",
        "me.com", "mac.com", "mail.com"
    ],

    DE: [
        "hotmail.com", "hotmail.de", "live.com", "live.de", "msn.com", "outlook.com", "outlook.de",
        "gmail.com", "googlemail.com", "icloud.com", "mac.com", "me.com", "t-online.de", "yahoo.com",
        "yahoo.de", "yahoo.fr", "ymail.com", "arcor.de", "vodafone.de", "aol.com", "aol.de",
        "gmx.at", "gmx.de", "gmx.net", "email.de", "web.de", "mail.de", "netcologne.de", "bluewin.ch",
        "onlinehome.de", "mail.ru"
    ],

    UK: [
        "hotmail.co.uk", "live.co.uk", "outlook.co.uk", "hotmail.com",
        "live.com", "outlook.com", "msn.com", "gmail.com", "googlemail.com",
        "btinternet.com", "btopenworld.com", "bt.com", "sky.com", "virgin.net",
        "virginmedia.com", "ntlworld.com", "yahoo.co.uk", "yahoo.com",
        "icloud.com", "me.com", "mac.com", "mail.com"
    ]
};
const FIXED_DOMAINS_ORDER = [
    // Microsoft Cluster domains
    "hotmail.com", "hotmail.nl", "live.com", "live.nl", "outlook.com", "outlook.nl", "msn.com", "msn.nl", "windowslive.com", "hotmail.be",
    "live.be", "outlook.be",
    // Gmail Cluster domains
    "gmail.com", "googlemail.com",
    // KPN Cluster domains
    "kpnmail.nl", "planet.nl", "hetnet.nl", "freeler.nl", "xs4all.nl", "surfmail.nl",
    "kpnplanet.nl", "telfort.nl", "tiscali.nl", "12move.nl",

    // Ziggo Cluster domains
    "ziggo.nl", "casema.nl", "chello.nl", "home.nl", "quicknet.nl", "upcmail.nl",
    // Telenet Cluster domains
    "telenet.be",
    // Skynet Cluster domains
    "skynet.be", "proximus.be",
    // Yahoo cluster
    "yahoo.com", "yahoo.fr", "ymail.com", "laposte.net", "icloud.com", "me.com", "mac.com", "pandora.be", "zeelandnet.nl",
    "caiway.nl", "kabelfoon.nl", "online.nl", "scarlet.be", "solcon.nl", "wxs.nl", "hccnet.nl", "onsbrabantnet.nl",
    "mail.com", "versatel.nl",
    // UPC Cluster domains
    "upc.nl", "upcmail.nl", "belgacom.net",
    // Other high volume domains
    "yahoo.nl", "aol.com", "comcast.net", "verizon.net",
];

const CampaignDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const dataParam = searchParams.get("data");
    const country = searchParams.get("country");
    let campaignData = null;
    const [clusterAnalysis, setClusterAnalysis] = useState<DomainAnalysis[]>([]);
    const [performanceBasedData, setPerformanceBasedData] = useState<DomainAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showClusterView, setShowClusterView] = useState(true); // Toggle state
    const [clusterSummary, setClusterSummary] = useState<SummaryTotals | null>(null);
    const [domainSummary, setDomainSummary] = useState<SummaryTotals | null>(null);

    if (dataParam) {
        try {
            // Decode the URL-encoded JSON and parse it
            const decodedData = decodeURIComponent(dataParam);
            campaignData = JSON.parse(decodedData);
            console.log("Parsed campaign data:", campaignData);
        } catch (error) {
            console.error("Error parsing campaign data:", error);
        }
    }

    // Extract individual values from the parsed data
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
        { headerName: "Sent", field: "sent", width: 100, },
        { headerName: "Hard Bounces", field: "hardBounce", width: 120, },
        { headerName: "Soft Bounces", field: "softBounce", width: 120, },
        { headerName: "Unsubscribes", field: "unsubscribes", width: 120, },
        { headerName: "Complaints", field: "complaints", width: 120, },
        { headerName: "Unique Opens", field: "uniqueOpeners", width: 130, },
        { headerName: "% Unique Opens", field: "uniqueOpenRate", width: 120, },
        { headerName: "Total Clicks", field: "totalClicks", width: 120, },
        { headerName: "Unique Clickers", field: "uniqueClickers", width: 140, },
        { headerName: "% Total Clicks", field: "totalClickRate", width: 130, },
        { headerName: "% Unique Clickers", field: "uniqueClickRate", width: 140, },
    ];

    const extractDomain = (email: string): string => {
        return email.split('@')[1] || '';
    };

    // Helper function to get cluster name for a domain
    // const getClusterName = (domain: string): string => {
    //     return DOMAIN_CLUSTER_MAP[domain.toLowerCase()] || 'Others';
    // };
    const getClusterName = (domain: string, country: string): string => {
        const countryMapping = COUNTRY_DOMAIN_CLUSTERS[country];
        if (!countryMapping) {
            // Fallback to global mapping if country not found
            return DOMAIN_CLUSTER_MAP[domain.toLowerCase()] || 'Others';
        }
        return countryMapping[domain.toLowerCase()] || 'Others';
    };

    // Helper function to calculate percentage
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
            acc.totalHardBounces += item.hardBounces;
            acc.totalSoftBounces += item.softBounces;
            acc.totalUniqueOpens += item.uniqueOpens;
            acc.totalUniqueClickers += item.uniqueClickers;
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

    // const getDomainPriority = (domain: string): number => {
    //     const index = FIXED_DOMAINS_ORDER.indexOf(domain.toLowerCase());
    //     return index !== -1 ? index : FIXED_DOMAINS_ORDER.length;
    // };

    // Cluster priority order based on Excel sheet
    const CLUSTER_PRIORITY = [
        "Microsoft", "Gmail", "KPN", "Ziggo/UPC", "Telenet", "Skynet/Proximus", "Yahoo", "Apple", "Pandora",
        "ZeelandNet", "Caiway", "Online.nl",
        "Telfort", "Scarlet", "Solcon", "WXS", "HCCnet", "OnsBrabantNet",
        "Mail.com", "Versatel", "Others"
    ];

    // const getClusterPriority = (cluster: string): number => {
    //     const index = CLUSTER_PRIORITY.indexOf(cluster);
    //     return index !== -1 ? index : CLUSTER_PRIORITY.length;
    // };
    const getClusterPriority = (cluster: string, country: string): number => {
        const countryPriorities = COUNTRY_CLUSTER_PRIORITIES[country];
        if (!countryPriorities) {
            // Fallback to global priorities
            const index = CLUSTER_PRIORITY.indexOf(cluster);
            return index !== -1 ? index : CLUSTER_PRIORITY.length;
        }
        const index = countryPriorities.indexOf(cluster);
        return index !== -1 ? index : countryPriorities.length;
    };

    const getDomainPriority = (domain: string, country: string): number => {
        const countryOrder = COUNTRY_DOMAIN_ORDERS[country];
        if (!countryOrder) {
            // Fallback to global order
            const index = FIXED_DOMAINS_ORDER.indexOf(domain.toLowerCase());
            return index !== -1 ? index : FIXED_DOMAINS_ORDER.length;
        }
        const index = countryOrder.indexOf(domain.toLowerCase());
        return index !== -1 ? index : countryOrder.length;
    };

    const analyzeClusterData = (records: EmailRecord[], country: string): DomainAnalysis[] => {
        const clusterMap = new Map<string, {
            totalEmails: number;
            hardBounces: number;
            softBounces: number;
            bounces: number;
            uniqueOpens: number;
            uniqueClickers: number;
            totalClicks: number;
            sent: number;
        }>();

        // Process each email record and group by cluster
        records.forEach(record => {
            const domain = extractDomain(record.email);
            const cluster = getClusterName(domain, country); // Pass country parameter

            if (!clusterMap.has(cluster)) {
                clusterMap.set(cluster, {
                    totalEmails: 0,
                    hardBounces: 0,
                    softBounces: 0,
                    bounces: 0,
                    uniqueOpens: 0,
                    uniqueClickers: 0,
                    totalClicks: 0,
                    sent: 0
                });
            }

            const clusterData = clusterMap.get(cluster)!;
            clusterData.totalEmails++;
            if (record.hardBounce) clusterData.hardBounces++;
            if (record.softBounce) clusterData.softBounces++;
            if (record.uniqueOpen) clusterData.uniqueOpens++;
            if (record.uniqueClicker) clusterData.uniqueClickers++;
            if (record.sent) clusterData.sent++;
            clusterData.totalClicks += record.totalClicks;
        });

        const clusterAnalysisArray = Array.from(clusterMap.entries()).map(([cluster, stats]) => {
            const bounces = stats.hardBounces + stats.softBounces;
            const performanceScore = calculatePerformanceScore(stats);

            return {
                domain: cluster,
                cluster: cluster,
                totalEmails: stats.totalEmails,
                sent: stats.sent,
                bounces: bounces,
                hardBounces: stats.hardBounces,
                softBounces: stats.softBounces,
                uniqueOpens: stats.uniqueOpens,
                uniqueClickers: stats.uniqueClickers,
                totalClicks: stats.totalClicks,
                hardBounceRate: calculatePercentage(stats.hardBounces, stats.sent),
                softBounceRate: calculatePercentage(stats.softBounces, stats.sent),
                uniqueOpenRate: calculatePercentage(stats.uniqueOpens, stats.sent),
                uniqueClickRate: calculatePercentage(stats.uniqueClickers, stats.sent),
                totalClickRate: calculatePercentage(stats.totalClicks, stats.sent),
                performanceScore: performanceScore
            };
        });

        // Sort by country-specific cluster priority
        return clusterAnalysisArray.sort((a, b) => {
            const priorityA = getClusterPriority(a.cluster, country);
            const priorityB = getClusterPriority(b.cluster, country);
            return priorityA - priorityB;
        });
    };

    // const analyzeDomainData = (records: EmailRecord[]): DomainAnalysis[] => {
    //     const domainMap = new Map<string, {
    //         totalEmails: number;
    //         hardBounces: number;
    //         softBounces: number;
    //         bounces: number;
    //         uniqueOpens: number;
    //         uniqueClickers: number;
    //         totalClicks: number;
    //         sent: number;
    //     }>();

    //     // Process each email record
    //     records.forEach(record => {
    //         const domain = extractDomain(record.email);

    //         if (!domainMap.has(domain)) {
    //             domainMap.set(domain, {
    //                 totalEmails: 0,
    //                 hardBounces: 0,
    //                 softBounces: 0,
    //                 bounces: 0,
    //                 uniqueOpens: 0,
    //                 uniqueClickers: 0,
    //                 totalClicks: 0,
    //                 sent: 0
    //             });
    //         }

    //         const domainData = domainMap.get(domain)!;
    //         // Count totals
    //         domainData.totalEmails++;
    //         // Count based on boolean values
    //         if (record.hardBounce) domainData.hardBounces++;
    //         if (record.softBounce) domainData.softBounces++;
    //         if (record.uniqueOpen) domainData.uniqueOpens++;
    //         if (record.uniqueClicker) domainData.uniqueClickers++;
    //         if (record.sent) domainData.sent++;
    //         domainData.totalClicks += record.totalClicks;
    //     });

    //     const domainAnalysisArray = Array.from(domainMap.entries()).map(([domain, stats]) => {
    //         const bounces = stats.hardBounces + stats.softBounces;
    //         const performanceScore = calculatePerformanceScore(stats);
    //         const clusterName = getClusterName(domain);

    //         return {
    //             domain,
    //             cluster: clusterName,
    //             totalEmails: stats.totalEmails,
    //             sent: stats.sent,
    //             bounces: bounces,
    //             hardBounces: stats.hardBounces,
    //             softBounces: stats.softBounces,
    //             uniqueOpens: stats.uniqueOpens,
    //             uniqueClickers: stats.uniqueClickers,
    //             totalClicks: stats.totalClicks,
    //             hardBounceRate: calculatePercentage(stats.hardBounces, stats.sent),
    //             softBounceRate: calculatePercentage(stats.softBounces, stats.sent),
    //             uniqueOpenRate: calculatePercentage(stats.uniqueOpens, stats.sent),
    //             uniqueClickRate: calculatePercentage(stats.uniqueClickers, stats.sent),
    //             totalClickRate: calculatePercentage(stats.totalClicks, stats.sent),
    //             performanceScore: performanceScore
    //         };
    //     });

    //     // Sort by performance (unique opens) for second table
    //     return domainAnalysisArray.sort((a, b) => b.uniqueOpens - a.uniqueOpens);
    // };
    const analyzeDomainData = (records: EmailRecord[], country: string): DomainAnalysis[] => {
        const domainMap = new Map<string, {
            totalEmails: number;
            hardBounces: number;
            softBounces: number;
            bounces: number;
            uniqueOpens: number;
            uniqueClickers: number;
            totalClicks: number;
            sent: number;
        }>();

        records.forEach(record => {
            const domain = extractDomain(record.email);

            if (!domainMap.has(domain)) {
                domainMap.set(domain, {
                    totalEmails: 0,
                    hardBounces: 0,
                    softBounces: 0,
                    bounces: 0,
                    uniqueOpens: 0,
                    uniqueClickers: 0,
                    totalClicks: 0,
                    sent: 0
                });
            }

            const domainData = domainMap.get(domain)!;
            domainData.totalEmails++;
            if (record.hardBounce) domainData.hardBounces++;
            if (record.softBounce) domainData.softBounces++;
            if (record.uniqueOpen) domainData.uniqueOpens++;
            if (record.uniqueClicker) domainData.uniqueClickers++;
            if (record.sent) domainData.sent++;
            domainData.totalClicks += record.totalClicks;
        });

        const domainAnalysisArray = Array.from(domainMap.entries()).map(([domain, stats]) => {
            const bounces = stats.hardBounces + stats.softBounces;
            const performanceScore = calculatePerformanceScore(stats);
            const clusterName = getClusterName(domain, country); // Pass country parameter

            return {
                domain,
                cluster: clusterName,
                totalEmails: stats.totalEmails,
                sent: stats.sent,
                bounces: bounces,
                hardBounces: stats.hardBounces,
                softBounces: stats.softBounces,
                uniqueOpens: stats.uniqueOpens,
                uniqueClickers: stats.uniqueClickers,
                totalClicks: stats.totalClicks,
                hardBounceRate: calculatePercentage(stats.hardBounces, stats.sent),
                softBounceRate: calculatePercentage(stats.softBounces, stats.sent),
                uniqueOpenRate: calculatePercentage(stats.uniqueOpens, stats.sent),
                uniqueClickRate: calculatePercentage(stats.uniqueClickers, stats.sent),
                totalClickRate: calculatePercentage(stats.totalClicks, stats.sent),
                performanceScore: performanceScore
            };
        });
        // For domain view, you can choose to sort by performance or by country-specific domain order
        // Option 1: Sort by performance (current behavior)
        return domainAnalysisArray.sort((a, b) => b.uniqueOpens - a.uniqueOpens);

        // Option 2: Sort by country-specific domain order (uncomment if preferred)
        // return domainAnalysisArray.sort((a, b) => {
        //   const priorityA = getDomainPriority(a.domain, country);
        //   const priorityB = getDomainPriority(b.domain, country);
        //   return priorityA - priorityB;
        // });
    };

    const clusterColumnDefs: ColDef[] = [
        {
            headerName: "Cluster", field: "domain", width: 150, minWidth: 130,
            tooltipField: "domain", headerTooltip: "Email Domain Cluster"
        },
        {
            headerName: "Sent", field: "sent", width: 130,
            tooltipField: "sent", headerTooltip: "Sent",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "Hard Bounces", field: "hardBounces", width: 130,
            headerTooltip: "Hard Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "Soft Bounces", field: "softBounces", width: 130,
            headerTooltip: "Soft Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "Unique Opens", field: "uniqueOpens", width: 140,
            headerTooltip: "Unique Opens",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "% Unique Opens", field: "uniqueOpenRate", width: 140,
            headerTooltip: "% Unique Opens /Sent",
        },
        {
            headerName: "Total Clicks", field: "totalClicks", width: 140,
            headerTooltip: "Total Clicks",
            valueFormatter: (params) => Number(params.value).toLocaleString()
        },

        {
            headerName: "Unique Clickers", field: "uniqueClickers", width: 140,
            headerTooltip: "Unique Clickers",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "% Total Clicks / Sent", field: "totalClickRate", width: 140,
            headerTooltip: "% Total Clicks/ Sent",
        },
        {
            headerName: "% Unique Clickers / Sent", field: "uniqueClickRate", width: 150,
            headerTooltip: "% Unique Clickers/ Sent",
        },
    ];

    const domainColumnDefs: ColDef[] = [
        {
            headerName: "Domain", field: "domain", width: 150,
            tooltipField: "domain", headerTooltip: "Email Domain"
        },
        {
            headerName: "Sent", field: "sent", width: 140,
            tooltipField: "sent", headerTooltip: "Sent"
        },
        {
            headerName: "Hard Bounces", field: "hardBounces", width: 140,
            headerTooltip: "Hard Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "Soft Bounces", field: "softBounces", width: 130,
            headerTooltip: "Soft Bounces",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "Unique Opens", field: "uniqueOpens", width: 130,
            headerTooltip: "Unique Opens",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "% Unique Opens", field: "uniqueOpenRate", width: 130,
            headerTooltip: "% Unique Opens /Sent",
        },
        {
            headerName: "Total Clicks", field: "totalClicks", width: 140,
            headerTooltip: "Total Clicks",
            valueFormatter: (params) => Number(params.value).toLocaleString()
        },

        {
            headerName: "Unique Clickers", field: "uniqueClickers", width: 140,
            headerTooltip: "Unique Clickers",
            valueFormatter: (params) => Number(params.value).toLocaleString(),
        },
        {
            headerName: "% Total Clicks / Sent", field: "totalClickRate", width: 140,
            headerTooltip: "% Total Clicks/ Sent",
        },
        {
            headerName: "% Unique Clickers / Sent", field: "uniqueClickRate", width: 140,
            headerTooltip: "% Unique Clickers/ Sent",
        },
    ];

    // Function to fetch data from API
    useEffect(() => {
        const fetchCampaignData = async () => {
            try {
                setLoading(true);
                const response = await axios.post('/api/mailcamp/fetch-user-data-id',
                    { id }
                );

                // const clusterStats = analyzeClusterData(response.data);
                // const domainStats = analyzeDomainData(response.data);
                const clusterStats = analyzeClusterData(response.data, country || 'NL'); // Default to NL if no country
                const domainStats = analyzeDomainData(response.data, country || 'NL');
                setClusterAnalysis(clusterStats);
                setPerformanceBasedData(domainStats);
                setClusterSummary(calculateSummaryTotals(clusterStats));
                setDomainSummary(calculateSummaryTotals(domainStats));
            } catch (err: any) {
                // setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignData();
    }, [id,country]);

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
                                        {country}
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
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                                </div>
                                <p className="mt-4 text-gray-600 font-medium">Loading campaign data...</p>
                                <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your campaign details</p>
                            </div>
                        ) : (
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
                                            wrapHeaderText: true, // <-- enable this
                                            autoHeaderHeight: true, // <-- enable this
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
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowClusterView(!showClusterView)}
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
                            {showClusterView ? `📧 Domain Analysis By Fixed Domains for ${country}` : `🌐 Domain Analysis Performance Wise for ${country}`}
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
                                    <AgGridReact
                                        rowData={showClusterView ? clusterAnalysis : performanceBasedData}
                                        columnDefs={showClusterView ? clusterColumnDefs : domainColumnDefs}
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
                                            wrapHeaderText: true, // <-- enable this
                                            autoHeaderHeight: true, // <-- enable this
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
                        )}
                    </div>

                </div>
            </div>
            <div className="mt-4 px-28 ">
                {/* Summary Cards */}
                {!loading && !error && (
                    <>
                        {showClusterView && clusterSummary && (
                            <SummaryCard summary={clusterSummary} title="Cluster Analysis" />
                        )}
                        {!showClusterView && domainSummary && (
                            <SummaryCard summary={domainSummary} title="Domain Analysis" />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CampaignDetail;