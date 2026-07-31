import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import { Session } from './lib/metw';

import './styles/global.scss';
import { SessionContext } from './hooks/session';


window.session = new Session();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionContext value={window.session}>
      <App />
    </SessionContext>
  </StrictMode>,
);
