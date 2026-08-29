import { useRef } from 'react';
import useSession from '../../../hooks/session';
import useLoading from '../../../hooks/loading-overlay';
import usePage from '../../../hooks/page';

import { PageId } from '../..';


export default function AddRedirecUrlForm(
  { pushRedirectUrl }: { pushRedirectUrl: (newRedirectUrl: string) => void }
) {
  const session = useSession();
  const loading = useLoading();
  const { page } = usePage();

  const ref = useRef(null);

  const addRedirecUrl = async () => {
    if (page.id !== PageId.DevelopersApps || !page.appId)
      return;

    const form: HTMLFormElement = ref.current!;

    const redirectUrl: string = form['data-redirect-url'].value!;

    const promise = (async () =>
      await session.appAddRedirectUrl(page.appId!, redirectUrl)
    )();
    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      pushRedirectUrl(redirectUrl);
  };

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); addRedirecUrl(); }}
        ref={ref}
        >
        <input name="data-redirect-url" placeholder="redirect url" />

        <input type="submit" value="add" />
      </form>
    </>
  );
}
