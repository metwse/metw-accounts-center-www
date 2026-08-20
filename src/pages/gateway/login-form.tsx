import { useRef } from 'react';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';
import usePage from '../../hooks/page';

import { PageId } from '..';


export default function LoginForm() {
  const session = useSession();
  const loading = useLoading();
  const [page, _] = usePage();

  const ref = useRef(null);

  const login = async () => {
    const form: HTMLFormElement = ref.current!;

    const accountIdentifier: string = form['data-identifier'].value!;
    const password: string = form['data-password'].value!;

    const promise = (async () => await session.login({
      accountIdentifier,
      password,
    }))();

    const res = await loading(() => promise);

    if (!res.ok) {
      alert(res.error.message);
    } else {
      if (session.sessionType === 'Session' &&
          page.id === PageId.Login /* type assertion */ &&
          page.redirectUrl) {
        if (page.redirectUrl.startsWith('/')) {
          window.location.replace(page.redirectUrl);
        } else {
          alert('invalid redirect URL');
        }
      }
    }
  };


  return (
    <form
      onSubmit={(e) => { e.preventDefault(); login(); }}
      ref={ref}
      >
      <span>username<br />or email</span>
      <input name="data-identifier" placeholder="username or email" />
      <span>password</span>
      <input name="data-password" type="password" placeholder="password" />
      <input type="submit" value="log in" />
    </form>
  );
}
