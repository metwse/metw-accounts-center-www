import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { PageContext } from '.';
import {
  pageFromLocation, pageToLocation, PageId,
  pageWithRedirectUrl, type Page,
  supportsRedirect,
  pageToTitle
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

  const pageRef = useRef(page);

  const commitPage = useCallback((nextPage: Page) => {
    pageRef.current = nextPage;
    document.title = pageToTitle(nextPage);

    setPage(nextPage);
  }, []);

  const navigate = useCallback(
    (destination: Page | PageId, pushState?: boolean) => {
      const currentPage = pageRef.current;

      const nextPage = resolveDestination(currentPage, destination);

      if (pushState !== false) {
        const nextUrl = pageToLocation(nextPage);
        window.history.pushState(null, '', nextUrl);
      }

      commitPage(nextPage);
    }, [commitPage]
  );

  useEffect(() => {
    const handlePopState = () => commitPage(pageFromLocation());

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [commitPage]);

  return (
    <PageContext
      value={{ page, navigate }}
      >
      {children}
    </PageContext>
  );
}
