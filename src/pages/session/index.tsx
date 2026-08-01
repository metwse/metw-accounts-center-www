import { useEffect, useRef, useState } from 'react';
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

  const changePasswordRef = useRef(null);

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

  const changePassword = async () => {
    const form: HTMLFormElement = changePasswordRef.current!;

    const currentPassword: string = form['data-current-password'].value!;
    const newPassword: string = form['data-new-password'].value!;
    const retypePassword: string = form['data-retype-password'].value!;

    if (retypePassword != newPassword)
      return alert('Passwords does not match!');

    if (newPassword.length < 4)
      return alert('Password is too weak!');

    const promise = (async () =>
      await session.changePassword({ currentPassword, newPassword })
    )();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      alert('Success!');
  };

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

      <section>
        <h3>Change password</h3>

        <form
          onSubmit={(e) => { e.preventDefault(); changePassword(); }}
          className={styles['change-password']}
          ref={changePasswordRef}
          >
          <span>current password</span>
          <input
            name="data-current-password"
            type="password"
            placeholder="current password"
            />
          <span>new password</span>
          <input
            name="data-new-password"
            type="password"
            placeholder="new password"
           />
          <span>retype password</span>
          <input
            name="data-retype-password"
            type="password"
            placeholder="retype password"
           />
          <input type="submit" value="change" />
        </form>
      </section>
    </main>
  );
}
