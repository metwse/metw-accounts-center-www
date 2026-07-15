import { useEffect, useState } from 'react';

import { Session } from './lib/metw';

import EmailVerificationSessionPage from './pages/email-verification-session';
import GatewayPage from './pages/gateway';
import SessionPage from './pages/session';
import AuthPage from './pages/auth';

import { Page } from './pages';

import Header from './components/header';
import LoadingOverlay from './components/loading-overlay';
import { getAuthToken } from './util';


export default function App({ session }: { session: Session }) {
  const [loadingOverlayActive, setLoadingOverlayActive] = useState(false);
  const [page, setPage] = useState<Page>(Page.Loading);

  const updateTitle = (title: string | null) => {
    document.title = title === null ?
      'metw accounts center' : `metw accounts center | ${title}`;
  }

  async function awaitOverlay<T>(asyncTask: () => Promise<T>): Promise<T> {
    setLoadingOverlayActive(true)
    let res;

    try {
      res = await asyncTask();

      return res;
    } finally {
      setLoadingOverlayActive(false)
    }
  }

  useEffect(() => {
    const emailverificationsessionHandler = () => {
      setPage(Page.EmailVerificationSession);

      updateTitle('Pending Email Verification');
    };

    const sessionHandler = () => {
      setPage(Page.Session)

      updateTitle('Your Account');
    };

    const logoutHandler = () => {
      setPage(Page.Gateway);

      updateTitle(null);
    }

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

  useEffect(() => {
    if (getAuthToken() === undefined) {
      session.loadTokenFromLocalStorage();
    } else {
      setPage(Page.Auth);
    }
  }, [])

  return (
    <div>
      <Header />

      <LoadingOverlay isActive={loadingOverlayActive} />

      { page === Page.EmailVerificationSession ?
        <EmailVerificationSessionPage
          session={session} awaitOverlay={awaitOverlay} /> : null }
      { page === Page.Session ?
        <SessionPage session={session} awaitOverlay={awaitOverlay} /> : null }
      { page === Page.Gateway ?
        <GatewayPage session={session} awaitOverlay={awaitOverlay} /> : null }
      { page === Page.Auth ?
        <AuthPage session={session} awaitOverlay={awaitOverlay} /> : null }
      { page === Page.Loading ?
        <main>...</main> : null }
    </div>
  );
}
