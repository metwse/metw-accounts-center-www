import { useRef } from 'react';

import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';


export default function LoginForm(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const ref = useRef(null);

  const login = async () => {
    const form: HTMLFormElement = ref.current!;

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


  return (
    <form
      onSubmit={(e) => { e.preventDefault(); login(); }}
      ref={ref}
      >
      <span>username/email</span>
      <input name="data-id" placeholder="username or email" />
      <span>password</span>
      <input name="data-password" type="password" placeholder="password" />
      <input type="submit" value="log in" />
    </form>
  );
}
