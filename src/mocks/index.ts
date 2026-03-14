import { setupMockApi } from "./mockApi";

export function setupMocksIfEnabled() {
  const enabled = import.meta.env.VITE_ENABLE_MOCKS === "true";
  if (enabled) setupMockApi();
}
