import React from 'react'

// Auto-redirect preview users to the real app domain
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host.includes("preview-sandbox--69a4327be3c6be2ca74b3ad5.base44.app")) {
    const realDomain = "https://69a4327be3c6be2ca74b3ad5.base44.app";
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