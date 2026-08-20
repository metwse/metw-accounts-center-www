import { useEffect } from 'react';
import useSession from '../hooks/session';
import usePage from '../hooks/page';

import { PageId, performRedirect } from '.';


export default function SessionRouter() {
  const session = useSession();

  const { page, navigate } = usePage();

  useEffect(() => {
    const emailverificationsessionHandler =
      () => navigate(PageId.EmailVerificationSession);

    const sessionHandler = () => {
      navigate(PageId.Session);
    };

    const logoutHandler = () => navigate(PageId.Login);

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

  return null;
}
