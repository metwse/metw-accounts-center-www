import usePage from './hooks/page';

import EmailVerificationSessionPage from './pages/email-verification-session';
import GatewayPage from './pages/gateway';
import SessionPage from './pages/session';
import AuthPage from './pages/auth';

import { PageId } from './pages';

import Header from './components/header';

import SyncUrl from './pages/sync-url';


export default function App() {
  const [page, setPage] = usePage();

  return (
    <>
      <Header />

      { page.id === PageId.EmailVerificationSession ?
        <EmailVerificationSessionPage /> : null }
      { page.id === PageId.Session ?
        <SessionPage /> : null }
      { page.id === PageId.Login || page.id === PageId.Signup ?
        <GatewayPage /> : null }
      { page.id === PageId.Auth ?
        <AuthPage /> : null }

      { page.id === PageId.NotFound ?
        <main>
          Not Found
          <div>
            <button onClick={() => setPage(PageId.Loading)}>return</button>
          </div>
        </main> : null}

      <SyncUrl />
    </>
  );
}
