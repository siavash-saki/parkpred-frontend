import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapboxViewer({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [8.6821, 50.1109],
      zoom: 12,
    });

    // Add legend
    const legend = document.createElement("div");
    legend.className =
      "absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg shadow p-3 text-sm font-medium";
    legend.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="background:#2980b9;width:12px;height:12px;border-radius:50%;display:inline-block;"></span>
        <span>Normal driving</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <span style="background:#e74c3c;width:12px;height:12px;border-radius:50%;display:inline-block;"></span>
        <span>Searching for parking</span>
      </div>
    `;
    legend.id = "map-legend";
    mapContainer.current.appendChild(legend);

    return () => map.current.remove();
  }, []);

  // Add data layers
  useEffect(() => {
    if (!map.current || !Array.isArray(data) || data.length === 0) return;

    // Normalize labels and ensure numbers are floats
    const normalized = data.map((d) => ({
      lon: parseFloat(d.lon),
      lat: parseFloat(d.lat),
      label:
        typeof d.y_hat_labels === "number"
          ? d.y_hat_labels === 1
            ? "searching"
            : "normal"
          : String(d.y_hat_labels).toLowerCase(),
    }));

    // GeoJSON for points
    const pointsGeoJSON = {
      type: "FeatureCollection",
      features: normalized.map((r, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lon, r.lat] },
        properties: { id: i, label: r.label },
      })),
    };

    // GeoJSON for line
    const lineGeoJSON = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: normalized.map((r) => [r.lon, r.lat]),
      },
    };

    function addLayers() {
      // remove existing
      if (map.current.getLayer("route-line")) {
        map.current.removeLayer("route-line");
        map.current.removeSource("route");
      }
      if (map.current.getLayer("predictions-layer")) {
        map.current.removeLayer("predictions-layer");
        map.current.removeSource("predictions");
      }

      // add line
      map.current.addSource("route", { type: "geojson", data: lineGeoJSON });
      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-width": 3,
          "line-color": "#34495e",
          "line-opacity": 0.6,
        },
      });

      // add points
      map.current.addSource("predictions", { type: "geojson", data: pointsGeoJSON });
      map.current.addLayer({
        id: "predictions-layer",
        type: "circle",
        source: "predictions",
        paint: {
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
          "circle-color": [
            "match",
            ["get", "label"],
            "searching", "#e74c3c",
            "normal", "#27ae60",
            "#2980b9",
          ],
          "circle-opacity": 0.85,
        },
      });

      // fit to bounds
      const bounds = new mapboxgl.LngLatBounds();
      normalized.forEach((r) => bounds.extend([r.lon, r.lat]));
      if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 40, duration: 800 });
    }

    if (map.current.isStyleLoaded()) {
      addLayers();
    } else {
      map.current.once("load", addLayers);
    }
  }, [data]);

  return (
    <div
      ref={mapContainer}
      className="relative w-full h-[600px] mt-6 rounded-lg shadow border border-gray-200"
    />
  );
}
