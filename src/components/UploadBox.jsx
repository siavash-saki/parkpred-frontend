import { useState } from "react";
import Papa from "papaparse";

export default function UploadBox({ onDataReady }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [rowCount, setRowCount] = useState(0);

  const REQUIRED_COLS = ["lon", "lat", "timestamp", "speed_kmh"];
  const API_URL = "https://d3ezhigaqa.execute-api.eu-central-1.amazonaws.com/prod/predict";
  const MAX_SIZE_MB = 10;
  const MAX_ROWS = 10000;

  // ───────────────────────────────
  // 1️⃣ File handler
  // ───────────────────────────────
  function handleFileChange(e) {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    if (!uploaded.name.toLowerCase().endsWith(".csv")) {
      setStatus("error");
      setMessage("❌ Please upload a .csv file.");
      return;
    }

    if (uploaded.size / (1024 * 1024) > MAX_SIZE_MB) {
      setStatus("error");
      setMessage(`❌ File exceeds ${MAX_SIZE_MB} MB.`);
      return;
    }

    setStatus("validating");
    setMessage("Validating file...");

    Papa.parse(uploaded, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const cols = Object.keys(rows[0] || {});
        const missing = REQUIRED_COLS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setStatus("error");
          setMessage(`❌ Missing columns: ${missing.join(", ")}`);
          return;
        }

        if (rows.length > MAX_ROWS) {
          setStatus("error");
          setMessage(`❌ Too many rows (${rows.length}). Max ${MAX_ROWS}.`);
          return;
        }

        setRowCount(rows.length);
        setStatus("uploading");
        setMessage("Uploading and processing...");

        uploadToAPI(uploaded);
      },
      error: (err) => {
        setStatus("error");
        setMessage(`❌ CSV parse error: ${err.message}`);
      },
    });
  }

  // ───────────────────────────────
  // 2️⃣ Upload to AWS API
  // ───────────────────────────────
  function uploadToAPI(file) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const result = event.target.result;
      const base64data = result.includes(",") ? result.split(",")[1] : result; // remove prefix

      console.log("Payload:", {
        isBase64Encoded: true,
        body: base64data?.slice(0, 200) + "..." // first 100 chars
      });

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isBase64Encoded: true,
            body: base64data,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!Array.isArray(data) && !data.predictions) {
          throw new Error("Unexpected response from backend");
        }

        const predictions = Array.isArray(data) ? data : data.predictions;

        setStatus("done");
        setMessage(`✅ Processed successfully. Received ${predictions.length} predictions.`);
        onDataReady(predictions);
      } catch (err) {
        console.error("Upload failed:", err);
        setStatus("error");
        setMessage(`❌ Upload failed: ${err.message}`);
      }
    };

    reader.readAsDataURL(file);
  }

  // ───────────────────────────────
  // 3️⃣ Load and process GitHub sample file
  // ───────────────────────────────
  async function handleSampleFile(url) {
    try {
      setStatus("uploading");
      setMessage("Loading sample data...");

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch sample file.");

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: "text/csv" });

      uploadToAPI(blob);
    } catch (err) {
      setStatus("error");
      setMessage(`❌ Failed to load sample: ${err.message}`);
    }
  }

  // ───────────────────────────────
  // 4️⃣ UI rendering
  // ───────────────────────────────
  return (
    <div className="border-2 border-dashed border-green-600 rounded-lg p-8 text-center transition hover:bg-green-50">
      {status === "idle" && (
        <>
          <p className="text-gray-700 mb-4">Upload your driving CSV file:</p>
          <label
            htmlFor="fileInput"
            className="bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-800"
          >
            Select File
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

      {(status === "validating" || status === "uploading") && (
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="text-gray-700">{message}</p>
        </div>
      )}

      {(status === "done" || status === "error") && (
        <div className="animate-fadeIn">
          <p className={`font-medium ${status === "error" ? "text-red-600" : "text-green-700"}`}>
            {message}
          </p>
          {status === "done" && (
            <p className="text-sm text-gray-500 mt-1">{rowCount} rows processed</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 underline hover:text-red-800"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* ─────────────────────────────── */}
      {/* 5️⃣ Example samples section */}
      {/* ─────────────────────────────── */}
      <hr className="my-6 border-gray-200 w-3/4 mx-auto" />

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p className="mb-2 font-medium text-gray-700">
          Don’t have your own data? Try one of these sample trips:
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {[
            {
              name: "Trajectory 1",
              file: "https://raw.githubusercontent.com/ReLUT/parking-search-prediction/main/examples/trajectory_1.csv",
            },
            {
              name: "Trajectory 2",
              file: "https://raw.githubusercontent.com/ReLUT/parking-search-prediction/main/examples/trajectory_2.csv",
            },
            {
              name: "Trajectory 3",
              file: "https://raw.githubusercontent.com/ReLUT/parking-search-prediction/main/examples/trajectory_3.csv",
            },
          ].map((s, i) => (
            <button
              key={i}
              onClick={() => handleSampleFile(s.file)}
              className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-200 transition"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
