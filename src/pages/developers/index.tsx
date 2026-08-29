import { useEffect, useEffectEvent } from 'react';
import useSession from '../../hooks/session';
import usePage from '../../hooks/page';

import { PageId } from '..';

import AppDetailsPage from './app-details-page';
import DevelopersHomepage from './homepage';

import { AuthenticationState } from '../../lib/metw';


export default function DevelopersPage() {
  const session = useSession();
  const { page, navigate } = usePage();

  const onUnauthenticated = useEffectEvent(() =>
    navigate({ id: PageId.Loading, redirectPage: page }, false)
  );

  useEffect(() => {
    if (session.authenticationState !== AuthenticationState.Session)
      onUnauthenticated();
  }, [session, navigate]);

  switch (page.id) {
    case PageId.Developers:
      return <DevelopersHomepage />;

    case PageId.DevelopersApps:
      return <AppDetailsPage />;
  }
}
