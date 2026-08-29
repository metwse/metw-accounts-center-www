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
export type SignUpRequest = {
  readonly username: string,
  readonly email: string,
  readonly password: string,
  readonly redirectUrl?: string,

  readonly captcha: string
};

export type LoginRequest = {
  readonly accountIdentifier: string,
  readonly password: string
};

export type RetrySignUpRequest = {
  readonly email: string,
  readonly redirectUrl?: string,

  readonly captcha: string
};


export type AddEmailRequest = {
  readonly email: string,
  readonly captcha: string
};

export type DeleteEmailRequest = {
  readonly email: string,
};

export type SetPrimaryEmailRequest = {
  readonly email: string,
  readonly captcha: string
};

export type AuthRequest = {
  readonly token: string
};

export type CreateAppRequest = {
  readonly name: string,
  readonly captcha: string
}


/* RESPONSE TYPES */
export type TokenResponse = {
  readonly token: string
}

export type AccountResponse = {
  readonly username: string,
  readonly email?: string,
  readonly secondary_emails: string[],
  readonly username_aliasses: string[],
}

export type BasicAppInfoResponse = {
  readonly app_id: string,
  readonly name: string,
}

export type AppInfoResponse = {
  readonly app_id: string,
  readonly client_secret: string,
  readonly name: string,
}

export type NewClientSecretResponse = {
  readonly client_secret: string,
}

export type KdfResponse =
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

