export enum PageId {
  EmailVerificationSession, Session, /* not directly accessible */
  Login, Signup, /* /login and /signup endpoints */
  Auth, /* /auth */
  Authorize, /* /authorize */
  Developers, DevelopersApps, /* /developers and /developers/apps */
  NotFound,
  Loading, /* loading for account login */
};

export type Page =
    {
      readonly id: PageId.Session,
    }
  | {
      readonly id: PageId.Auth | PageId.Authorize,
      readonly token?: string,
      readonly redirectUrl?: string,
      readonly applicationId?: string,
    }
  | {
      readonly id: PageId.Loading,
      readonly redirectUrl?: string
      readonly applicationId?: string
      readonly redirectPage?: Page | PageId
    }
  | {
      readonly id:
        PageId.Login | PageId.Signup | PageId.EmailVerificationSession,
      readonly redirectUrl?: string,
      readonly applicationId?: string
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

type PageWithRedirectApplication =
  Extract<Page, { redirectUrl?: string, applicationId?: string }>
type PageWithToken = Extract<Page, { token?: string }>
type PageWithAppId = Extract<Page, { appId?: string }>

export function supportsRedirectApplication(page: Page): page is PageWithRedirectApplication {
  return 'redirectUrl' in page && 'applicationId' in page;
}

export function supportsToken(page: Page): page is PageWithToken {
  return 'token' in page;
}

export function supportsAppId(page: Page): page is PageWithAppId {
  return 'appId' in page;
}

export const pageWithRedirectUrl = [
  PageId.Auth, PageId.Authorize,
  PageId.Login, PageId.Signup,
  PageId.EmailVerificationSession, PageId.Loading
];

export const pageWithToken = [PageId.Auth];

export const pageWithAppId = [PageId.DevelopersApps];


const endpointMap: Record<PageId, string> = {
  [PageId.Session]: '/', [PageId.EmailVerificationSession]: '/',
  [PageId.Login]: '/login', [PageId.Signup]: '/signup',
  [PageId.Auth]: '/auth',
  [PageId.Authorize]: '/authorize',
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
  [PageId.Authorize]: 'Authorize Application',
  [PageId.Developers]: 'Developers',
  [PageId.DevelopersApps]: 'Developers',
  [PageId.NotFound]: '404!',
  [PageId.Loading]: null,
};

const endpointRevMap: Record<string, PageId> = {
  ['/login']: PageId.Login, ['/signup']: PageId.Signup,
  ['/auth']: PageId.Auth,
  ['/authorize']: PageId.Authorize,
  ['/developers']: PageId.Developers,
  ['/developers/apps']: PageId.DevelopersApps,
  ['/']: PageId.Loading,
};

export function pageToLocation(page: Page): string {
  const searchParams = new URLSearchParams();

  if (supportsRedirectApplication(page) && page.redirectUrl && page.applicationId) {
    searchParams.set('redirect_url', page.redirectUrl);
    searchParams.set('application_id', page.applicationId);
  }

  if (supportsToken(page) && page.token)
    searchParams.set('token', page.token);

  if (supportsAppId(page) && page.appId)
    searchParams.set('application_id', page.appId);

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
  let applicationId: string | undefined;
  let token: string | undefined;
  let appId: string | undefined;

  if (pageWithRedirectUrl.includes(id)) {
    redirectUrl = searchParams.get('redirect_url') || undefined;
    applicationId = searchParams.get('application_id') || undefined;
  }
  if (pageWithToken.includes(id))
    token = searchParams.get('token') || undefined;
  if (pageWithAppId.includes(id))
    appId = searchParams.get('application_id') || undefined;

  return { id, token, redirectUrl, appId, applicationId };
}
