import { createContext, useContext } from 'react';
import type { Page, PageId } from '../../pages';


type PageContextValue = {
  page: Page,
  navigate: (destination: Page | PageId) => void
};

export const PageContext =
  createContext<PageContextValue | null>(null);

export default function usePage(): PageContextValue {
  const page = useContext(PageContext);

  if (!page)
    throw new Error('Must use within PageContext');

  return page;
}
