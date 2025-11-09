import React, { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LatLngLiteral } from "leaflet";
import { useGeoResolver } from "../../hooks/useGeoResolver";
import { useTrafficForm } from "../../stores/trafficForm";
import { predictTraffic } from "@services/api";

function ClickHandler({
  onLocationSelected
}: {
  onLocationSelected: (latlng: LatLngLiteral) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng);
    }
  });
  return null;
}

export default function Map(): JSX.Element {
  const [marker, setMarker] = useState<LatLngLiteral | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { resolve, isResolving, cancel } = useGeoResolver();
  const setForm = useTrafficForm((s) => s.setForm);
  const timestamp = useTrafficForm((s) => s.timestamp);

  const mapCenter = useMemo<LatLngLiteral>(() => ({ lat: 51.1657, lng: 10.4515 }), []);
  const markerIcon = useRef(
    L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  );

  async function handleLocationSelected(latlng: LatLngLiteral) {
    setMarker(latlng);
    setToast(null);
    try {
      const { ags, state_code, region_code, district_code, municipality_code } =
        await resolve(latlng.lat, latlng.lng);

      // Force region_code "0" if empty
      const finalRegion = region_code && region_code !== "" ? region_code : "0";
      setForm({
        state_code,
        region_code: finalRegion,
        district_code,
        municipality_code
      });

      // Auto predict if timestamp present
      if (timestamp) {
        await predictTraffic({
          state_code,
          region_code: finalRegion,
          district_code,
          municipality_code,
          timestamp
        });
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      // Outside Germany or network error
      setToast("Sélection hors d’Allemagne ou échec de résolution.");
    }
  }

  return (
    <div className="space-y-3">
      <MapContainer
        center={mapCenter}
        zoom={6}
        scrollWheelZoom
        className="map-container rounded-md"
        style={{ width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationSelected={handleLocationSelected} />
        {marker && <Marker position={marker} icon={markerIcon.current} />}
      </MapContainer>
      <div className="text-sm text-gray-600">
        {isResolving
          ? "Résolution des codes administratifs…"
          : "Cliquez en Allemagne pour sélectionner une localisation."}
      </div>
      {toast && (
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
          {toast}
        </div>
      )}
    </div>
  );
}


