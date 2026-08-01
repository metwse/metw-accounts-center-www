import { legacySha256Hex, base64EncodedPbkdf2Sha256 } from './crypto';
import type {
  ApiActionResult, ApiResult, AccountRes, EmailAndCaptchaReq, EmailReq,
  LoginReq, SignupReq, TokenReq, TokenRes,
  KdfRes
} from './metw-types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

const PBKDF2_PARAMETERS = {
  salt: 'metw-accounts-center',
  iterations: 500_000,
  length: 256
};

export function decodeToken(base64EncodedToken: string):
  { id: string, scope: string }
{
    return JSON.parse(atob(base64EncodedToken.split('.')[1]));
}

/**
 * Event types / emitted struct
 * - login_emailverificationsession: { }
 * - login_session: { }
 * - logout: { }
 */
export class Session extends EventTarget {
  isLoggedIn: boolean;
  token: string;
  accountId: string;

  constructor() {
    super();

    /* for type hints */
    this.isLoggedIn = false;
    this.token = '';
    this.accountId = '';
  }

  loadTokenFromLocalStorage() {
    const savedToken = window.localStorage.getItem('token');

    if (savedToken !== null)
      this.#updateToken(savedToken);
    else
      this.#removeToken();
  }

  #removeToken() {
    this.isLoggedIn = false;

    window.localStorage.removeItem('token');

    this.dispatchEvent(
      new CustomEvent('logout', {})
    );
  }

  #updateToken(newToken: string) {
    this.isLoggedIn = true;
    this.token = newToken;

    window.localStorage.setItem('token', newToken);

    const decodedToken = decodeToken(newToken);
    this.accountId = decodedToken.id;

    if (decodedToken.scope == 'EmailVerificationSession') {
      this.dispatchEvent(
        new CustomEvent('login_emailverificationsession', {})
      );
    }

    if (decodedToken.scope == 'Session') {
      this.dispatchEvent(
        new CustomEvent('login_session', {})
      );
    }
  }

  async #request<T>(
    path: string,
    { method = 'GET', body, query }:
      { method?: string, body?: object, query?: Record<string, string> } = {}
  ): Promise<ApiResult<T>> {
    let encodedQuery: string = '';
    let encodedBody: string | undefined;
    const headers: Record<string, string>  = {};

    if (query !== undefined) {
      encodedQuery = '?' + new URLSearchParams(query).toString();
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      encodedBody = JSON.stringify(body);
    }

    if (this.isLoggedIn) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }

    path += encodedQuery;

    const [ok, res, status] = await fetch(
      BACKEND_URL + path,
      { method, headers, body: encodedBody }
    ).then(async res => [res.ok, await res.json(), res.status]);

    /* unauthorized */
    if (status === 401) {
      this.#removeToken();
    }

    if (ok)
      return { ok: true, data: res };
    else
      return { ok: false, error: res };
  }

  /* AUTHENTICATION */
  async signup(
    { username, email, password, captcha }: SignupReq
  ): Promise<ApiResult<TokenRes>> {
    const passwordHash = await base64EncodedPbkdf2Sha256(password, PBKDF2_PARAMETERS);

    const res = await this.#request<TokenRes>(
      '/signup',
      {
        method: 'POST',
        body: {
          username,
          email,
          password: {
            base64_hash: passwordHash,
            pbkdf2_salt: PBKDF2_PARAMETERS.salt,
            pbkdf2_iterations: PBKDF2_PARAMETERS.iterations,
            pbkdf2_length: PBKDF2_PARAMETERS.length
          },
        },
        query: { captcha }
      }
    );

    if (res.ok)
      this.#updateToken(res.data.token);

    return res;
  }

  async login(loginDto: LoginReq): Promise<ApiResult<TokenRes>> {
    const kdf_res = await this.#request<KdfRes>(
      `/login/${loginDto.by}/${
        loginDto.by == 'email' ? loginDto.email : loginDto.username
      }/kdf`,
    );

    if (!kdf_res.ok)
      return kdf_res;

    let passwordHash;

    switch (kdf_res.data.client_password_kdf.algorithm) {
      case 'none':
        passwordHash = loginDto.password;
        break;

      case 'base64_encoded_pbkdf2_sha256':
        passwordHash = await base64EncodedPbkdf2Sha256(
          loginDto.password,
          {
            ...kdf_res.data.client_password_kdf
          }
      );
        break;

      case 'legacy_sha256_hex':
        passwordHash = await legacySha256Hex(loginDto.password);
        break;

      default:
        throw new Error('unknown KDF');
    }

    const res = await this.#request<TokenRes>(
      '/login/' + loginDto.by,
      {
        method: 'POST',
        body: {
          ...(loginDto.by == 'email' ?
              { email: loginDto.email } : { username: loginDto.username }),
          client_password_hash: passwordHash,
        },
      }
    );

    if (res.ok)
      this.#updateToken(res.data.token);

    return res;
  }

  async logout(): Promise<ApiActionResult> {
    const res = await this.#request(
      '/logout',
      {
        method: 'POST',
        body: { token: this.token }
      }
    );

    this.#removeToken();

    return res;
  }

  /* EMAIL VERIFICATION SESSION */
  async retrySignup(
    { email, captcha }: EmailAndCaptchaReq
  ): Promise<ApiActionResult> {
    return await this.#request(
      '/signup/retry',
      {
        method: 'POST',
        body: { email },
        query: { captcha }
      }
    );
  }

  /* AUTHORIZATION */
  async auth({ token }: TokenReq): Promise<ApiActionResult> {
    const scope = Object.entries(decodeToken(token).scope);
    const scopeName = scope[0][0];

    const res = await this.#request(
      '/auth',
      {
        method: 'POST',
        body: { token }
      }
    );

    if (scopeName === 'CompleteSignup')
      this.#removeToken();

    return res;
  }

  /* SESSION */
  async me(): Promise<ApiResult<AccountRes>> {
    return await this.#request('/me', {});
  }

  async addEmail(
    { email, captcha }: EmailAndCaptchaReq
  ): Promise<ApiActionResult> {
    return await this.#request(
      '/me/emails',
      {
        method: 'POST',
        body: { email },
        query: { captcha }
      }
    );
  }

  async setPrimaryEmail(
    { email, captcha }: EmailAndCaptchaReq
  ): Promise<ApiActionResult> {
    return await this.#request(
      '/me/emails/set-primary',
      {
        method: 'POST',
        body: { email },
        query: { captcha }
      }
    );
  }

  async deleteEmail({ email }: EmailReq): Promise<ApiActionResult> {
    return await this.#request(
      '/me/emails',
      {
        method: 'DELETE',
        body: { email },
      }
    );
  }

  async changePassword(
    { currentPassword, newPassword }:
      { currentPassword: string, newPassword: string}
  ): Promise<ApiActionResult> {
    const kdf_res = await this.#request<KdfRes>(
      `/login/id/${this.accountId}/kdf`,
    );

    if (!kdf_res.ok)
      return kdf_res;

    let currentPasswordHash;
    const newPasswordHash = await base64EncodedPbkdf2Sha256(
      newPassword, PBKDF2_PARAMETERS
    );

    switch (kdf_res.data.client_password_kdf.algorithm) {
      case 'none':
        currentPasswordHash = currentPassword;
        break;

      case 'base64_encoded_pbkdf2_sha256':
        currentPasswordHash = await base64EncodedPbkdf2Sha256(
          currentPassword,
          {
            ...kdf_res.data.client_password_kdf
          }
      );
        break;

      case 'legacy_sha256_hex':
        currentPasswordHash = await legacySha256Hex(currentPassword);
        break;

      default:
        throw new Error('unknown KDF');
    }

    return await this.#request<TokenRes>(
      '/me/change-password',
      {
        method: 'POST',
        body: {
          current_password_hash: currentPasswordHash,
          new_password: {
            base64_hash: newPasswordHash,
            pbkdf2_salt: PBKDF2_PARAMETERS.salt,
            pbkdf2_iterations: PBKDF2_PARAMETERS.iterations,
            pbkdf2_length: PBKDF2_PARAMETERS.length
          }
        },
      }
    );
  }
}
