import React, { useMemo, useState } from "react";
import Map from "@components/Map/Map";
import AdminCodesPanel from "@components/AdminCodesPanel";
import { useTrafficForm } from "../stores/trafficForm";
import { predictTrafficExtended } from "@services/api";

type ExtendedResult = {
  accident_count: number;
  temperature: number;
  precipitation: number;
  risk_percentage: number;
  congestion_level: string;
  avg_speed_reduction: number;
  visibility: string;
};

export default function Dashboard(): JSX.Element {
  const form = useTrafficForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTimestampWithin72h = useMemo(() => {
    if (!form.timestamp) return false;
    const t = new Date(form.timestamp);
    if (isNaN(t.getTime())) return false;
    const diffMs = t.getTime() - Date.now();
    return diffMs >= 0 && diffMs <= 72 * 60 * 60 * 1000;
  }, [form.timestamp]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.state_code &&
        (form.region_code || form.region_code === "0") &&
        form.district_code &&
        form.municipality_code &&
        form.timestamp &&
        isTimestampWithin72h
    );
  }, [form, isTimestampWithin72h]);

  async function onPredict() {
    if (!canSubmit) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await predictTrafficExtended({
        state_code: form.state_code,
        region_code: form.region_code || "0",
        district_code: form.district_code,
        municipality_code: form.municipality_code,
        timestamp: form.timestamp
      });
      setResult({
        accident_count: Number(data.accident_count),
        temperature: Number(data.temperature),
        precipitation: Number(data.precipitation),
        risk_percentage: Number(data.risk_percentage),
        congestion_level: String(data.congestion_level),
        avg_speed_reduction: Number(data.avg_speed_reduction),
        visibility: String(data.visibility)
      });
    } catch (e) {
      setError("Failed to fetch prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-white p-4">
          <Map />
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Selection</h2>
          <div className="space-y-3 text-sm">
            <AdminCodesPanel />
            <button
              type="button"
              disabled={!canSubmit || isLoading}
              onClick={onPredict}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isLoading ? "Predicting..." : "Predict Traffic"}
            </button>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Risk legend */}
            <div className="mt-3 rounded border bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-700">Risk legend</div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Low (&lt; 40%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> Medium (40–70%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-600" /> High (&ge; 70%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result && (
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Risk & Traffic Metrics</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Accident count</div>
              <div className="mt-1 text-2xl font-semibold">{result.accident_count.toFixed(2)}</div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Temperature</div>
              <div className="mt-1 text-2xl font-semibold">{result.temperature.toFixed(1)} °C</div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Precipitation</div>
              <div className="mt-1 text-2xl font-semibold">{result.precipitation.toFixed(1)} mm</div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Risk</div>
              <div className="mt-1 text-2xl font-semibold">{result.risk_percentage.toFixed(1)}%</div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Congestion level</div>
              <div className="mt-1 text-2xl font-semibold capitalize">
                {result.congestion_level}
              </div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Avg speed reduction</div>
              <div className="mt-1 text-2xl font-semibold">
                {result.avg_speed_reduction.toFixed(1)}%
              </div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Visibility</div>
              <div className="mt-1 text-2xl font-semibold capitalize">{result.visibility}</div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Timestamp</div>
              <div className="mt-1 font-medium">{form.timestamp || "—"}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


