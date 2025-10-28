// src/components/MapViewer.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux"; // Use useDispatch from react-redux
import { addDataToMap } from "kepler.gl/dist/actions";

// Use default import if possible after fixing store; check vite.config alias
// import KeplerGl from 'kepler.gl';
const KeplerGl = require("kepler.gl/dist").default || require("kepler.gl/dist");


// No need for separate store creation or Provider here

function KeplerContainer({ mapData }) { // Renamed prop for clarity
  const dispatch = useDispatch();
  // Store is now accessed via context, no need for useStore() here directly for KeplerGl component

  useEffect(() => {
    if (mapData && mapData.length > 0) {
      console.log("Adding data to Kepler:", mapData); // Debug log
      const dataset = {
        info: { label: "Predictions", id: "predictions" },
        data: {
          fields: [
            { name: "lon", type: "real", format: '' },
            { name: "lat", type: "real", format: '' },
            { name: "timestamp", type: "timestamp", format: 'YYYY-M-D H:m:s' }, // Add timestamp if needed later
            { name: "speed_kmh", type: "real", format: '' }, // Add speed if needed later
            // !!! CORRECTED FIELD NAME HERE !!!
            { name: "y_hat_labels", type: "integer", format: '' },
          ],
          // Make sure rows match the fields exactly
          rows: mapData.map((d) => [
            d.lon,
            d.lat,
            d.timestamp, // Ensure timestamp is included if field exists
            d.speed_kmh, // Ensure speed is included if field exists
            d.y_hat_labels // !!! CORRECTED FIELD NAME HERE !!!
          ]),
        },
      };

      dispatch(
        addDataToMap({
          datasets: dataset,
          options: { centerMap: true, readOnly: false },
          // You might need a basic config for Kepler to initialize correctly
          config: {
            visState: {},
            mapState: {},
            mapStyle: {},
            uiState: {}
          }
        })
      );
    }
  }, [mapData, dispatch]);

  // Use a sensible height, window.innerHeight might be too large if header/footer exist
  const mapHeight = window.innerHeight * 0.7; // Adjust multiplier as needed

  return (
    <div style={{ position: "relative", height: `${mapHeight}px`, width: "100%" }}>
      <KeplerGl
        id="map" // Ensure ID is unique if you ever have multiple maps
        mapboxApiAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        width="100%" // Use relative width
        height={mapHeight}
        // No need to pass store prop, it gets it from Provider context
      />
    </div>
  );
}

// Pass the data prop correctly
export default function MapViewer({ data }) {
    // No Provider needed here, it's wrapping App in main.jsx
    return <KeplerContainer mapData={data} />;
}