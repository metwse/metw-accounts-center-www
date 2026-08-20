import useLoading from '../../hooks/loading-overlay';
import usePage from '../../hooks/page';
import useSession from '../../hooks/session';

import { PageId } from '..';

import { decodeToken } from '../../lib/metw';

import styles from './style.module.scss';


export default function AuthPage() {
  const session = useSession();
  const loading = useLoading();
  const [page, setPage] = usePage();

  if (page.id !== PageId.Auth)
    return <main>Must use AuthPage whitin page.id == PageId.Auth</main>;

  const base64EncodedToken = page.token;

  if (!base64EncodedToken)
    return <main>no token provided</main>;

  const authToken = decodeToken(base64EncodedToken);

  if (!authToken)
    return <main>provided token is invalid</main>;

  const scope = Object.entries(authToken.scope);
  const scopeName = scope[0][0];
  const scopeValue = JSON.stringify(scope[0][1], null, 2);

  const accept = async () => {
    const res = await loading(() =>
      session.auth({ token: base64EncodedToken })
    );

    if (!res.ok) {
      alert(res.error.message);
    } else if (
      page.id === PageId.Auth /* type assertion */ &&
      page.redirectUrl) {
        if (page.redirectUrl.startsWith('/')) {
          return window.location.replace(page.redirectUrl);
        } else {
          alert('invalid redirect URL');
        }
    }

    setPage(PageId.Loading);
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
