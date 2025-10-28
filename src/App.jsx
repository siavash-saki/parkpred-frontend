import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import UploadBox from "./components/UploadBox";
import MapboxViewer from "./components/MapboxViewer";

export default function App() {
  const [mapData, setMapData] = useState(null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex flex-col items-center justify-start p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          ParkPred – Understanding parking search with AI
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-xl">
          Upload your CSV file, analyze parking search behavior, and visualize the results.
        </p>

        <HowItWorks />
        <UploadBox onDataReady={(data) => setMapData(data)} />

        {mapData && (
          <div className="w-full max-w-5xl">
            <MapboxViewer data={mapData} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
