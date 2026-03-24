import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// #region agent log
fetch('http://127.0.0.1:7265/ingest/2cd28e28-980a-4e2f-a267-ad5758d445a7', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b7839b' },
  body: JSON.stringify({
    sessionId: 'b7839b',
    runId: 'pre-fix',
    hypothesisId: 'H2-H4',
    location: 'src/main.tsx:4',
    message: 'Client boot reached with deployed bundle',
    data: { buildMarker: 'remove-pickFirst-d103781' },
    timestamp: Date.now(),
  }),
}).catch(() => {})
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
