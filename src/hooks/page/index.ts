import { createContext, useContext } from 'react';
import type { Page, PageId } from '../../pages';

export const PageContext =
  createContext<null | [Page, (page: Page | PageId) => void]>(null);

export default function usePage(): [Page, (page: Page | PageId) => void] {
  const page = useContext(PageContext);

  if (!page)
    throw new Error('Must use within PageContext');

  return page;
}
