import { create } from "zustand";

export type TrafficForm = {
  state_code: string;
  region_code: string;
  district_code: string;
  municipality_code: string;
  timestamp: string; // YYYY-MM-DDTHH:mm (local)
  setForm: (p: Partial<TrafficForm>) => void;
  reset: () => void;
};

export const useTrafficForm = create<TrafficForm>((set) => ({
  state_code: "",
  region_code: "",
  district_code: "",
  municipality_code: "",
  timestamp: "",
  setForm: (p) => set((s) => ({ ...s, ...p })),
  reset: () =>
    set({
      state_code: "",
      region_code: "",
      district_code: "",
      municipality_code: "",
      timestamp: ""
    })
}));


