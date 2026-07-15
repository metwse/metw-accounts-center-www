import { keyStretchingV1 } from './crypto';

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

  async request_(
    path: string,
    { method = 'GET', body, query }:
      { method?: string, body?: object, query?: Record<string, string> }
  ) {
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

    return [ok, res];
  }

  /* AUTHENTICATION */
  async signup(
    { username, email, password, captcha }:
      { username: string, email: string, password: string, captcha: string }
  ) {
    const passwordHash = await keyStretchingV1(password, {});

    let [ok, res] = await this.request_(
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

    if (ok)
      this.#updateToken(res.token);

    return ok ? [true] : [ok, res];
  }

  async login(
    { username, email, password }:
      { username: string, email: string, password: string }
  ) {
    let loginBy;

    if (username === undefined && email !== undefined) {
      loginBy = 'email';
    } else if (username !== undefined && email === undefined) {
      loginBy = 'username';
    } else {
      throw 'provide email XOR username to login';
    }

    const passwordHash = await keyStretchingV1(password, {});

    let [ok, res] = await this.request_(
      '/login/' + loginBy,
      {
        method: 'POST',
        body: {
          ...(loginBy == 'email' ? { email } : { username }),
          client_password_hash: passwordHash,
        },
      }
    );

    if (ok)
      this.#updateToken(res.token);

    return ok ? [true] : [ok, res];
  }

  async logout() {
    const [ok, res] = await this.request_(
      '/logout',
      {
        method: 'POST',
        body: { token: this.token }
      }
    );

    this.#removeToken();

    return ok ? [true] : [ok, res];
  }

  /* EMAIL VERIFICATION SESSION */
  async retrySignup({ email, captcha } : { email: string, captcha: string }) {
    const [ok, res] = await this.request_(
      '/signup/retry',
      {
        method: 'POST',
        body: { email },
        query: { captcha }
      }
    );

    return ok ? [true] : [ok, res];
  }

  /* AUTHORIZATION */
  async authorize({ token }: { token: string }) {
    const [ok, res] = await this.request_(
      '/auth',
      {
        method: 'POST',
        body: { token }
      }
    );

    return ok ? [true] : [ok, res];
  }

  /* SESSION */
  async me() {
    const [ok, res] = await this.request_('/me', {});

    return [ok, res];
  }

  async addEmail({ email, captcha } : { email: string, captcha: string }) {
    const [ok, res] = await this.request_(
      '/me/emails',
      {
        method: 'POST',
        body: { email },
        query: { captcha }
      }
    );

    return ok ? [true] : [ok, res];
  }

  async setPrimaryEmail({ email } : { email: string }) {
    const [ok, res] = await this.request_(
      '/me/emails/set-primary',
      {
        method: 'POST',
        body: { email },
      }
    );

    return ok ? [true] : [ok, res];
  }

  async deleteEmail({ email } : { email: string }) {
    const [ok, res] = await this.request_(
      '/me/emails',
      {
        method: 'DELETE',
        body: { email },
      }
    );

    return ok ? [true] : [ok, res];
  }
}
