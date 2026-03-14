import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

type MockResult = { status: number; data: any };

const nowUnix = Math.floor(Date.now() / 1000);

const countries = [
  { id: "1", name: "All", domain: "All" },
  { id: "2", name: "NL Netherland", domain: "TravelWhale" },
  { id: "3", name: "DE Germany", domain: "TravelWhale" },
  { id: "4", name: "FR France", domain: "TravelWhale" },
  { id: "5", name: "UK England", domain: "TravelWhale" },
  { id: "6", name: "NL Netherland", domain: "FavoTrip" },
];

const esps = [
  { id: "1", name: "Ongage" },
  { id: "2", name: "Mailchimp" },
];

const domains = [
  { id: "1", name: "All" },
  { id: "2", name: "TravelWhale" },
  { id: "3", name: "FavoTrip" },
];

const smtpPayload = [
  { smtp_id: 1001, esp_name_title: "SMTP Alpha" },
  { smtp_id: 1002, esp_name_title: "SMTP Beta" },
];

const listIds = [203540, 217478, 1259703, 1261035, 1260311, 1261054, 242740];

function buildMetricPayload() {
  return listIds.flatMap((listId, idx) => [
    {
      list_id: listId,
      stats_date: nowUnix - idx * 86400,
      sent: 1000 + idx * 120,
      clicks: 130 + idx * 10,
      social_clicks: 45 + idx * 3,
      email_clicks: 80 + idx * 5,
      segment_name: `Segment ${idx + 1}`,
      event_name: `Event ${idx + 1}`,
      event_id: `EVT-${idx + 1}`,
      segment_id: 500 + idx,
      unique_opens: 300 + idx * 12,
      unique_clicks: 95 + idx * 7,
      hard_bounces: 6 + idx,
      soft_bounces: 9 + idx,
      opens: 420 + idx * 15,
      ctr: 12.4,
      uctr: 8.1,
      unsubscribes: 2,
      count: 1,
    },
  ]);
}

const campaignRows = [
  {
    id: 101,
    statId: 9001,
    name: "20260306 NL Morning Campaign",
    sent: 22000,
    hardBounce: 120,
    softBounce: 230,
    uniqueOpeners: 9500,
    totalClicks: 3600,
    uniqueClickers: 2700,
    unsubscribes: 25,
    complaints: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    statId: 9002,
    name: "20260305 DE Promo Campaign",
    sent: 18000,
    hardBounce: 95,
    softBounce: 180,
    uniqueOpeners: 7200,
    totalClicks: 2900,
    uniqueClickers: 2100,
    unsubscribes: 17,
    complaints: 3,
    createdAt: new Date().toISOString(),
  },
];

const emailRows = [
  { email: "john@gmail.com", sent: true, hardBounce: false, softBounce: false, uniqueOpen: true, uniqueClicker: true, totalClicks: 2 },
  { email: "amy@outlook.com", sent: true, hardBounce: false, softBounce: true, uniqueOpen: false, uniqueClicker: false, totalClicks: 0 },
  { email: "mark@yahoo.com", sent: true, hardBounce: false, softBounce: false, uniqueOpen: true, uniqueClicker: false, totalClicks: 1 },
];

const clusterByCampaign = [
  { clusterId: 1, clusterName: "Gmail", sent: 900, uniqueOpen: 430, totalClicks: 180, softBounce: 12, hardBounce: 6, uniqueClicks: 130, uniqueOpens: 430, hardBounces: 6, softBounces: 12 },
  { clusterId: 2, clusterName: "Microsoft", sent: 700, uniqueOpen: 300, totalClicks: 140, softBounce: 11, hardBounce: 5, uniqueClicks: 100, uniqueOpens: 300, hardBounces: 5, softBounces: 11 },
];

const domainByCampaign = [
  { domainName: "gmail.com", domain: "gmail.com", sent: 800, uniqueOpen: 390, totalClicks: 170, softBounce: 10, hardBounce: 4, uniqueClicks: 120, uniqueOpenRate: 48.75, uniqueClicksRate: 15, toalClickRate: 21.25, uniqueOpens: 390, hardBounces: 4, softBounces: 10 },
  { domainName: "outlook.com", domain: "outlook.com", sent: 600, uniqueOpen: 250, totalClicks: 110, softBounce: 8, hardBounce: 3, uniqueClicks: 80, uniqueOpenRate: 41.67, uniqueClicksRate: 13.33, toalClickRate: 18.33, uniqueOpens: 250, hardBounces: 3, softBounces: 8 },
];

function normalizePath(inputUrl: string): string {
  try {
    const withHost = inputUrl.startsWith("http") ? inputUrl : `http://local${inputUrl.startsWith("/") ? "" : "/"}${inputUrl}`;
    return new URL(withHost).pathname;
  } catch {
    return inputUrl;
  }
}

function mockRoute(method: string, rawUrl: string, body: any): MockResult {
  const path = normalizePath(rawUrl);

  if (path === "/api/login" && method === "POST") return { status: 200, data: { token: "mock-jwt-token", user: { id: 1, email: body?.email || "demo@basegrow.com", scope: "internal" } } };
  if (path === "/api/users/set-password" && method === "POST") return { status: 200, data: { message: "Password reset successful (mock)." } };
  if (path === "/api/users/onborad" && method === "POST") return { status: 201, data: { setupLink: "/reset-password?token=mock-token-123", userId: 99 } };

  if (path === "/api/users/get-users" && method === "GET") {
    return { status: 200, data: [
      { id: "1", name: "Admin User", organizationId: 11, organization: { name: "Basegrow" }, UserRole: [{ Role: { name: "Admin" } }] },
      { id: "2", name: "Ops User", organizationId: 12, organization: { name: "Travel Team" }, UserRole: [{ Role: { name: "Manager" } }] },
    ] };
  }

  if (path === "/api/country") return { status: 200, data: countries };
  if (path === "/api/esp") return { status: 200, data: esps };
  if (path === "/api/domain") return { status: 200, data: domains };

  if (path === "/api/ongage/get-esp-connection") return { status: 200, data: { payload: smtpPayload } };

  if (path === "/api/ongage/event-status" || path === "/api/segment-count" || path === "/api/ongage/segement-count") {
    return { status: 200, data: { status: "Active", status_desc: "Active", count: 432, time_to_send_config: { throttling: { hours: 24, throttling_type: "daily" } } } };
  }

  if (["/api/ongage/matrix", "/api/ongage/events", "/api/ongage/segments", "/api/ongage/events-name-data", "/api/ongage/event-date-data"].includes(path)) {
    return { status: 200, data: { payload: buildMetricPayload() } };
  }

  if (path === "/api/isp") {
    return { status: 200, data: { data: [
      { id: 1, name: "All", Domain: { name: "All" } },
      { id: 2, name: "SMTP Alpha", Domain: { name: "TravelWhale" } },
      { id: 3, name: "SMTP Beta", Domain: { name: "FavoTrip" } },
    ] } };
  }

  if (path === "/api/mailcamp/fetch-campaign-data") return { status: 200, data: campaignRows };
  if (path === "/api/mailcamp/fetch-user-data-id") return { status: 200, data: emailRows };
  if (path === "/api/mailcamp/cluster-data-by-campaign") return { status: 200, data: { success: true, data: clusterByCampaign } };
  if (path === "/api/mailcamp/domain-data-by-campaign") return { status: 200, data: { success: true, data: domainByCampaign } };
  if (path === "/api/mailcamp/get-cluster-data") return { status: 200, data: { success: true, data: clusterByCampaign } };

  if (path === "/api/mailcamp/clusters") {
    if (method === "GET") return { status: 200, data: [{ id: 1, name: "Gmail" }, { id: 2, name: "Microsoft" }] };
    return { status: 200, data: clusterByCampaign };
  }

  if (path === "/api/click-stats/get-user-data") return { status: 200, data: [{ id: "1", date: "2026-03-01", link: "https://docs.google.com/spreadsheets/d/mock-sheet-id/edit", sum_total_clicks: 12440 }] };
  if (path === "/api/click-stats/import") return { status: 201, data: { message: "Imported successfully (mock)." } };

  if (path === "/api/import") {
    return { status: 200, data: { success: true, result: { for_org: body?.for_org || "Basegrow", uploaded_by: body?.uploaded_by || "Tester", file_type: "csv", rows_count: 120, sample_data: [{ email: "a@example.com", clicks: 12 }] } } };
  }

  if (path === "/api/spreadsheet-url") return { status: 200, data: { spreadsheetUrl: "https://docs.google.com/spreadsheets/d/mock-sheet-id/edit" } };

  if (path === "/api/sheet-data") {
    return { status: 200, data: { data: [
      ["2026-03-01", "https://basegrow.com/a", "120"],
      ["2026-03-02", "https://basegrow.com/b", "98"],
      ["2026-03-03", "https://basegrow.com/c", "145"],
    ] } };
  }

  if (path === "/api/addIsp") return { status: 200, data: { message: "ISP saved (mock)" } };

  return { status: 200, data: { success: true, message: `Mock response for ${path}` } };
}

function parseBody(body: unknown): any {
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return body; }
  }
  return body;
}

function createFetchResponse(status: number, data: any): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function shouldMockUrl(rawUrl: string): boolean {
  const path = normalizePath(rawUrl);
  return path.startsWith("/api/") || path.startsWith("/api/");
}

export function setupMockApi() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!shouldMockUrl(url)) return originalFetch(input, init);

    const method = (init?.method || "GET").toUpperCase();
    const body = parseBody(init?.body as unknown);
    const result = mockRoute(method, url, body);
    return createFetchResponse(result.status, result.data);
  };

  axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const url = config.url || "";
    if (!shouldMockUrl(url)) return config;

    const method = (config.method || "get").toUpperCase();
    const body = parseBody(config.data);
    const result = mockRoute(method, url, body);

    const adapter = async (_cfg: AxiosRequestConfig): Promise<AxiosResponse> => ({
      data: result.data,
      status: result.status,
      statusText: "OK",
      headers: {},
      config: config as any,
    });

    config.adapter = adapter;
    return config;
  });
}
