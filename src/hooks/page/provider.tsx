import { useMemo, useState, type ReactNode } from 'react';

import { PageContext } from '.';
import { PageId, type Page } from '../../pages';

import { getAuthToken } from '../../util';


export default function PageProvider(
  { children }: { children: ReactNode | ReactNode[] }
) {
  const [page, setPage] = useState({
    id: getAuthToken() !== undefined ? PageId.Auth : PageId.Loading
  });

  const setPageOverride = useMemo(() => (newPage: Page | PageId) => {
    let id;

    if (typeof newPage === 'object') {
      id = newPage.id;
      setPage({ ...newPage });
    } else {
      id = newPage;
      setPage({ id: newPage });
    }

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
      'metw accounts center' : `${title} | metw accounts center`;
  }, [setPage]);

  return <PageContext value={[page, setPageOverride]}>{children}</PageContext>;
}
