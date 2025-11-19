import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Handle GitHub Pages 404 redirect
// The 404.html redirects to /?/path#hash format
// We need to convert this back to /path#hash format for React Router
(function handle404Redirect() {
  const location = window.location;
  const pathSegmentsToKeep = 1; // Keep /Arcus/ in the path
  
  // Check if we have the special redirect format: /?/path#hash
  if (location.search && location.search.includes('/')) {
    const search = location.search.slice(1); // Remove the '?'
    const pathParts = search.split('&');
    const pathPart = pathParts[0]; // The path part comes first
    
    // Reconstruct the path
    const path = '/' + pathPart.replace(/~and~/g, '&');
    
    // Get hash and other query params
    const hash = location.hash;
    const otherParams = pathParts.slice(1).filter(p => !p.includes('~and~'));
    const queryString = otherParams.length > 0 ? '?' + otherParams.join('&').replace(/~and~/g, '&') : '';
    
    // Replace the URL without the redirect format
    const newPath = '/Arcus' + path + queryString + hash;
    window.history.replaceState(null, '', newPath);
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

