import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Esposizione funzioni globali per debug/emergenza
(window as any).resetGame = () => {
  localStorage.clear();
  indexedDB.deleteDatabase('NeoMonLinkDB');
  location.reload();
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
