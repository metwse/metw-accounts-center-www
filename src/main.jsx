import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Session } from './lib/metw.js';
import App from './App.jsx';

window.session = new Session;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App session={window.session}/>
  </StrictMode>,
);
