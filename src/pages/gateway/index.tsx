import CaptchaProvider from '../../hooks/captcha/provider';
import usePage from '../../hooks/page';

import { PageId } from '..';

import SignupForm from './signup-form';
import LoginForm from './login-form';

import styles from './style.module.scss';
import { AFunction } from '../../components/a-function';


export default function GatewayPage() {
  const { page, navigate } = usePage();

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
          <AFunction onClick={() => navigate(PageId.Signup)} href="/login">create one</AFunction>
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
          <AFunction onClick={() => navigate(PageId.Login)}>login</AFunction>
        </div>
        </> : null }
    </main>
  );
}
