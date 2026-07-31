import { useRef } from 'react';

import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import useCaptcha from '../../hooks/captcha';


export default function SignupForm(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const ref = useRef(null);

  const executeCaptcha = useCaptcha();

  const signup = async () => {
    const form: HTMLFormElement = ref.current!;

    const captcha = await executeCaptcha();

    const username: string = form['data-username'].value!;
    const email: string = form['data-email'].value!;
    const password: string = form['data-password'].value!;
    const retypePassword: string = form['data-retype-password'].value!;

    if (retypePassword != password)
      return alert('Passwords does not match!')

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
    <form
      onSubmit={(e) => { e.preventDefault(); signup(); }}
      ref={ref}
      >
      <span>username</span>
      <input name="data-username" placeholder="username" />
      <span>email</span>
      <input name="data-email" placeholder="email" type="email" />
      <span>password</span>
      <input name="data-password" type="password" placeholder="password" />
      <span></span>
      <input
        name="data-retype-password"
        type="password"
        placeholder="retype password"
      />
      <input type="submit" value="signup" />
    </form>
  );
}
