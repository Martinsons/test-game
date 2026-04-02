"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
  onGuess: (lat: number, lng: number) => void;
  guessLatLng: [number, number] | null;
  actualLatLng: [number, number] | null;
  disabled: boolean;
}

export default function GameMap({ onGuess, guessLatLng, actualLatLng, disabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const guessMarkerRef = useRef<any>(null);
  const actualMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);

  // Always-current refs so the click handler never needs re-registration
  const onGuessRef = useRef(onGuess);
  const disabledRef = useRef(disabled);
  useEffect(() => { onGuessRef.current = onGuess; }, [onGuess]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const L = require("leaflet");

    const map = L.map(containerRef.current, {
      center: [56.88, 24.6],
      zoom: 7,
      minZoom: 6,
      maxZoom: 13,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OpenStreetMap contributors &copy; CARTO", subdomains: "abcd" }
    ).addTo(map);

    map.on("click", (e: any) => {
      if (disabledRef.current) return;
      onGuessRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Show/hide markers and line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = require("leaflet");

    if (guessMarkerRef.current) { map.removeLayer(guessMarkerRef.current); guessMarkerRef.current = null; }
    if (actualMarkerRef.current) { map.removeLayer(actualMarkerRef.current); actualMarkerRef.current = null; }
    if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null; }

    if (!guessLatLng || !actualLatLng) {
      map.setView([56.88, 24.6], 7);
      return;
    }

    const guessIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(59,130,246,0.7);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    const actualIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(239,68,68,0.7);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    guessMarkerRef.current = L.marker(guessLatLng, { icon: guessIcon }).addTo(map);
    actualMarkerRef.current = L.marker(actualLatLng, { icon: actualIcon }).addTo(map);
    lineRef.current = L.polyline([guessLatLng, actualLatLng], {
      color: "#ef4444",
      weight: 2,
      dashArray: "8, 8",
      opacity: 0.8,
    }).addTo(map);

    const bounds = L.latLngBounds(guessLatLng, actualLatLng);
    map.fitBounds(bounds, { padding: [80, 80] });
  }, [guessLatLng, actualLatLng]);

  return <div ref={containerRef} className="w-full h-full" style={{ cursor: disabled ? "default" : "crosshair" }} />;
}
