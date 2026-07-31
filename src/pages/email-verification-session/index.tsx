import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';

import CaptchaProvider from '../../hooks/captcha/provider';

import ResendVerificationEmailForm from './resend-verification-email-form';

import styles from './style.module.scss';


export default function EmailVerificationSessionPage() {
  const session = useSession();
  const loading = useLoading();

  return (
    <main className={styles['main']}>
      <h2>Please check out your mailbox.</h2>

      <section>
        <h3>Resend verification email</h3>

        <CaptchaProvider>
          <ResendVerificationEmailForm />
        </CaptchaProvider>

        <div>
          <button onClick={
            () => { loading(() => session.logout()); }
          }>logout</button>
        </div>
      </section>
    </main>
  );
}
