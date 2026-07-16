import { useEffect, useRef, useState } from 'react';

import type { Session } from '../../lib/metw';
import type { AccountRes } from '../../lib/metw-types';
import type { AwaitOverlay } from '../../types';

import TurnstileWidget from '../../components/turnstile';
import EmailList from './email-list';

import styles from './style.module.scss';


export default function SessionPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const [captchaActive, setCaptchaActive] = useState(false);
  const addEmailRef = useRef(null);
  const [me, setMe] = useState<null | AccountRes>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchMe() {
      const res = await session.me();

      if (res.ok && !ignore)
        setMe(res.data);
    }

    fetchMe();

    () => ignore = true;
  }, [session]);

  const addEmail = async (captcha: string) => {
    setCaptchaActive(false);

    const form: HTMLFormElement = addEmailRef.current!;

    const email: string = form['data-email'].value!;

    const promise = (async () =>
      await session.addEmail({
        email, captcha
      })
    )();

    const res = await awaitOverlay(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      alert('verification email is sent');
  };

  return (
    <main className={styles['main']}>
      <h2>Hello, @{me?.username ?? '...'}!</h2>

      <EmailList session={session} awaitOverlay={awaitOverlay} account={me}/>

      <section>
        <h3>Actions</h3>

        <form
          onSubmit={(e) => { e.preventDefault(); setCaptchaActive(true); }}
          ref={addEmailRef}
          >
          <input name="data-email" placeholder="email" type="email" />
          {captchaActive ?
            <div className={styles['captcha']}>
              <TurnstileWidget callback={captcha => addEmail(captcha)} />
            </div> : null}
          <input type="submit" value="add email" />
        </form>

        <div className={styles['buttons']}>
          <button onClick={
            () => { awaitOverlay(() => session.logout()); }
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
