import useLoading from '../../../hooks/loading-overlay';
import usePage from '../../../hooks/page';
import useSession from '../../../hooks/session';

import { PageId } from '../..';

import styles from '../style.module.scss';


export default function RedirectUrlList(
  { redirectUrls, removeRedirectUrl }:
    {
      redirectUrls: string[] | null,
      removeRedirectUrl: (removedRedirectUrl: string) => void
    }
) {
  const session = useSession();
  const loading = useLoading();
  const { page } = usePage();

  return (
    <div className={styles['list']}>
      { redirectUrls ? (
          redirectUrls.length === 0 ? 'you should add a redirect URL to this application' :
          <ul>
          { redirectUrls.map(
              (redirectUrl, i) => {
                const remove = async () => {
                  if (page.id !== PageId.DevelopersApps || !page.appId)
                    return;

                  const promise = (async () =>
                    await session.appRemoveRedirectUrl(page.appId!, redirectUrl)
                  )();
                  const res = await loading(() => promise);

                  if (!res.ok)
                    alert(res.error.message);
                  else
                    removeRedirectUrl(redirectUrl);
                };

                return (
                  <li key={i}>
                    <span>{redirectUrl}</span>
                    <button onClick={remove}>remove</button>
                  </li>
                );
              }
            ) }
          </ul>
      ) : '...' }
    </div>
  );
}
