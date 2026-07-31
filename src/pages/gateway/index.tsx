import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import { CaptchaContainer } from '../../hooks/captcha';

import SignupForm from './signup-form';
import LoginForm from './login-form';

import styles from './style.module.scss';


export default function GatewayPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  return (
    <main className={styles['main']}>
      <section>
        <h3>Log into your account</h3>
        <LoginForm session={session} awaitOverlay={awaitOverlay} />
      </section>

      <section>
        <h3>Create a new account</h3>
        <CaptchaContainer>
          <SignupForm session={session} awaitOverlay={awaitOverlay} />
        </CaptchaContainer>
      </section>
    </main>
  );
}
