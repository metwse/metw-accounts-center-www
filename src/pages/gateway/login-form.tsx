import { useRef } from 'react';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';


export default function LoginForm() {
  const session = useSession();
  const loading = useLoading();

  const ref = useRef(null);

  const login = async () => {
    const form: HTMLFormElement = ref.current!;

    const accountIdentifier: string = form['data-identifier'].value!;
    const password: string = form['data-password'].value!;

    if (accountIdentifier.match("[A-Z]")) {
      return alert('neither of username or email can contain uppercase letters');
    }

    const promise = (async () => await session.login({
      accountIdentifier,
      password,
    }))();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
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
