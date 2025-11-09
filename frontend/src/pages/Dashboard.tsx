import React, { useMemo, useState } from "react";
import Map from "@components/Map/Map";
import AdminCodesPanel from "@components/AdminCodesPanel";
import { useTrafficForm } from "../stores/trafficForm";
import { predictTraffic } from "@services/api";

type PredictionResult = {
  prediction: string;
  confidence?: number;
  [key: string]: unknown;
};

export default function Dashboard(): JSX.Element {
  const form = useTrafficForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.state_code &&
        (form.region_code || form.region_code === "0") &&
        form.district_code &&
        form.municipality_code &&
        form.timestamp
    );
  }, [form]);

  async function onPredict() {
    if (!canSubmit) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await predictTraffic({
        state_code: form.state_code,
        region_code: form.region_code || "0",
        district_code: form.district_code,
        municipality_code: form.municipality_code,
        timestamp: form.timestamp
      });
      setResult(data);
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
          </div>
        </div>
      </section>

      {result && (
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Prediction Result</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Predicted Level</div>
              <div className="mt-1 text-2xl font-semibold">
                {String(result.prediction)}
              </div>
            </div>
            <div className="rounded border bg-gray-50 p-3">
              <div className="text-gray-500">Confidence</div>
              <div className="mt-1 font-medium">{String(result.confidence ?? "—")}</div>
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


