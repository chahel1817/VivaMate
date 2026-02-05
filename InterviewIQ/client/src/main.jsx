import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../index.css";
import posthog from "posthog-js";

// Initialize PostHog
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", // or 'always' if you want to track anonymous users as well
    capture_pageview: true,
  });
}

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
