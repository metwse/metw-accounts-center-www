import { useEffect, useState } from 'react';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';

import CaptchaProvider from '../../hooks/captcha/provider';

import type { AccountRes } from '../../lib/metw-types';

import EmailList from './email-list';
import AddEmailForm from './add-email-form';

import styles from './style.module.scss';


export default function SessionPage() {
  const session = useSession();
  const loading = useLoading();

  const [me, setMe] = useState<null | AccountRes>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchMe() {
      const res = await session.me();

      if (res.ok && !ignore)
        setMe(res.data);
    }

    fetchMe();

    return () => { ignore = true; };
  }, [session]);

  return (
    <main className={styles['main']}>
      <h2>Hello, @{me?.username ?? '...'}!</h2>

      <section className={styles['email-list']}>
        <h3>Your emails</h3>

        <CaptchaProvider>
          <EmailList account={me}/>
        </CaptchaProvider>
      </section>

      <section>
        <h3>Add a new email</h3>

        <CaptchaProvider>
          <AddEmailForm />
        </CaptchaProvider>
      </section>

      <section>
        <h3>Actions</h3>

        <div className={styles['buttons']}>
          <button onClick={
            () => { loading(() => session.logout()); }
          }>logout</button>

          <button
            onClick={() => open(`/accounts-center-migration/authenticate?${session.token}`)}
            >
              log into metw.cc
          </button>
        </div>
      </section>
    </main>
  );
}
