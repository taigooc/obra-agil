import L from "leaflet";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { LatLng } from "../lib/geo.ts";

export type MapMarker = { id: string; lat: number; lng: number; label: string; short: string };
export type MapHandle = { recenter: () => void; focus: (id: string) => void };

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export function MapView({
  center,
  markers,
  selectedId = null,
  onSelect,
  interactive = true,
  zoom = 14,
  fit = false,
  className = "",
  label = "Mapa",
  ref,
}: {
  center: LatLng;
  markers?: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  interactive?: boolean;
  zoom?: number;
  fit?: boolean;
  className?: string;
  label?: string;
  ref?: Ref<MapHandle>;
}) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const meRef = useRef<Marker | null>(null);
  const markerRefs = useRef(new Map<string, Marker>());
  const selectRef = useRef(onSelect);
  const fitted = useRef(false);
  const initial = useRef({ center, zoom, interactive });

  useEffect(() => {
    selectRef.current = onSelect;
  });

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const { center: start, zoom: startZoom, interactive: canMove } = initial.current;
    const map = L.map(node, {
      zoomControl: false,
      attributionControl: true,
      dragging: canMove,
      scrollWheelZoom: canMove,
      touchZoom: canMove,
      doubleClickZoom: canMove,
      boxZoom: false,
      keyboard: canMove,
      zoomSnap: 0.5,
    }).setView([start.lat, start.lng], startZoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    map.attributionControl.setPrefix(false);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const markersMap = markerRefs.current;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(node);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      meRef.current = null;
      markersMap.clear();
      fitted.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const icon = L.divIcon({ className: "", html: '<span class="map-me"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
    if (meRef.current) meRef.current.setLatLng([center.lat, center.lng]);
    else meRef.current = L.marker([center.lat, center.lng], { icon, interactive: false, keyboard: false, zIndexOffset: -100 }).addTo(map);
    if (!fit) map.setView([center.lat, center.lng], map.getZoom(), { animate: false });
  }, [center.lat, center.lng, fit]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !markers) return;
    layer.clearLayers();
    markerRefs.current.clear();
    for (const item of markers) {
      const selected = item.id === selectedId;
      const icon = L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div class="map-pin" data-selected="${selected}"><span class="map-pin-dot">${escapeHtml(item.short)}</span><span class="map-pin-label">${escapeHtml(item.label)}</span></div>`,
      });
      const marker = L.marker([item.lat, item.lng], { icon, title: item.label, zIndexOffset: selected ? 1000 : 0, riseOnHover: true });
      marker.on("click", () => selectRef.current?.(item.id));
      marker.addTo(layer);
      markerRefs.current.set(item.id, marker);
    }
    if (fit && !fitted.current && markers.length > 0) {
      const points: [number, number][] = [[center.lat, center.lng], ...markers.map((m): [number, number] => [m.lat, m.lng])];
      map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 120], paddingBottomRight: [40, 260], maxZoom: 15 });
      fitted.current = true;
    }
  }, [markers, selectedId, fit, center.lat, center.lng]);

  useImperativeHandle(
    ref,
    () => ({
      recenter: () => {
        mapRef.current?.flyTo([center.lat, center.lng], 14, { duration: 0.6 });
      },
      focus: (id: string) => {
        const map = mapRef.current;
        const marker = markerRefs.current.get(id);
        if (map && marker) map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 13.5), { duration: 0.5 });
      },
    }),
    [center.lat, center.lng],
  );

  return <div ref={element} role="region" aria-label={label} className={`isolate ${className}`} />;
}
