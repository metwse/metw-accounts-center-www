import { useEffect } from 'react';
import useSession from '../../hooks/session';
import usePage from '../../hooks/page';

import { PageId } from '..';
import { AuthenticationState } from '../../lib/metw';

import CaptchaProvider from '../../hooks/captcha/provider';

import styles from './style.module.scss';
import { AppLink } from '../../components/app-link';


export default function DevelopersPage() {
  const session = useSession();
  const { navigate } = usePage();

  useEffect(() => {
    if (session.authenticationState != AuthenticationState.Session)
      navigate({ id: PageId.Loading, redirectPage: PageId.Developers }, false);
  }, [session, navigate]);

  return (
    <main className={styles['main']}>
      <section>
        <h3>Registered applications</h3>

        <CaptchaProvider>
          under construction
        </CaptchaProvider>
      </section>

      <AppLink onClick={() => navigate(PageId.Session)} href="/">
        return to the homepage
      </AppLink>
    </main>
  );
}
