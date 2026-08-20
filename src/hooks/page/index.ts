import { createContext, useContext } from 'react';
import type { Page, PageId } from '../../pages';

export const PageContext =
  createContext<
    null | { page: Page, navigate: (destination: Page | PageId) => void }
  >(null);

export default function usePage():
  { page: Page, navigate: (destination: Page | PageId) => void }
{
  const page = useContext(PageContext);

  if (!page)
    throw new Error('Must use within PageContext');

  return page;
}
