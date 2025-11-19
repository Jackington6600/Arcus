import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Restore path from 404.html redirect
// When GitHub Pages serves 404.html, it stores the original path in sessionStorage
// We restore it here so React Router can handle the route correctly
// This runs synchronously before React mounts to ensure the URL is correct when routing
(function restoreRedirectPath() {
  const redirectPath = sessionStorage.getItem('redirectPath');
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath');
    // Restore the original path with hash preserved
    // redirectPath already includes the path, query string, and hash (e.g., "/full-rules#armour")
    const basePath = '/Arcus';
    const newPath = basePath + redirectPath;
    // Use replaceState to update URL without triggering navigation
    // This preserves the hash so React Router and hash navigation can work correctly
    window.history.replaceState(null, '', newPath);
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

