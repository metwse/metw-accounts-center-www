export enum PageId {
  EmailVerificationSession,
  Session,
  Gateway,
  Auth,
  Loading,
};

export type Page =
    { readonly id: PageId.EmailVerificationSession, }
  | { readonly id: PageId.Session, }
  | { readonly id: PageId.Gateway, }
  | { readonly id: PageId.Auth, }
  | { readonly id: PageId.Loading, };
