import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';
import useSession from '../hooks/session';
import usePage from '../hooks/page';

import { PageId } from '../pages';
import { AuthenticationState } from '../lib/metw';


export default function useSessionNavigation() {
  const session = useSession();
  const { page, navigate } = usePage();

  const authenticationState = useSyncExternalStore(cb => {
    session.addEventListener('authenticationState', cb);

    return () => session.removeEventListener('authenticationState', cb);
  }, () => session.authenticationState);

  const performNavigation = useEffectEvent(
    (authenticationState: AuthenticationState) => {
      switch (authenticationState) {
        case AuthenticationState.Unauthenticated:
          return navigate(PageId.Login);

        case AuthenticationState.Session:
          if ((page.id === PageId.Loading || page.id === PageId.Login) &&
              page.redirectUrl && page.applicationId)
            return navigate(PageId.Authorize);

          if (page.id === PageId.Loading && page.redirectPage)
            return navigate(page.redirectPage, false);

          return navigate(PageId.Session, page.id !== PageId.Loading);

        case AuthenticationState.EmailVerificationSession:
          return navigate(
            PageId.EmailVerificationSession,
            page.id !== PageId.Loading
        );
      }
    }
  );

  const onLoadingPage = useEffectEvent(() => {
    if (authenticationState === AuthenticationState.NotInitialized)
      session.loadTokenFromLocalStorage();
    else
      performNavigation(authenticationState);
  });

  useEffect(() => {
    if (page.id === PageId.Loading)
      onLoadingPage();
  }, [page, session, navigate]);

  useEffect(() => {
    performNavigation(authenticationState);
  }, [authenticationState]);
}
