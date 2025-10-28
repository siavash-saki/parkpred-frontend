# 🧭 ParkPred Development Report

### Project
**ParkPred – AI-based Urban Parking Search Prediction & Visualization**  
Frontend: `parkpred.innotrax.io`  
Backend: AWS Lambda + API Gateway + EventBridge + Keras Model  

---

## ⚙️ Phase 1 – Architecture & Setup ✅

**Goal:** Establish stack, repositories, and project environment.  

**Completed Tasks**
- Created GitHub repository `parkpred-frontend`.  
- Installed and configured:
  - **Node + npm** via `nvm`
  - **Vite + React** base project (`npm create vite@latest`)
  - **Tailwind CSS + PostCSS + Autoprefixer**
- Verified local dev server at `localhost:5173`.  
- Configured `.gitignore` and version control workflow.  
- Selected stack:
  - React + Vite + Tailwind for the frontend  
  - AWS Lambda (container-based) for model inference  
  - API Gateway + EventBridge + S3 (optional) + CloudWatch for backend orchestration.  

**Outcome:**  
Stable local dev environment; repository pushed to GitHub and merged into `main`.

---

## 🧩 Phase 2 – Frontend Development ✅

**Goal:** Build a complete, styled, user-friendly single-page application.  

### Implemented Components
1. **`Header.jsx`**  
   - Logo (`/public/logo.png`) linked to `https://innotrax.io`.  
   - Simple nav bar with hover states.  

2. **`Footer.jsx`**  
   - Clean copyright bar.

3. **`HowItWorks.jsx`**  
   - Expandable info panel with Tailwind transitions.  
   - Contains *How It Works*, *Requirements*, and *File Constraints* sections.  
   - Later upgraded to **slide-down animation** (`max-h` + opacity transitions).

4. **`UploadBox.jsx`**  
   - CSV upload with drag-and-drop UI.  
   - Frontend-side validation:
     - File type = CSV  
     - Size ≤ 10 MB  
     - Columns = `lon`, `lat`, `timestamp`, `speed_kmh`  
     - Coordinate & speed ranges  
     - Row count ≤ 10 000  
   - Animated feedback states (`idle`, `validating`, `uploading`, `done`, `error`).  

5. **Dynamic States + Fade Animations**  
   - Implemented custom Tailwind `fadeIn` keyframes.  
   - Added `transition-height` for accordion effects.

6. **Logo Integration**  
   - Logo displayed via `/public/logo.png`.  
   - Clickable to `https://innotrax.io` (opens in same tab).

7. **Version Control**  
   - Created `layout` branch → merged into `main`.  
   - Confirmed stable milestone snapshot.

**Outcome:**  
Fully responsive frontend with clear UX flow and polished interaction.

---

## 🤖 Phase 3 – Backend Integration ✅ (Part A)

**Goal:** Deploy ML model backend and connect to frontend.  

### Backend Architecture Overview
```
React (Vite App)
   │ POST /predict (base64 CSV)
   ▼
AWS API Gateway (Lambda Proxy)
   ▼
AWS Lambda (container)
   ├─ handler.py
   ├─ fileCheck.py
   ├─ predict.py
   └─ ParkingSearchPrediction.h5
   ▼
JSON predictions → browser
```

### Backend Details
- **Lambda:**  
  - Deployed as Docker container (TensorFlow/Keras compatible).  
  - EventBridge scheduler keeps it warm.  
- **API Gateway:**  
  - REST API with `/predict` POST method.  
  - Lambda Proxy integration.  
- **fileCheck.py:**  
  - Comprehensive validation (types, bounds, timestamps, etc.).  
  - Frontend performs light pre-checks; backend re-validates fully.  
- **CORS:**  
  - Managed in Lambda via helper `cors_response()`.  
  - Dynamic origin detection (allows `localhost:5173` during dev and `https://parkpred.innotrax.io` in prod).  

### Testing and Verification
- Manual `curl` tests with `isBase64Encoded:true` succeeded.  
- API Gateway → Lambda → Model → JSON pipeline validated.  

---

## 🌐 Phase 3 – Frontend ↔ Backend Integration ✅ (Part B)

**Goal:** Connect UploadBox to AWS API Gateway endpoint.

**Enhancements**
- Added `uploadToAPI()` in `UploadBox.jsx`:
  - Converts CSV to Base64.  
  - Sends `POST` to API Gateway:
    ```json
    { "isBase64Encoded": true, "body": "<base64>" }
    ```
  - Displays live status messages.  
  - Passes parsed JSON predictions to parent via `onDataReady(data)`.  
- Updated app state flow in `App.jsx`:  
  - Lifts predictions to shared state `mapData`.  
  - Conditionally renders `MapViewer` once predictions arrive.

---

## 🗺️ Phase 3 – Visualization (Setup Completed)

**Goal:** Visualize predictions with Kepler.gl.  

**Implementation Plan (Partially Complete)**
1. Installed:  
   ```bash
   npm install kepler.gl react-map-gl mapbox-gl styled-components
   ```
2. Configured Mapbox token via `.env` (`VITE_MAPBOX_TOKEN=pk…`).  
3. Implemented `MapViewer.jsx`:  
   - Renders Kepler map with dataset `"Predictions"`.  
   - Reads `lon` / `lat` columns.  
   - Center-map & auto-load dataset.  
4. Connected `UploadBox` → `App.jsx` → `MapViewer`.  

**Next planned step:**  
Add color-coded layers (`y_hat_labels = 1` → red, `0` → blue) and legend.

---

## 🧩 Current Architecture Summary

**Frontend (Hetzner Server)**
```
Vite + React App → parkpred.innotrax.io
│
├─ UploadBox (validate & send)
├─ HowItWorks (accordion)
├─ MapViewer (Kepler map)
└─ Header/Footer (branding)
```

**Backend (AWS)**
```
API Gateway (CORS enabled)
│
▼
Lambda Container
  ├─ fileCheck.py
  ├─ predict.py
  └─ handler.py (returns JSON + CORS)
│
▼
EventBridge rule (warm trigger)
▼
CloudWatch logs
```

---

## 🧭 Next Steps (Phase 3b → 4)

| Step | Description | Status |
|------|--------------|--------|
| **Map Layer Enhancement** | Add color coding for `y_hat_labels` (red = search point). | 🔜 |
| **Result Download** | Convert prediction JSON → CSV download. | 🔜 |
| **UI Polish** | Add small legend, counters, and animation. | 🔜 |
| **Deploy Frontend** | Host on Hetzner subdomain `parkpred.innotrax.io` with HTTPS. | 🔜 |
| **Monitor Lambda Metrics** | Track cold starts & invocation counts in CloudWatch. | 🔜 |

---

## 💡 Key Design Decisions

- **Hybrid Validation:** light checks in frontend, full checks in backend.  
- **Lambda Proxy Integration:** simpler JSON payloads + no mapping templates.  
- **Dynamic CORS Logic:** allows local testing & secure production.  
- **Containerized Lambda:** better control over ML dependencies.  
- **Kepler.gl Visualization:** fast and privacy-friendly edge visualization.

---

## ✅ Deliverables so far

| Deliverable | Location | Description |
|--------------|-----------|--------------|
| GitHub Repo | `github.com/siavash-saki/parkpred-frontend` | Frontend source |
| AWS Lambda Container | AWS ECR + Lambda | ML backend |
| API Gateway Endpoint | `/predict` | Public inference endpoint |
| Frontend Prototype | Local dev (`localhost:5173`) | Fully functional |
| System Docs | (this report) | Technical handover |

---

### 🌟 Summary

You have successfully built:
- A full **React frontend** with validation and polished UX.  
- A **containerized Lambda backend** for inference.  
- A **secure, working REST API integration**.  
- The groundwork for **real-time parking-search visualization**.  

Next up: final Kepler visual styling, download option, and production deployment.
