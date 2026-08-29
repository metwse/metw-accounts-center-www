import { useEffect, useState } from 'react';
import usePage from '../../hooks/page';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';

import { AuthenticationState } from '../../lib/metw';

import { PageId } from '..';

import AddRedirecUrlForm from './components/add-redirect-url-form';
import RedirectUrlList from './components/redirect-url-list';
import RenameAppForm from './components/rename-app-form';

import styles from './style.module.scss';
import { AppLink } from '../../components/app-link';


export default function AppDetailsPage() {
  const session = useSession();
  const loading = useLoading();
  const { page, navigate } = usePage();

  const [redirectUrls, setRedirectUrls] = useState<string[] | null>(null);
  const [newClientSecret, setNewClientSecret] = useState<string | null>(null);

  if (page.id === PageId.DevelopersApps && !page.appId) {
    navigate(PageId.NotFound, false);
  }

  const pushRedirectUrl = (newRedirectUrl: string) =>
    setRedirectUrls(prev => prev ? [...prev, newRedirectUrl] : null);

  const removeRedirectUrl = (removedUrl: string) =>
    setRedirectUrls(prev => prev ? prev.filter(v => v != removedUrl) : null);

  useEffect(() => {
    if (session.authenticationState !== AuthenticationState.Session ||
        !(page.id === PageId.DevelopersApps && page.appId))
      return;

    let ignore = false;

    async function fetchApps() {
      if (!(page.id === PageId.DevelopersApps && page.appId))
        return;

      const res = await session.appGetRedirectUrls(page.appId);

      if (res.ok && !ignore)
        setRedirectUrls(res.data);
    }

    fetchApps();

    return () => { ignore = true; };
  }, [page, session]);

  if (page.id !== PageId.DevelopersApps)
    return <main>Must use AuthPage whitin page.id == PageId.DevelopersApps</main>;

  const rollClientSecret = async () => {
    const promise = (async () =>
      await session.appRollClientSecret(page.appId!)
    )();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      setNewClientSecret(res.data.client_secret);
  };

  const deleteApp = async () => {
    const promise = (async () => await session.deleteApp(page.appId!))();

    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);

    navigate(PageId.Developers);
  };

  return (
    <main>
      <h2>Application ID: {page.appId}!</h2>

      <section>
        <h3>Redirect URLs</h3>

        <RedirectUrlList
          redirectUrls={redirectUrls}
          removeRedirectUrl={removeRedirectUrl}
          />
      </section>

      <section className={styles['form-wrapper']}>
        <h3>Add redirect URL</h3>

        <AddRedirecUrlForm pushRedirectUrl={pushRedirectUrl} />
      </section>

      <section className={styles['form-wrapper']}>
        <h3>Rename application</h3>

        <RenameAppForm />
      </section>

      <section>
        <h3>Danger zone</h3>

        { newClientSecret ?
          <div>
            this value is shown only once -- save it!

            <pre>{newClientSecret}</pre>
          </div>
        : null }

        <div className={styles['buttons']}>
          <button onClick={rollClientSecret}>change client secret</button>
          <button onClick={deleteApp}>delete this app</button>
        </div>
      </section>

      <AppLink onClick={() => navigate(PageId.Developers)} href="/developers">
        return to the developer settings
      </AppLink>
    </main>
  );
}
