import { keyStretchingV1 } from './crypto';
import type {
  ApiActionResult, ApiResult, AccountRes, EmailAndCaptchaReq, EmailReq,
  LoginReq, SignupReq, TokenReq, TokenRes
} from './metw-types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

/**
 * Event types / emitted struct
 * - login_emailverificationsession: { }
 * - login_session: { }
 * - logout: { }
 */
export class Session extends EventTarget {
  isLoggedIn: boolean
  token: string
  accountId: string

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

    const decodedToken = JSON.parse(atob(newToken.split('.')[1]));
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
      { method?: string, body?: object, query?: Record<string, string> }
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
    const passwordHash = await keyStretchingV1(password, {});

    const res = await this.#request<TokenRes>(
      '/signup',
      {
        method: 'POST',
        body: {
          username, email, client_password_hash: passwordHash,
          s: {
            encrypted_master_: [],
            encrypted_private_: [],
            identity_: []
          }
        },
        query: { captcha }
      }
    );

    if (res.ok)
      this.#updateToken(res.data.token);

    return res;
  }

  async login(loginDto: LoginReq): Promise<ApiResult<TokenRes>> {
    const passwordHash = await keyStretchingV1(loginDto.password, {});

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
  async authorize({ token }: TokenReq): Promise<ApiActionResult> {
    return await this.#request(
      '/auth',
      {
        method: 'POST',
        body: { token }
      }
    );
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

  async setPrimaryEmail({ email }: EmailReq): Promise<ApiActionResult> {
    return await this.#request(
      '/me/emails/set-primary',
      {
        method: 'POST',
        body: { email },
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
}
