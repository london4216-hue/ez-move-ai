import React from 'react'

// Auto-redirect any preview domain to the real production app
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const isPreview = host.includes("preview--") || host.includes("preview-sandbox--");
  if (isPreview) {
    const realDomain = "https://ez-move-ai-a74b3ad5.base44.app";
    const path = window.location.pathname + window.location.search;
    window.location.replace(realDomain + path);
  }
}
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)