import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import App from './App';

/* CSS base de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Fuentes y tokens: SIEMPRE después de los CSS de Ionic para poder sobrescribir --ion-* */
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/source-sans-3';
import './theme/tokens.css';

setupIonicReact();

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el elemento #root');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
