import { useState } from "react";
import Papa from "papaparse";

export default function UploadBox({ onDataReady }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | validating | uploading | done | error
  const [message, setMessage] = useState("");
  const [rowCount, setRowCount] = useState(0);

  const REQUIRED_COLS = ["lon", "lat", "timestamp", "speed_kmh"];
  const MAX_SIZE_MB = 10;
  const MAX_ROWS = 10000;

  const API_URL = "https://d3ezhigaqa.execute-api.eu-central-1.amazonaws.com/prod/predict";

  // ───────────────────────────────
  // 1️⃣ Main file handler
  // ───────────────────────────────
  function handleFileChange(e) {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    // --- 1️⃣ File type check ---
    if (!uploaded.name.toLowerCase().endsWith(".csv")) {
      setStatus("error");
      setMessage("❌ Uploaded file is not a CSV file.");
      return;
    }

    // --- 2️⃣ File size check ---
    const fileSizeMB = uploaded.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      setStatus("error");
      setMessage(`❌ File size exceeds ${MAX_SIZE_MB} MB.`);
      return;
    }

    setStatus("validating");
    setMessage("Validating file...");
    setFile(uploaded);

    Papa.parse(uploaded, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const columns = Object.keys(rows[0] || {});
        setRowCount(rows.length);

        // --- 3️⃣ Check header names ---
        const missing = REQUIRED_COLS.filter((c) => !columns.includes(c));
        if (missing.length > 0) {
          setStatus("error");
          setMessage(`❌ Missing required columns: ${missing.join(", ")}`);
          return;
        }

        // --- 4️⃣ Check row count ---
        if (rows.length > MAX_ROWS) {
          setStatus("error");
          setMessage(`❌ Too many rows (${rows.length}). Max allowed: ${MAX_ROWS}.`);
          return;
        }

        // --- 5️⃣ Check coordinate and speed validity ---
        const invalidRows = rows.filter((r) => {
          const lon = parseFloat(r.lon);
          const lat = parseFloat(r.lat);
          const speed = parseFloat(r.speed_kmh);
          return (
            isNaN(lon) ||
            isNaN(lat) ||
            lon < -180 ||
            lon > 180 ||
            lat < -90 ||
            lat > 90 ||
            isNaN(speed) ||
            speed < 0
          );
        });

        if (invalidRows.length > 0) {
          setStatus("error");
          setMessage(`❌ Invalid coordinate or speed values in ${invalidRows.length} rows.`);
          return;
        }

        // ✅ Passed all frontend checks
        setStatus("uploading");
        setMessage("Uploading and processing file...");
        uploadToAPI(uploaded);
      },
      error: (err) => {
        setStatus("error");
        setMessage(`❌ Parsing error: ${err.message}`);
      },
    });
  }

  // ───────────────────────────────
  // 2️⃣ Upload to AWS API Gateway
  // ───────────────────────────────
  function uploadToAPI(uploaded) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64data = event.target.result.split(",")[1]; // remove data: prefix

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isBase64Encoded: true,
            body: base64data,
          }),
        });

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();

        if (data.error) {
          setStatus("error");
          setMessage(`❌ Backend error: ${data.error}`);
          return;
        }

        // Success: backend returned prediction JSON
        console.log("Predictions:", data);
        setStatus("done");
        setMessage(`✅ Processed successfully. Received ${data.length} predictions.`);
        onDataReady(data); // send data up to parent
      } catch (err) {
        setStatus("error");
        setMessage(`❌ Upload failed: ${err.message}`);
      }
    };

    reader.readAsDataURL(uploaded);
  }

  // ───────────────────────────────
  // 3️⃣ Reset state
  // ───────────────────────────────
  function reset() {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setRowCount(0);
  }

  // ───────────────────────────────
  // 4️⃣ UI rendering
  // ───────────────────────────────
  return (
    <div className="border-2 border-dashed border-green-600 rounded-lg p-8 text-center transition hover:bg-green-50">
      {status === "idle" && (
        <>
          <p className="text-gray-700 mb-4">Drag your CSV file here or</p>
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

      {status === "validating" || status === "uploading" ? (
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <p className="text-gray-700">{message}</p>
        </div>
      ) : null}

      {(status === "done" || status === "error") && (
        <div className="text-gray-700 animate-fadeIn">
          <p className={`font-medium ${status === "error" ? "text-red-600" : "text-green-700"}`}>
            {message}
          </p>
          {status === "done" && (
            <p className="text-sm text-gray-500 mt-2">{rowCount} rows processed</p>
          )}
          <button
            onClick={reset}
            className="mt-4 text-sm text-red-600 underline hover:text-red-800"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
