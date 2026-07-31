import useLoading from '../../hooks/loading-overlay';
import useSession from '../../hooks/session';

import { decodeToken } from '../../lib/metw';

import { getAuthToken } from '../../util';

import styles from './style.module.scss';


export default function AuthPage() {
  const session = useSession();
  const loading = useLoading();

  const base64EncodedToken = getAuthToken();
  const authToken = decodeToken(base64EncodedToken);

  const scope = Object.entries(authToken.scope);
  const scopeName = scope[0][0];
  const scopeValue = JSON.stringify(scope[0][1], null, 2);

  const accept = async () => {
    const res = await loading(() =>
      session.auth({ token: base64EncodedToken })
    );

    if (!res.ok)
      alert(res.error.message);

    window.location.replace('/');
  };

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
