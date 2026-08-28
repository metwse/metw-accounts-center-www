import usePage from '../hooks/page';

import { PageId } from '.';
import AuthPage from './auth';

import EmailVerificationSessionPage from './email-verification-session';
import GatewayPage from './gateway';
import SessionPage from './session';
import DevelopersPage from './developers';


export default function PageContent() {
  const { page, navigate } = usePage();

  switch (page.id) {
    case PageId.EmailVerificationSession:
      return <EmailVerificationSessionPage />;

    case PageId.Session:
      return <SessionPage />;

    case PageId.Login:
    case PageId.Signup:
      return <GatewayPage />;

    case PageId.Auth:
      return <AuthPage />;

    case PageId.Developers:
      return <DevelopersPage />;

    case PageId.NotFound:
      return (
        <main>
          Not Found
          <div>
            <button onClick={() => navigate(PageId.Loading)}>return</button>
          </div>
        </main>
    );

    case PageId.Loading:
      return <main>...</main>;
  }
}
