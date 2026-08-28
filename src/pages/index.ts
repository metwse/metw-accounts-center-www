export enum PageId {
  EmailVerificationSession, Session, /* not directly accessible */
  Login, Signup, /* /login and /signup endpoints */
  Auth, /* /auth */
  Developers, DevelopersApps, /* /developers and /developers/apps */
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
      readonly id: PageId.DevelopersApps,
      readonly appId?: string,
    }
  | {
      readonly id: PageId.NotFound,
    }

type PageWithRedirectUrl = Extract<Page, { redirectUrl?: string }>
type PageWithToken = Extract<Page, { token?: string }>
type PageWithAppId = Extract<Page, { appId?: string }>

export function supportsRedirect(page: Page): page is PageWithRedirectUrl {
  return 'redirectUrl' in page;
}

export function supportsToken(page: Page): page is PageWithToken {
  return 'token' in page;
}

export function supportsAppId(page: Page): page is PageWithAppId {
  return 'appId' in page;
}

export const pageWithRedirectUrl = [
  PageId.Auth,
  PageId.Login, PageId.Signup,
  PageId.EmailVerificationSession, PageId.Loading
];

export const pageWithToken = [PageId.Auth];

export const pageWithAppId = [PageId.DevelopersApps];


const endpointMap: Record<PageId, string> = {
  [PageId.Session]: '/', [PageId.EmailVerificationSession]: '/',
  [PageId.Login]: '/login', [PageId.Signup]: '/signup',
  [PageId.Auth]: '/auth',
  [PageId.Developers]: '/developers',
  [PageId.DevelopersApps]: '/developers/apps',
  [PageId.NotFound]: '/404',
  [PageId.Loading]: '/',
};

const titleMap: Record<PageId, string | null> = {
  [PageId.Session]: 'Your Account',
  [PageId.EmailVerificationSession]: 'Pending Email Verification',
  [PageId.Login]: null, [PageId.Signup]: null,
  [PageId.Auth]: 'Authorize Action',
  [PageId.Developers]: 'Developers',
  [PageId.DevelopersApps]: 'Developers',
  [PageId.NotFound]: '404!',
  [PageId.Loading]: null,
};

const endpointRevMap: Record<string, PageId> = {
  ['/login']: PageId.Login, ['/signup']: PageId.Signup,
  ['/auth']: PageId.Auth,
  ['/developers']: PageId.Developers,
  ['/developers/apps']: PageId.DevelopersApps,
  ['/']: PageId.Loading,
};

export function pageToLocation(page: Page): string {
  const searchParams = new URLSearchParams();

  if (supportsRedirect(page) && page.redirectUrl)
    searchParams.set('redirect_url', page.redirectUrl);

  if (supportsToken(page) && page.token)
    searchParams.set('auth', page.token);

  if (supportsAppId(page) && page.appId)
    searchParams.set('app_id', page.appId);

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
  let appId: string | undefined;

  if (pageWithRedirectUrl.includes(id))
    redirectUrl = searchParams.get('redirect_url') || undefined;
  if (pageWithToken.includes(id))
    token = searchParams.get('auth') || undefined;
  if (pageWithAppId.includes(id))
    appId = searchParams.get('app_id') || undefined;

  return { id, token, redirectUrl, appId };
}

export function performRedirect(redirectUrl?: string): void {
  if (!redirectUrl)
    return;

  if (!redirectUrl.startsWith('/'))
    throw new Error('Invalid rediret URL');

  window.location.replace(redirectUrl);
}
