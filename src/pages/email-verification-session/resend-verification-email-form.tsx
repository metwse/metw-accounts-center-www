import { useRef } from 'react';
import useCaptcha from '../../hooks/captcha';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';
import usePage from '../../hooks/page';

import { PageId } from '..';


export default function ResendVerificationEmailForm() {
  const session = useSession();
  const loading = useLoading();
  const [page, _] = usePage();

  const ref = useRef(null);

  const executeCaptcha = useCaptcha();

  const resendVerificationEmail = async () => {
    const form: HTMLFormElement = ref.current!;

    const captcha = await executeCaptcha();

    const email: string = form['data-email'].value!;

    let redirectUrl: string | undefined;
    if (page.id === PageId.EmailVerificationSession /* type assertion */)
      redirectUrl = page.redirectUrl;

    const promise = (async () =>
      await session.retrySignup({ email, captcha, redirect_url: redirectUrl })
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
