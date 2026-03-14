// utils/getOngageToken.ts
let cachedToken: string | null = null;
let tokenExpirationTime: number | null = null; // Store expiration time

export const getOngageToken = async (): Promise<string | null> => {
  if (cachedToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    console.log("Using cached token");
    return cachedToken; // Return cached token if still valid
  }

  console.log("Fetching a new token...");
  try {
    const response = await fetch("https://api.ongage.net/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: import.meta.env.VITE_ONGAGE_USERNAME || "mock-user",
        password: import.meta.env.VITE_ONGAGE_PASSWORD || "mock-pass",
        account_code: import.meta.env.VITE_ONGAGE_ACCOUNT_CODE || "mock-account",
      }),
    });

    const result = await response.json();

    if (result.token) {
      cachedToken = result.token;
      tokenExpirationTime = Date.now() + 24 * 60 * 60 * 1000; // Assume 24-hour validity
      return cachedToken;
    } else {
      console.log("Failed to get token:", result);
      return null;
    }
  } catch (error) {
    console.log("Error fetching token:", error);
    return null;
  }
};
