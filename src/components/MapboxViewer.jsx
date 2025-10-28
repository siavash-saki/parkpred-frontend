import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapboxViewer({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [8.6821, 50.1109], // Frankfurt fallback
      zoom: 12,
    });

    return () => map.current.remove();
  }, []);

  useEffect(() => {
    if (!map.current || !data || data.length === 0) return;

    // Convert predictions into GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: data.map((d, i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(d.lon), parseFloat(d.lat)],
        },
        properties: {
          id: i,
          speed: d.speed_kmh,
          state: d.y_hat_label, // "searching" or "normal"
        },
      })),
    };

    // Remove old layers/sources if present
    if (map.current.getSource("predictions")) {
      map.current.removeLayer("predictions-layer");
      map.current.removeSource("predictions");
    }

    // Add new data
    map.current.addSource("predictions", {
      type: "geojson",
      data: geojson,
    });

    map.current.addLayer({
      id: "predictions-layer",
      type: "circle",
      source: "predictions",
      paint: {
        "circle-radius": 5,
        "circle-color": [
          "match",
          ["get", "state"],
          "searching",
          "#d73027", // red
          "normal",
          "#1a9850", // green
          "#4575b4", // default
        ],
        "circle-opacity": 0.8,
      },
    });

    // Auto-fit bounds to data
    const bounds = new mapboxgl.LngLatBounds();
    geojson.features.forEach((f) => bounds.extend(f.geometry.coordinates));
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 40, duration: 1000 });
    }
  }, [data]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[600px] mt-6 rounded-lg shadow border border-gray-200"
    />
  );
}
