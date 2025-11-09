import React, { useEffect } from "react";
import { useTrafficForm } from "../stores/trafficForm";

export default function AdminCodesPanel(): JSX.Element {
  const { state_code, region_code, district_code, municipality_code, timestamp, setForm } =
    useTrafficForm();

  // Build list of the next 72 hours (hourly slots), starting from the next full hour
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const toIsoMinute = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  const toLabel = (d: Date) =>
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;

  const nextHour = new Date(now.getTime());
  nextHour.setMinutes(0, 0, 0);
  if (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
    nextHour.setHours(nextHour.getHours() + 1);
  }
  const slots = Array.from({ length: 72 }).map((_, i) => {
    const d = new Date(nextHour.getTime() + i * 60 * 60 * 1000);
    return { iso: toIsoMinute(d), label: toLabel(d) };
  });

  // If no timestamp is selected yet, default to the first slot
  useEffect(() => {
    if (!timestamp && slots.length > 0) {
      setForm({ timestamp: slots[0].iso });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <label className="text-sm font-medium text-gray-700">Date & Time (next 72 hours)</label>
        <select
          value={timestamp || (slots[0]?.iso ?? "")}
          onChange={(e) => setForm({ timestamp: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {slots.map((s) => (
            <option key={s.iso} value={s.iso}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Seules les 72 prochaines heures sont proposées.
        </p>
      </div>
    </div>
  );
}


