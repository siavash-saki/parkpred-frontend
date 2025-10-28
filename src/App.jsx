import { useState } from "react";
import Header from "./components/Header";
import UploadBox from "./components/UploadBox";
import MapViewer from "./components/MapViewer";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

function App() {
  // Shared state for predictions returned from backend
  const [mapData, setMapData] = useState(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        <section>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            ParkPred – Understanding parking search with AI
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Upload your CSV file, analyze parking search behavior, and visualize the results on an interactive map.
          </p>

          {/* Info accordion */}
          <HowItWorks />

          {/* Upload box passes predictions to parent */}
          <UploadBox onDataReady={(data) => setMapData(data)} />
        </section>

        {/* Map viewer only renders when data exists */}
        <section>
          {mapData ? (
            <MapViewer data={mapData} />
          ) : (
            <div className="text-center text-gray-500 italic">
              No data yet – upload a file to see predictions on the map.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
