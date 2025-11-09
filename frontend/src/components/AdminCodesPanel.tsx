import React from "react";
import { useTrafficForm } from "../stores/trafficForm";

export default function AdminCodesPanel(): JSX.Element {
  const { state_code, region_code, district_code, municipality_code, timestamp, setForm } =
    useTrafficForm();

  return (
    <div className="space-y-3">
      <div className="rounded border bg-gray-50 p-3">
        <div className="font-medium text-gray-700">Administrative Codes</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">State</div>
            <div className="font-mono">{state_code || <span className="text-gray-400">—</span>}</div>
          </div>
          <div>
            <div className="text-gray-500">Region</div>
            <div className="font-mono">{region_code || <span className="text-gray-400">—</span>}</div>
          </div>
          <div>
            <div className="text-gray-500">District</div>
            <div className="font-mono">
              {district_code || <span className="text-gray-400">—</span>}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Municipality</div>
            <div className="font-mono">
              {municipality_code || <span className="text-gray-400">—</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Date & Time</label>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setForm({ timestamp: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500">Used for prediction request.</p>
      </div>
    </div>
  );
}


