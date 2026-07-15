import type { Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import styles from './styles.module.scss';


export default function GatewayPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const login = async (form: HTMLFormElement) => {
    const usernameOrEmail: string = form['data-id'].value!;
    const password: string = form['data-password'].value!;

    const by = usernameOrEmail.includes('@') ? 'email' : 'username';

    if (by === 'email') {
      await session.login({
        by,
        email: usernameOrEmail,
        password,
      });
    } else {
      await session.login({
        by,
        username: usernameOrEmail,
        password,
      });
    }
  };

  const signup = async (form: HTMLFormElement) => {
    const username: string = form['data-username'].value!;
    const email: string = form['data-email'].value!;
    const password: string = form['data-password'].value!;

    await session.signup({
      username, email, password, captcha: '123'
    })
  };

  return (
    <main className={styles['main']}>
      <section>
        <h3>Log into your account</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          awaitOverlay(() => login(e.target));
        }}>
          <span>username/email</span>
          <input name="data-id" placeholder="username or email" />
          <span>password</span>
          <input name="data-password" type="password" placeholder="password" />
          <input type="submit" value="log in" />
        </form>
      </section>

      <section>
        <h3>Create a new account</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          awaitOverlay(() => signup(e.target));
        }}>
          <span>username</span>
          <input name="data-username" placeholder="username" />
          <span>email</span>
          <input name="data-email" placeholder="email" />
          <span>password</span>
          <input name="data-password" type="password" placeholder="password" />
          <input type="submit" value="signup" />
        </form>
      </section>
    </main>
  );
}
