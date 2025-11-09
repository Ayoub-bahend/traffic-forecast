import axios from "axios";

type PredictPayload = {
  state_code: string; // LL
  region_code: string; // R
  district_code: string; // KK
  municipality_code: string; // GGG
  timestamp: string; // YYYY-MM-DDTHH:mm (local)
};

const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
let apiBase = rawBase ?? "";
if (apiBase.endsWith("/")) apiBase = apiBase.slice(0, -1);
const baseWithApi = apiBase
  ? (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`)
  : "/api";
const api = axios.create({ baseURL: baseWithApi, timeout: 20000 });

export async function predictTraffic(payload: PredictPayload): Promise<any> {
  const { data } = await api.post("/predict", payload);
  return data;
}


