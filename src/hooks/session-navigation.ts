import { useEffect } from 'react';
import useSession from '../hooks/session';
import usePage from '../hooks/page';

import { PageId, performRedirect } from '../pages';


export default function useSessionNavigation() {
  const session = useSession();

  const { page, navigate } = usePage();

  useEffect(() => {
    const handleEmailVerificationLogin =
      () => navigate(PageId.EmailVerificationSession);

    const handleSessionLogin = () => navigate(PageId.Session);

    const handleLogout = () => navigate(PageId.Login);

    session.addEventListener(
      'login_emailverificationsession', handleEmailVerificationLogin
    );

    session.addEventListener('login_session', handleSessionLogin);

    session.addEventListener('logout', handleLogout);

    return () => {
      session.removeEventListener(
        'login_emailverificationsession', handleEmailVerificationLogin
      );

      session.removeEventListener('login_session', handleSessionLogin);

      session.removeEventListener('logout', handleLogout);
    };
  }, [session, navigate]);

  useEffect(() => {
    if (page.id === PageId.Loading) {
      session.loadTokenFromLocalStorage();

      if (page.redirectUrl && session.sessionType === 'Session') {
        try {
          performRedirect(page.redirectUrl);
        } catch (err) {
          alert(err);
        }
      }
    }
  }, [page, session]);
}
