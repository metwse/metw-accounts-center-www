import usePage from './hooks/page';

import EmailVerificationSessionPage from './pages/email-verification-session';
import GatewayPage from './pages/gateway';
import SessionPage from './pages/session';
import AuthPage from './pages/auth';

import { PageId } from './pages';

import Header from './components/header';

import SyncUrl from './pages/sync-url';


export default function App() {
  const [page, _] = usePage();

  return (
    <div>
      <Header />

      { page.id === PageId.EmailVerificationSession ?
        <EmailVerificationSessionPage /> : null }
      { page.id === PageId.Session ?
        <SessionPage /> : null }
      { page.id === PageId.Gateway ?
        <GatewayPage /> : null }
      { page.id === PageId.Auth ?
        <AuthPage /> : null }

      <SyncUrl />
    </div>
  );
}
