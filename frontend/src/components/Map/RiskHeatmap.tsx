import React, { useMemo } from "react";
import { CircleMarker, LayerGroup, Tooltip } from "react-leaflet";

type Props = {
  geojson: any | null; // FeatureCollection of Points with properties.risk
};

function colorForRisk(risk: number): string {
  if (risk >= 70) return "#dc2626"; // red-600
  if (risk >= 40) return "#f59e0b"; // amber-500
  return "#22c55e"; // green-500
}

export default function RiskHeatmap({ geojson }: Props): JSX.Element | null {
  const points = useMemo(() => {
    if (!geojson?.features) return [];
    return geojson.features
      .filter((f: any) => f.geometry?.type === "Point")
      .map((f: any, idx: number) => {
        const [lng, lat] = f.geometry.coordinates;
        const risk = Number(f.properties?.risk ?? 0);
        const temp = f.properties?.temperature;
        const prcp = f.properties?.precipitation;
        return { id: idx, lat, lng, risk, temp, prcp };
      });
  }, [geojson]);

  if (!points.length) return null;

  return (
    <LayerGroup>
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={{ lat: p.lat, lng: p.lng }}
          radius={Math.max(4, Math.min(12, p.risk / 10))}
          pathOptions={{ color: colorForRisk(p.risk), fillColor: colorForRisk(p.risk), fillOpacity: 0.5 }}
        >
          <Tooltip>
            <div className="text-xs">
              <div>Risk: {p.risk.toFixed(1)}%</div>
              <div>Temp: {p.temp}°C</div>
              <div>Prcp: {p.prcp} mm</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </LayerGroup>
  );
}


