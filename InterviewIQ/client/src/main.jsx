import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../index.css";

// Suppress console logs in production
if (import.meta.env.PROD) {
  console.log = () => { };
  console.error = () => { };
  console.warn = () => { };
  console.debug = () => { };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
