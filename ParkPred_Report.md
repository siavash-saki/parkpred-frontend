# ParkPred — Progress Report

## Architecture
React + Vite + Tailwind frontend → AWS API Gateway → Lambda (Docker container with Keras model)  
EventBridge keeps Lambda warm; CloudWatch handles logs.

## Phase 1 – Setup ✅
- Created repo `parkpred-frontend`.
- Installed Node, Vite + React, Tailwind.
- Added `.gitignore`, verified local dev at `localhost:5173`.
- Defined stack and environment on Hetzner + AWS.

## Phase 2 – Frontend ✅
- Components: `Header`, `Footer`, `HowItWorks` (expandable), `UploadBox`, `MapViewer`.
- Tailwind fade-in and slide animations.
- CSV validation in browser (type / size / columns / ranges).
- Logo clickable to `https://innotrax.io`.
- Layout merged into `main`.

## Phase 3 – Backend ✅
- Lambda container deployed with `handler.py`, `fileCheck.py`, `predict.py`, model `.h5`.
- API Gateway POST `/predict` → Lambda Proxy.
- EventBridge rule for warm starts.
- `cors_response()` helper adds dynamic CORS headers for  
    `https://parkpred.innotrax.io` and `http://localhost:5173`.
- Manual `curl` tests succeed with  
    `{ "isBase64Encoded": true, "body": "<base64>" }`.

## Frontend ↔ Backend Integration ✅
- `UploadBox` sends Base64 CSV to API Gateway.
- Handles progress (`validating` → `uploading` → `done`).
- Displays backend messages and passes predictions upward.
- `App.jsx` lifts `mapData` state and feeds `MapViewer`.

## Visualization (setup complete)
- Installed `kepler.gl`, `react-map-gl`, `mapbox-gl`, `styled-components`.
- Added `.env` with `VITE_MAPBOX_TOKEN`.
- Implemented `MapViewer` that loads prediction JSON onto a Kepler map.
- Connected data flow: `UploadBox → App → MapViewer`.

## Next Steps
1. Color-code points (`y_hat_labels = 1` → red, `0` → blue).  
2. Add legend + statistics panel.  
3. Option to download processed CSV.  
4. Deploy frontend to `parkpred.innotrax.io` (HTTPS).  
5. Monitor Lambda metrics / costs in CloudWatch.

## Current Status
Everything works locally; CORS locked to production domain but tested with localhost.  
System is ready for Kepler map polish and final deployment.
