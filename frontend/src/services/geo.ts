export type GeoResolveResponse = {
  name?: string;
  error?: string;
  // New backend response shape:
  state_code?: string;
  region_code?: string;
  district_code?: string;
  municipality_code?: string; // full AGS (8 digits)
  // Back-compat (if any)
  ags?: string;
};

export async function resolveAGS(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<GeoResolveResponse> {
  const q = new URLSearchParams({ lat: String(lat), lng: String(lng) }).toString();
  const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  let normalized = (rawBase || "").replace(/\/+$/, "");
  const candidates: string[] = [];
  // 1) Env-provided base (if any)
  if (normalized) {
    candidates.push(normalized.endsWith("/api") ? normalized : `${normalized}/api`);
  }
  // 2) Same-origin dev server proxy
  candidates.push("/api");
  // 3) Nginx on host (works when hitting the app via 5173 without proxy)
  candidates.push("http://localhost:8080/api");

  let lastErr: any = null;
  for (const base of candidates) {
    try {
      const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
      const url = `${baseUrl}/geo/resolve?${q}`;
      const r = await fetch(url, { signal });
      if (!r.ok) {
        lastErr = new Error(`Geo resolve failed (${r.status})`);
        continue;
      }
      const data = (await r.json()) as GeoResolveResponse;
      if (data?.error) {
        lastErr = new Error(String(data.error));
        continue;
      }
      return data;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error("Geo resolve failed");
}


