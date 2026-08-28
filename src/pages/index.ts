export enum PageId {
  EmailVerificationSession, Session, /* not directly accesible */
  Login, Signup, /* /login and /signup endpoints */
  Auth, /* /auth */
  Developers, /* /developers */
  NotFound,
  Loading, /* loading for account login */
};

export type Page =
    {
      readonly id: PageId.Session,
    }
  | {
      readonly id: PageId.Auth,
      readonly token?: string,
      readonly redirectUrl?: string,
    }
  | {
      readonly id: PageId.Loading,
      readonly redirectUrl?: string
      readonly redirectPage?: Page | PageId
    }
  | {
      readonly id:
        PageId.Login | PageId.Signup | PageId.EmailVerificationSession,
      readonly redirectUrl?: string
    }
  | {
      readonly id: PageId.Developers,
    }
  | {
      readonly id: PageId.NotFound,
    }

type PageWithRedirectUrl = Extract<Page, { redirectUrl?: string }>
type PageWithToken = Extract<Page, { token?: string }>

export function supportsRedirect(page: Page): page is PageWithRedirectUrl {
  return 'redirectUrl' in page;
}

export function supportsToken(page: Page): page is PageWithToken {
  return 'token' in page;
}

export const pageWithRedirectUrl = [
  PageId.Auth,
  PageId.Login, PageId.Signup,
  PageId.EmailVerificationSession, PageId.Loading
];

export const pageWithToken = [PageId.Auth];


const endpointMap: Record<PageId, string> = {
  [PageId.Session]: '/', [PageId.EmailVerificationSession]: '/',
  [PageId.Login]: '/login', [PageId.Signup]: '/signup',
  [PageId.Auth]: '/auth',
  [PageId.Developers]: '/developers',
  [PageId.NotFound]: '/404',
  [PageId.Loading]: '/',
};

const titleMap: Record<PageId, string | undefined> = {
  [PageId.Session]: 'Your Account',
  [PageId.EmailVerificationSession]: 'Pending Email Verification',
  [PageId.Auth]: 'Authorize Acction',
  [PageId.Developers]: 'Developers',
  [PageId.NotFound]: '404!',
};

const endpointRevMap: Record<string, PageId> = {
  ['/login']: PageId.Login, ['/signup']: PageId.Signup,
  ['/auth']: PageId.Auth,
  ['/developers']: PageId.Developers,
  ['/']: PageId.Loading,
};

export function pageToLocation(page: Page): string {
  const searchParams = new URLSearchParams();

  if (supportsRedirect(page) && page.redirectUrl)
    searchParams.set('redirect_url', page.redirectUrl);

  if (supportsToken(page) && page.token)
    searchParams.set('auth', page.token);

  const path: string = endpointMap[page.id];
  const searchParamsString = searchParams.toString();

  if (searchParamsString)
    return path + '?' + searchParams.toString();
  else
    return path;
}

export function pageToTitle(page: Page): string {
  const title = titleMap[page.id];

  return title ? `${title} | Accounts Center` : 'Accounts Center';
}

export function pageFromLocation(): Page {
  const searchParams = new URLSearchParams(window.location.search);
  const id = endpointRevMap[window.location.pathname] || PageId.NotFound;

  let redirectUrl: string | undefined;
  let token: string | undefined;

  if (pageWithRedirectUrl.includes(id))
    redirectUrl = searchParams.get('redirect_url') || undefined;
  if (pageWithToken.includes(id))
    token = searchParams.get('auth') || undefined;

  return { id, token, redirectUrl };
}

export function performRedirect(redirectUrl?: string): void {
  if (!redirectUrl)
    return;

  if (!redirectUrl.startsWith('/'))
    throw new Error('Invalid rediret URL');

  window.location.replace(redirectUrl);
}
