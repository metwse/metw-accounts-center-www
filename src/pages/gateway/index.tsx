import { useEffect } from 'react';
import usePage from '../../hooks/page';
import useSession from '../../hooks/session';
import CaptchaProvider from '../../hooks/captcha/provider';

import { PageId } from '..';

import SignupForm from './signup-form';
import LoginForm from './login-form';

import styles from './style.module.scss';
import { AppLink } from '../../components/app-link';


export default function GatewayPage() {
  const session = useSession();
  const { page, navigate } = usePage();

  useEffect(() => session.uninitialize(), [session]);

  return (
    <main className={styles['main']}>
      <div className={styles['logo']}>
        <img src="/img/logo-white.svg" />
        <span><b>metw</b>.cc</span>
      </div>

      { page.id === PageId.Login ?
        <>
        <section>
          <h3>Log into your account</h3>

          <LoginForm />
        </section>

        <div>
          don't have an account?&nbsp;
          <AppLink onClick={() => navigate(PageId.Signup)} href="/signup">create one</AppLink>
        </div>
        </> : null }

      { page.id === PageId.Signup ?
        <>
        <section>
          <h3>Create a new account</h3>

          <CaptchaProvider>
            <SignupForm />
          </CaptchaProvider>
        </section>

        <div>
          already have an account?&nbsp;
          <AppLink onClick={() => navigate(PageId.Login)} href="/login">login</AppLink>
        </div>
        </> : null }
    </main>
  );
}
