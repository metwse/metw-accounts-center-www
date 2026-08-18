import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import { Session } from './lib/metw';

import './styles/global.scss';

import { SessionContext } from './hooks/session';

import LoadingProvider from './hooks/loading-overlay/provider';
import PageProvider from './hooks/page/provider';



window.session = new Session();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionContext value={window.session}>
      <LoadingProvider>
        <PageProvider>
          <App />
        </PageProvider>
      </LoadingProvider>
    </SessionContext>
  </StrictMode>,
);
