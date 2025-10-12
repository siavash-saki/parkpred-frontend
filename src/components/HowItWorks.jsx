import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export default function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full mb-8">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-green-700 font-medium hover:text-green-800 transition"
      >
        <Info className="w-5 h-5" />
        {open ? "Hide Instructions" : "How It Works"}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Animated container */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          open ? "max-h-[1500px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-6">
            <li><b>Upload your CSV file:</b> Click the upload button and select your CSV file.</li>
            <li><b>Automatic validation:</b> We quickly check the file against our criteria.</li>
            <li><b>See the magic:</b> Explore your data in our interactive Visualization Dashboard.</li>
          </ol>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
          <ul className="space-y-2 text-gray-700">
            <li>📍 Required columns:
              <ul className="ml-6 list-disc">
                <li><code>lon</code> – Longitude (decimal)</li>
                <li><code>lat</code> – Latitude (decimal)</li>
                <li><code>timestamp</code> – Datetime (e.g. <code>YYYY-MM-DD HH:MM:SS</code>)</li>
                <li><code>speed_kmh</code> – Speed in km/h (non-negative)</li>
              </ul>
            </li>
            <li>📊 Additional columns are allowed.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">File Constraints</h3>
          <ul className="text-gray-700 space-y-1">
            <li>📁 Max file size : <span className="font-semibold">10 MB</span></li>
            <li>📈 Rows &lt; <span className="font-semibold">10 000</span></li>
            <li>⏱ Data span ≤ <span className="font-semibold">30 days</span></li>
            <li>⚡ Median interval &lt; 20 s between points</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
