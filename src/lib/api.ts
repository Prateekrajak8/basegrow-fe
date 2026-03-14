import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

export type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await api.post("/login", payload);
  return response.data;
}

export async function fetchMe() {
  const response = await api.get("/me");
  return response.data;
}
