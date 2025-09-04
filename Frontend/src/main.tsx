import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// On récupère l’élément #root du DOM
const root = document.getElementById('root');

// Vérifie que root existe avant de rendre l’application
if (root) {
  // Si root est bien trouvé, on monte l’application React
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // Sinon, on log une erreur pour éviter un crash silencieux
  console.error("Root element not found");
}
