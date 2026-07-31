import { CaptchaProvider } from '../../hooks/captcha';

import SignupForm from './signup-form';
import LoginForm from './login-form';

import styles from './style.module.scss';


export default function GatewayPage() {
  return (
    <main className={styles['main']}>
      <section>
        <h3>Log into your account</h3>

        <LoginForm />
      </section>

      <section>
        <h3>Create a new account</h3>

        <CaptchaProvider>
          <SignupForm />
        </CaptchaProvider>
      </section>
    </main>
  );
}
