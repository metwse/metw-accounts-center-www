export enum PageId {
  EmailVerificationSession, Session, /* not directly accesible */
  Login, Signup, /* /login and /signup endpoints */
  Auth, /* /auth */
  NotFound,
  Loading, /* loading for account login */
};

export type Page =
    { readonly id: PageId.EmailVerificationSession | PageId.Session, }
  | { readonly id: PageId.Auth, readonly token?: string, }
  | { readonly id: PageId.Login | PageId.Signup, readonly redirectUrl?: string }
  | { readonly id: PageId.NotFound, }
  | { readonly id: PageId.Loading, };


const endpointMap: Record<PageId, string> = {
  [PageId.Session]: '/', [PageId.EmailVerificationSession]: '/',
  [PageId.Login]: '/login', [PageId.Signup]: '/signup',
  [PageId.Auth]: '/auth',
  [PageId.NotFound]: '/404',
  [PageId.Loading]: '/',
};

const endpointRevMap: Record<string, PageId> = {
  ['/login']: PageId.Login, ['/signup']: PageId.Signup,
  ['/auth']: PageId.Auth,
  ['/']: PageId.Loading,
};

export function encodePageToURL(page: Page): string {
  const searchParams = new URLSearchParams();

  if ((page.id === PageId.Login || page.id === PageId.Signup) && page.redirectUrl)
    searchParams.set('redirect_url', page.redirectUrl );

  if (page.id === PageId.Auth && page.token)
    searchParams.set('auth', page.token);

  const path: string = endpointMap[page.id];
  const searchParamsString = searchParams.toString();

  if (searchParamsString)
    return path + '?' + searchParams.toString();
  else
    return path;
}

export function decodeLocationToPage(): Page {
  const searchParams = new URLSearchParams(window.location.search);
  const id = endpointRevMap[window.location.pathname] || PageId.NotFound;
  let page: Page;

  if ((id === PageId.Login || id === PageId.Signup) &&
      searchParams.has('redirect_url'))
    page = { id, redirectUrl: searchParams.get('redirect_url')! };
  else if (id == PageId.Auth || searchParams.has('auth'))
    page = { id, token: searchParams.get('auth')! };
  else
    page = { id };

  return page;
}
