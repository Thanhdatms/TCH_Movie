import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';

// Configure future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UNSAFE_DataRouterContext.Provider value={router}>
      <UNSAFE_DataRouterStateContext.Provider value={router}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UNSAFE_DataRouterStateContext.Provider>
    </UNSAFE_DataRouterContext.Provider>
  </React.StrictMode>
);