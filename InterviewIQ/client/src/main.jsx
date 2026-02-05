import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../index.css";
import posthog from "posthog-js";

// Initialize PostHog
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
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
