// src/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { keplerGlReducer } from "kepler.gl/dist/reducers"; // Use named import

const customizedKeplerGlReducer = keplerGlReducer.initialState({
    uiState: {
        // Hide side panel, modal controls, etc. initially if desired
        readOnly: false,
        currentModal: null,
    }
});

const reducer = combineReducers({
  // <-- Root reducer
  keplerGl: customizedKeplerGlReducer,
  // ...other app reducers if you have them
});

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Kepler.gl state is not always serializable
      immutableCheck: false,    // Kepler.gl uses Immer internally
    }),
});

export default store;