import { useEffect, useEffectEvent, useState } from 'react';
import useLoading from '../../hooks/loading-overlay';
import usePage from '../../hooks/page';
import useSession from '../../hooks/session';

import type { ApplicationConsentStatusResponse } from '../../lib/metw-types';
import { AuthenticationState } from '../../lib/metw';

import { PageId } from '..';

import styles from './style.module.scss';
import { AppLink } from '../../components/app-link';


export default function AuthorizationPage() {
  const session = useSession();
  const loading = useLoading();
  const { page, navigate } = usePage();

  const onUnauthenticated = useEffectEvent(() =>
    navigate({ id: PageId.Loading, redirectPage: page }, false)
  );

  useEffect(() => {
    if (session.authenticationState !== AuthenticationState.Session)
      onUnauthenticated();
  }, [session, navigate]);

  const [consentStatus, setConsentStatus] =
    useState<null | ApplicationConsentStatusResponse>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchConsentStatus() {
      setConsentStatus(null);

      if (page.id !== PageId.Authorize ||
          session.authenticationState !== AuthenticationState.Session)
        return;

      const res = await session.authorizationStatus(page.applicationId!);

      if (res.ok && !ignore) {
        setConsentStatus(res.data);
      } else if (!res.ok) {
        alert(res.error.message);
        navigate(PageId.Session);
      }
    }

    fetchConsentStatus();

    return () => { ignore = true; };
  }, [session, page, navigate]);

  if (page.id !== PageId.Authorize)
    return <main>Must use AuthPage whitin page.id == PageId.Authorize</main>;

  if (!consentStatus)
    return (
      <main>
        loading...

        <div>
          <a onClick={() => navigate(PageId.Session)} href="/">
            return to the homepage
          </a>
        </div>
      </main>
    );

  const consent = async () => {
    if (consentStatus.is_authorized === false) {
      const promise = (async () =>
        await session.authorizeApplication(page.applicationId!)
      )();

      const res = await loading(() => promise);

      if (!res.ok)
        return alert(res.error.message);
    }

    const promise = (async () =>
      await session.createAuthorizatoinCode(page.applicationId!, page.redirectUrl!)
    )();

    const res = await loading(() => promise);

    if (!res.ok) {
      alert(res.error.message);
    } else {
      window.location.replace(`${page.redirectUrl}${res.data.authorization_code}`);
    }
  };

  return (
    <main className={styles['main']}>
      <h2>Continue with {consentStatus.name}</h2>

      { consentStatus.is_authorized ?
        <section>
          <span>you have already authorized this application before.</span>
        </section> :
        <section>
          <span>this app will have access to your username and email address.</span>
          <span>would you consent to this authorization?</span>
        </section>
      }

      <div>
        <button onClick={consent}>
          continue with {consentStatus.name}
        </button>
      </div>

      <div>
        <AppLink onClick={() => navigate(PageId.Session)} href="/">
          return to the homepage
        </AppLink>
      </div>
    </main>
  );
}
