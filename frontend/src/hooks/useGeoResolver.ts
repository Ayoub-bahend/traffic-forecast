import { useCallback, useRef, useState } from "react";
import { resolveAGS } from "@services/geo";

export type GeoCodes = {
  ags: string;
  state_code: string;
  region_code: string;
  district_code: string;
  municipality_code: string;
  displayName?: string;
};

export function useGeoResolver() {
  const aborterRef = useRef<AbortController | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const cancel = useCallback(() => {
    aborterRef.current?.abort();
    aborterRef.current = null;
  }, []);

  const resolve = useCallback(async (lat: number, lng: number): Promise<GeoCodes> => {
    cancel();
    const ac = new AbortController();
    aborterRef.current = ac;
    setIsResolving(true);
    try {
      const res = await resolveAGS(lat, lng, ac.signal);
      // New backend returns explicit codes and municipality_code = full AGS.
      // Back-compat: if only ags is present, derive.
      const hasExplicit =
        typeof res?.state_code === "string" &&
        typeof res?.region_code === "string" &&
        typeof res?.district_code === "string" &&
        typeof res?.municipality_code === "string";

      let ags: string;
      let state_code: string;
      let region_code: string;
      let district_code: string;
      let municipality_code: string;

      if (hasExplicit) {
        // municipality_code is full AGS (8 digits) per requirement
        ags = String(res.municipality_code);
        if (!/^\d{8}$/.test(ags)) {
          throw new Error("Invalid municipality_code/AGS");
        }
        state_code = String(res.state_code);
        region_code = String(res.region_code || "0");
        district_code = String(res.district_code);
        municipality_code = ags.slice(5, 8); // keep GGG for UI display
      } else {
        const agsRaw = res?.ags ?? "";
        if (typeof agsRaw !== "string" || !/^\d{8}$/.test(agsRaw)) {
          throw new Error(res?.error || "Invalid AGS");
        }
        ags = agsRaw;
        state_code = ags.slice(0, 2);
        region_code = ags.slice(2, 3) || "0";
        district_code = ags.slice(3, 5);
        municipality_code = ags.slice(5, 8);
      }
      return {
        ags,
        state_code,
        region_code: region_code === "" ? "0" : region_code,
        district_code,
        municipality_code,
        displayName: res.name
      };
    } finally {
      setIsResolving(false);
    }
  }, [cancel]);

  return { resolve, cancel, isResolving };
}


