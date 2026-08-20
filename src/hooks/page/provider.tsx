import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { PageContext } from '.';
import { decodeLocationToPage, encodePageToURL, PageId, pageWithRedirectUrl, type Page } from '../../pages';


export default function PageProvider(
  { children }: { children: ReactNode | ReactNode[] }
) {

  const [page, setPage] = useState<Page>(decodeLocationToPage());

  const setPageOverride = useMemo(
    () => (newPageOrId: Page | PageId, pushstate: boolean) => {
      let newPage: Page = (typeof newPageOrId === 'object') ?
        newPageOrId : { id: newPageOrId };

      const id = newPage.id;

      setPage((prev) => {
        if ('redirectUrl' in prev && prev.redirectUrl &&
            pageWithRedirectUrl.includes(newPage.id))
          newPage = { ...newPage, redirectUrl: prev.redirectUrl } as Page;

        if (pushstate)
          history.pushState(null, '', encodePageToURL(newPage));

        return newPage;
      });

      let title = null;

      switch (id) {
        case PageId.EmailVerificationSession:
          title = 'Pending Email Verification';
          break;

        case PageId.Session:
          title = 'Your Account';
          break;
      }

      document.title = title === null ?
        'Accounts Center' : `${title} | Accounts Center`;
    },
    [setPage]
  );

  useEffect(() => {
    const popstatehandler = () => {
      setPageOverride(decodeLocationToPage(), false);
    };

    window.addEventListener('popstate', popstatehandler);

    return () => {
      window.removeEventListener('popstate', popstatehandler);
    };
  }, [setPageOverride]);

  return (
    <PageContext
      value={[page, (p) => setPageOverride(p, true)]}
      >
      {children}
    </PageContext>
  );
}
