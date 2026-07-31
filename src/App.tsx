import { useEffect, useState } from 'react';
import useSession from './hooks/session';

import EmailVerificationSessionPage from './pages/email-verification-session';
import GatewayPage from './pages/gateway';
import SessionPage from './pages/session';
import AuthPage from './pages/auth';

import { Page } from './pages';

import Header from './components/header';
import { getAuthToken } from './util';
import { LoadingProvider } from './hooks/loading-overlay';


export default function App() {
  const session = useSession();

  const [page, setPage] = useState<Page>(Page.Loading);

  const updateTitle = (title: string | null) => {
    document.title = title === null ?
      'metw accounts center' : `${title} | metw accounts center`;
  }

  useEffect(() => {
    const emailverificationsessionHandler = () => {
      if (page != Page.EmailVerificationSession) {
        setPage(Page.EmailVerificationSession);

        updateTitle('Pending Email Verification');
      }
    };

    const sessionHandler = () => {
      if (page != Page.Session) {
        setPage(Page.Session)

        updateTitle('Your Account');
      }
    };

    const logoutHandler = () => {
      if (page != Page.Gateway) {
        setPage(Page.Gateway);

        updateTitle(null);
      }
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
  }, []);

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

      <LoadingProvider>
        { page === Page.EmailVerificationSession ?
          <EmailVerificationSessionPage /> : null }
        { page === Page.Session ?
          <SessionPage /> : null }
        { page === Page.Gateway ?
          <GatewayPage /> : null }
        { page === Page.Auth ?
          <AuthPage /> : null }
        { page === Page.Loading ?
          <main>...</main> : null }
      </LoadingProvider>
    </div>
  );
}
