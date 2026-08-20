import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { PageContext } from '.';
import {
  pageFromLocation, pageToLocation, PageId,
  pageWithRedirectUrl, type Page,
  supportsRedirect
} from '../../pages';


function resolveDestination(currentPage: Page, destination: Page | PageId): Page {
  const nextPage: Page = typeof destination === 'object' ?
    destination : { id: destination };

  if (
    supportsRedirect(currentPage) &&
    pageWithRedirectUrl.includes(nextPage.id) &&
    currentPage.redirectUrl
  ) {
    return { ...nextPage, redirectUrl: currentPage.redirectUrl } as Page;
  }

  return nextPage;
}

export default function PageProvider(
  { children }: { children: ReactNode | ReactNode[] }
) {

  const [page, setPage] = useState<Page>(pageFromLocation);

  const navigate = useCallback(
    (destination: Page | PageId) => {
      const nextPage = resolveDestination(page, destination);
      const nextUrl = pageToLocation(nextPage);

      window.history.pushState(null, '', nextUrl);
      setPage(nextPage);
    }, [page]
  );

  useEffect(() => {
    const handlePopState = () => setPage(pageFromLocation());

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <PageContext
      value={{ page, navigate }}
      >
      {children}
    </PageContext>
  );
}
