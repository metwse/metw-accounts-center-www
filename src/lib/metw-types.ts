export type ApiError = {
  readonly message: string,
};

export type ApiResult<T> =
  | { readonly ok: true, readonly data: T}
  | { readonly ok: false, readonly error: ApiError};

export type ApiActionResult =
  | { readonly ok: true }
  | { readonly ok: false, readonly error: ApiError};


/* REQUEST TYPES */
export type SignupReq = {
  readonly username: string,
  readonly email: string,
  readonly password: string,

  readonly captcha: string
};

export type LoginReq =
  | {
      readonly by: "username",
      readonly username: string,
      readonly password: string
    }
  | {
      readonly by: "email",
      readonly email: string,
      readonly password: string
    };

export type EmailAndCaptchaReq = {
  readonly email: string,
  readonly captcha: string
};

export type EmailReq = {
  readonly email: string,
};

export type TokenReq = {
  readonly token: string
};


/* RESPONSE TYPES */
export type TokenRes = {
  readonly token: string
}

export type AccountRes = {
  readonly username: string,
  readonly email?: string,
  readonly secondary_emails: string[],
  readonly username_aliasses: string[],
}
