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

export type LoginReq = {
  readonly account: string,
  readonly password: string
};

export type KdfRes =
  {
    readonly client_password_kdf:
    | {
        readonly algorithm: 'none',
      }
    | {
        readonly algorithm: 'base64_encoded_pbkdf2_sha256',
        readonly salt: string,
        readonly iterations: number,
        readonly length: 256,
      }
    | {
        readonly algorithm: 'legacy_sha256_hex',
      }
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
  secondary_emails: string[],
  readonly username_aliasses: string[],
}
