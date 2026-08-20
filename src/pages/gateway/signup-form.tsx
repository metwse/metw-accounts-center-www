import { useRef, useState } from 'react';
import useCaptcha from '../../hooks/captcha';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';

import { checkUsernameFormat } from '../../lib/metw';


export default function SignupForm() {
  const session = useSession();
  const loading = useLoading();

  const formRef = useRef(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const executeCaptcha = useCaptcha();

  const signup = async () => {
    const form: HTMLFormElement = formRef.current!;

    const username: string = form['data-username'].value!;
    const email: string = form['data-email'].value!;
    const password: string = form['data-password'].value!;
    const retypePassword: string = form['data-retype-password'].value!;

    const usernameFormatMsg = checkUsernameFormat(username);

    if (usernameFormatMsg !== true)
      return alert(usernameFormatMsg);

    if (retypePassword != password)
      return alert('Passwords do not match!');

    if (password.length < 8)
      return alert('Password is too weak!');

    const captcha = await executeCaptcha();

    const promise = (async () =>
      await session.signup({
        username, email, password, captcha,
      })
    )();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
  };

  const checkUsername = () => {
    const form: HTMLFormElement = formRef.current!;

    const username: string = form['data-username'].value!;

    const usernameFormatMsg = checkUsernameFormat(username);

    if (usernameFormatMsg !== true)
      setAlertMessage(usernameFormatMsg);
    else
      setAlertMessage(null);
  };

  const checkPasswords = () => {
    const form: HTMLFormElement = formRef.current!;

    const password: string = form['data-password'].value!;
    const retypePassword: string = form['data-retype-password'].value!;

    if (password.length < 8)
      setAlertMessage('passwords should at least 8 characters');
    else if (retypePassword != password)
      setAlertMessage('passwords do not match');
    else
      setAlertMessage(null);
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); signup(); }}
      ref={formRef}
      >
      <span>username</span>
      <input
        name="data-username"
        placeholder="username"
        required
        onInput={checkUsername}
        />
      <span>email</span>
      <input name="data-email" placeholder="email" type="email" required />
      <span>password</span>
      <input
        name="data-password"
        type="password"
        placeholder="password"
        required
        onInput={checkPasswords}
        />
      <span></span>
      <input
        name="data-retype-password"
        type="password"
        placeholder="retype password"
        required
        onInput={checkPasswords}
        />
      <input type="submit" value="signup" />
      <span>{alertMessage}</span>
    </form>
  );
}
