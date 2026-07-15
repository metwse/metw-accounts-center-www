import { decodeToken, type Session } from '../../lib/metw';
import type { AwaitOverlay } from '../../types';

import { getAuthToken } from '../../util';

import styles from './style.module.scss';


export default function AuthPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const base64EncodedToken = getAuthToken();
  const authToken = decodeToken(base64EncodedToken);

  const scope = Object.entries(authToken.scope);
  const scopeName = scope[0][0];
  const scopeValue = JSON.stringify(scope[0][1], null, 2);

  const accept = async () => {
    const res = await awaitOverlay(() =>
      session.auth({ token: base64EncodedToken })
    );

    if (!res.ok)
      alert(res.error.message);

    window.location.replace('/');
  }

  return (
    <main className={styles['main']}>
      <h2>Permit {scopeName} on your accout.</h2>

      <section>
        <span>Details about the action:</span>

        <pre>{scopeValue}</pre>

        <button onClick={accept}>accept</button>
      </section>
    </main>
  );
}
