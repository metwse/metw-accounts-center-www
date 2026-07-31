import { useRef } from 'react';
import useCaptcha from '../../hooks/captcha';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';


export default function ResendVerificationEmailForm() {
  const session = useSession();
  const loading = useLoading();

  const ref = useRef(null);

  const executeCaptcha = useCaptcha();

  const resendVerificationEmail = async () => {
    const form: HTMLFormElement = ref.current!;

    const captcha = await executeCaptcha();

    const email: string = form['data-email'].value!;

    const promise = (async () =>
      await session.retrySignup({ email, captcha })
    )();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      alert('verification email is sent');
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); resendVerificationEmail(); }}
      ref={ref}
      >
      <input name="data-email" placeholder="email" type="email" />

      <input type="submit" value="resend email" />
    </form>
  );
}
