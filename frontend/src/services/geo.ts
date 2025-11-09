export type GeoResolveResponse = {
  ags: string;
  displayName?: string;
};

export async function resolveAGS(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<GeoResolveResponse> {
  const q = new URLSearchParams({ lat: String(lat), lng: String(lng) }).toString();
  const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  let apiBase = rawBase ?? "";
  if (apiBase.endsWith("/")) apiBase = apiBase.slice(0, -1);
  // Ensure single /api regardless of whether base already includes it
  const baseWithApi = apiBase ? (apiBase.endsWith("/api") ? apiBase : `${apiBase}/api`) : "";
  const url = baseWithApi ? `${baseWithApi}/geo/resolve?${q}` : `/api/geo/resolve?${q}`;
  const r = await fetch(url, { signal });
  if (!r.ok) {
    throw new Error("Geo resolve failed");
  }
  return r.json();
}


