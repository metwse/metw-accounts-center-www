import { useEffect } from 'react';
import useSession from '../hooks/session';
import usePage from '../hooks/page';

import { PageId } from '.';


export default function LoadingPage() {
  const session = useSession();

  const [page, setPage] = usePage();

  useEffect(() => {
    const emailverificationsessionHandler =
      () => setPage(PageId.EmailVerificationSession);

    const sessionHandler = () => setPage(PageId.Session);

    const logoutHandler = () => setPage(PageId.Gateway);

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
  }, [session, setPage]);

  useEffect(() => {
    if (page.id === PageId.Loading)
      session.loadTokenFromLocalStorage();
  }, [page, session]);

  return page.id === PageId.Loading ? <main>...</main> : null;
}
