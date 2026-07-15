import { useRef, useState } from 'react';
import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import styles from './styles.module.scss';
import TurnstileWidget from '../../components/turnstile';


export default function GatewayPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const [captchaActive, setCaptchaActive] = useState(false);
  const loginRef = useRef(null);
  const signupRef = useRef(null);

  const login = async () => {
    const form: HTMLFormElement = loginRef.current!;

    const usernameOrEmail: string = form['data-id'].value!;
    const password: string = form['data-password'].value!;

    const by = usernameOrEmail.includes('@') ? 'email' : 'username';

    const promise = (async () => {
      if (by === 'email') {
        return await session.login({
          by,
          email: usernameOrEmail,
          password,
        });
      } else {
        return await session.login({
          by,
          username: usernameOrEmail,
          password,
        });
      }
    })();

    const res = await awaitOverlay(() => promise);

    if (!res.ok)
      alert(res.error.message);
  };

  const signup = async (captcha: string) => {
    setCaptchaActive(false);

    const form: HTMLFormElement = signupRef.current!;

    const username: string = form['data-username'].value!;
    const email: string = form['data-email'].value!;
    const password: string = form['data-password'].value!;

    const promise = (async () =>
      await session.signup({
        username, email, password, captcha,
      })
    )();

    const res = await awaitOverlay(() => promise);

    if (!res.ok)
      alert(res.error.message);
  };

  return (
    <main className={styles['main']}>
      <section>
        <h3>Log into your account</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); login(); }}
          ref={loginRef}
          >
          <span>username/email</span>
          <input name="data-id" placeholder="username or email" />
          <span>password</span>
          <input name="data-password" type="password" placeholder="password" />
          <input type="submit" value="log in" />
        </form>
      </section>

      <section>
        <h3>Create a new account</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); setCaptchaActive(true); }}
          ref={signupRef}
          >
          <span>username</span>
          <input name="data-username" placeholder="username" />
          <span>email</span>
          <input name="data-email" placeholder="email" />
          <span>password</span>
          <input name="data-password" type="password" placeholder="password" />
          <input type="submit" value="signup" />
          {captchaActive ?
            <div className={styles['captcha']}>
              <TurnstileWidget callback={captcha => signup(captcha)} />
            </div> : null}
        </form>
      </section>
    </main>
  );
}
