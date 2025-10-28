import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import UploadBox from "./components/UploadBox";
import MapboxViewer from "./components/MapboxViewer";

export default function App() {
  const [mapData, setMapData] = useState(null);

  // ───────────────────────────────
  // 📦 CSV Download Helper
  // ───────────────────────────────
  function downloadCSV(data) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((field) => JSON.stringify(row[field] ?? "")).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Add a timestamp to filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.setAttribute("download", `parkpred_predictions_${timestamp}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ───────────────────────────────
  // 🧭 Page Layout
  // ───────────────────────────────
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex flex-col items-center justify-start p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center">
          ParkPred – Understanding parking search with AI
        </h1>
        <p className="text-base text-gray-500 text-center max-w-xl">
          Upload your CSV file, analyze parking search behavior, and visualize the results.
        </p>

        <div className="w-full flex justify-center lg:max-w-4xl">
          <HowItWorks />
        </div>
        <UploadBox onDataReady={(data) => setMapData(data)} />

        {mapData && (
          <div className="w-full max-w-5xl flex flex-col items-center space-y-4">
            <MapboxViewer data={mapData} />

            {/* Download section aligned to the right */}
            <div className="w-full flex justify-end mt-2">
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <p className="text-gray-700 text-sm">Want to save your results?</p>
                <button
                  onClick={() => downloadCSV(mapData)}
                  className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-md shadow-sm hover:bg-green-800 focus:ring-2 focus:ring-green-500 transition"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
