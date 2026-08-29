import { useEffect, useState } from 'react';
import useSession from '../../hooks/session';
import usePage from '../../hooks/page';

import { PageId } from '..';

import { AuthenticationState } from '../../lib/metw';
import { type BasicAppInfoResponse } from '../../lib/metw-types';

import CaptchaProvider from '../../hooks/captcha/provider';

import CreateAppForm from './components/create-app-form';
import AppList from './components/app-list';

import styles from './style.module.scss';
import { AppLink } from '../../components/app-link';


export default function DevelopersHomepage() {
  const session = useSession();
  const { navigate } = usePage();

  const [apps, setApps] = useState<null | BasicAppInfoResponse[]>(null);

  const pushApp =
    (newApp: BasicAppInfoResponse) => setApps(
      prev => prev ? [...prev, newApp] : [newApp]
    );

  useEffect(() => {
    if (session.authenticationState !== AuthenticationState.Session)
      return;

    let ignore = false;

    async function fetchApps() {
      const res = await session.apps();

      if (res.ok && !ignore)
        setApps(res.data);
    }

    fetchApps();

    return () => { ignore = true; };
  }, [session]);

  return (
    <main className={styles['main']}>
      <section>
        <h3>Registered applications</h3>

        <AppList apps={apps} />
      </section>

      <section className={styles['form-wrapper']}>
        <h3>Create a new application</h3>

        <CaptchaProvider>
          <CreateAppForm pushApp={pushApp} />
        </CaptchaProvider>
      </section>

      <AppLink onClick={() => navigate(PageId.Session)} href="/">
        return to the homepage
      </AppLink>
    </main>
  );
}
