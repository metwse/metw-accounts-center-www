import { useEffect, useState } from 'react';
import { Session } from './lib/metw';

import EmailVerificationSessionPage from './pages/email-verification-session';
import GatewayPage from './pages/gateway';
import SessionPage from './pages/session';

import { Page } from './pages';


export default function App({ session }: { session: Session }) {
  const [page, setPage] = useState<Page>(Page.Loading);

  useEffect(() => {
    const emailverificationsessionHandler = () => setPage(Page.EmailVerificationSession);
    const sessionHandler = () => setPage(Page.Session);
    const logoutHandler = () => setPage(Page.Gateway);

    session.addEventListener(
      'login_emailverificationsession', emailverificationsessionHandler
    );

    session.addEventListener('login_session', sessionHandler);

    session.addEventListener('logout', logoutHandler);

    return () => {
      session.removeEventListener(
        'login_emailverificationsession', emailverificationsessionHandler
      );

      session.removeEventListener('login_session', sessionHandler);

      session.removeEventListener('logout', logoutHandler);
    }
  }, [page, session]);

  useEffect(() => { session.loadTokenFromLocalStorage(); }, [])

  return (
    <div>
      { page === Page.EmailVerificationSession ?
        <EmailVerificationSessionPage /> : null }
      { page === Page.Session ?
        <SessionPage /> : null }
      { page === Page.Gateway ?
        <GatewayPage /> : null }
      { page === Page.Loading ?
        <div>...</div> : null }
    </div>
  );
}
