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
      const ags = String(res.ags ?? "").padStart(8, "0");
      if (!/^\d{8}$/.test(ags)) {
        throw new Error("Invalid AGS");
      }
      const state_code = ags.slice(0, 2);
      const region_code = ags.slice(2, 3) || "0";
      const district_code = ags.slice(3, 5);
      const municipality_code = ags.slice(5, 8);
      return {
        ags,
        state_code,
        region_code: region_code === "" ? "0" : region_code,
        district_code,
        municipality_code,
        displayName: res.displayName
      };
    } finally {
      setIsResolving(false);
    }
  }, [cancel]);

  return { resolve, cancel, isResolving };
}


