import { key_stretching_v1 } from './crypto';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

/**
 * Event types / emitted struct
 * - login_emailverificationsession: { }
 * - login_session: { }
 * - logout: { }
 */
export class Session extends EventTarget {
  constructor() {
    super();

    /* for type hints */
    this.isLoggedIn = false;
    this.token = '';
    this.accountId = '';

    const savedToken = window.localStorage.getItem('token');

    if (savedToken !== null)
      this.#updateToken(savedToken);
  }

  #removeToken() {
    this.isLoggedIn = false;

    window.localStorage.removeItem('token');

    this.dispatchEvent(
      new CustomEvent('logout', {})
    );
  }

  #updateToken(newToken) {
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

  async request_(path, { method = 'GET', body, query }) {
    let encodedQuery = '';
    let encodedBody;
    const headers = {};

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

  async signup({ username, email, password, captcha }) {
    const passwordHash = await key_stretching_v1(password, {});

    let [ok, res] = await this.request_(
      '/signup',
      {
        method: 'POST',
        body: {
          username, email, client_password_hash: passwordHash,
          keys: {
            encrypted_master_key: [],
            encrypted_private_key: [],
            identity_key: []
          }
        },
        query: { captcha }
      }
    );

    if (ok)
      this.#updateToken(res.token);

    return ok ? [true] : [ok, res];
  }

  async login({ username, email, password }) {
    let loginBy;

    if (username === undefined && email !== undefined) {
      loginBy = 'email';
    } else if (username !== undefined && email === undefined) {
      loginBy = 'username';
    } else {
      throw 'provide email XOR username to login';
    }

    const passwordHash = await key_stretching_v1(password, {});

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

  async retrySignup({ email, captcha }) {
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

  async logout() {
    if (!this.isLoggedIn) {
      return [false];
    }

    const [ok, res] = await this.request_(
      '/logout',
      {
        method: 'POST',
        body: { token: this.token }
      }
    );

    return ok ? [true] : [ok, res];
  }
}
