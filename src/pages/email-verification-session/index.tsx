import { useRef, useState } from 'react';
import TurnstileWidget from '../../components/turnstile';

import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import styles from './style.module.scss';


export default function EmailVerificationSessionPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const [captchaActive, setCaptchaActive] = useState(false);
  const retrySingupRef = useRef(null);

  const signup = async (captcha: string) => {
    setCaptchaActive(false);

    const form: HTMLFormElement = retrySingupRef.current!;

    const email: string = form['data-email'].value!;

    const promise = (async () =>
      await session.retrySignup({
        email, captcha
      })
    )();

    const res = await awaitOverlay(() => promise);

    if (!res.ok)
      alert(res.error.message);
  };

  return (
    <main className={styles['main']}>
      <h2>Please check out your mailbox.</h2>

      <section>
        <h3>Actions</h3>

        <form
          onSubmit={(e) => { e.preventDefault(); setCaptchaActive(true); }}
          ref={retrySingupRef}
          >
          <input name="data-email" placeholder="email" type="email" />
          {captchaActive ?
            <div className={styles['captcha']}>
              <TurnstileWidget callback={captcha => signup(captcha)} />
            </div> : null}
          <input type="submit" value="resend signup email" />
        </form>

        <div>
          <button onClick={
            () => { awaitOverlay(() => session.logout()); }
          }>logout</button>
        </div>
      </section>
    </main>
  );
}
