import { useRef } from 'react';
import useCaptcha from '../../hooks/captcha';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';


export default function SignupForm() {
  const session = useSession();
  const loading = useLoading();

  const ref = useRef(null);

  const executeCaptcha = useCaptcha();

  const signup = async () => {
    const form: HTMLFormElement = ref.current!;

    const username: string = form['data-username'].value!;
    const email: string = form['data-email'].value!;
    const password: string = form['data-password'].value!;
    const retypePassword: string = form['data-retype-password'].value!;

    if (retypePassword != password)
      return alert('Passwords does not match!');

    if (password.length < 4)
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

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); signup(); }}
      ref={ref}
      >
      <span>username</span>
      <input name="data-username" placeholder="username" required />
      <span>email</span>
      <input name="data-email" placeholder="email" type="email" required />
      <span>password</span>
      <input
        name="data-password"
        type="password"
        placeholder="password"
        required
        />
      <span></span>
      <input
        name="data-retype-password"
        type="password"
        placeholder="retype password"
        required
        />
      <input type="submit" value="signup" />
    </form>
  );
}
