import { legacySha256Hex, base64EncodedPbkdf2Sha256 } from './crypto';
import type {
  AccountResponse,
  AddEmailRequest,
  ApiActionResult, ApiResult,
  AuthRequest,
  DeleteEmailRequest,
  KdfResponse,
  LoginRequest,
  RetrySignUpRequest,
  SetPrimaryEmailRequest,
  SignUpRequest,
  TokenResponse
} from './metw-types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

const PBKDF2_PARAMETERS = {
  salt: 'metw-accounts-center',
  iterations: 500_000,
  length: 256
};

export function decodeToken(base64EncodedToken: string):
  { sub: string, scope: string } | null
{
  try {
    return JSON.parse(atob(base64EncodedToken.split('.')[1]));
  } catch {
    return null;
  }
}

/* Returns true if the username is valid. */
export function checkUsernameFormat(username: string): string | true
{
  if (username.match("^[0-9]"))
    return 'usernames cannot start with a digit';

  if (username.match("[._]{2}"))
    return 'usernames cannot contain two consecutive . and _ characters';

  if (username.match("[._]$"))
    return 'usernames cannot end with a . or _ character';

  if (username.match("[A-Z]"))
    return 'usernames do not allow uppercase letters';

  if (username.length < 2)
    return 'usernames should at least be 2 characters';

  if (username.match("[^a-z0-9._]"))
    return 'usernames can only contain lowercase letters, digits, or . and _ '
         + 'characters.';

  return true;
}

export enum AuthenticationState {
  NotInitialized,
  Unauthenticated,
  Session,
  EmailVerificationSession
};

export class Session extends EventTarget {
  #token: null | string;
  accountId: null | string;
  authenticationState: AuthenticationState;

  constructor() {
    super();

    /* same as uninitialize */
    this.authenticationState = AuthenticationState.NotInitialized;
    this.#token = null;
    this.accountId = null;
  }

  loadTokenFromLocalStorage() {
    const savedToken = window.localStorage.getItem('token');

    if (savedToken !== null) {
      if (this.#updateToken(savedToken) == false)
        this.#removeToken();
    } else {
      this.#removeToken();
    }
  }

  /**
   * Soft-resets the in-memory authentication state while preserving the
   * persisted token. Subscribers are notified, but NotInitialized does not
   * trigger navigation.
   */
  uninitialize() {
    this.authenticationState = AuthenticationState.NotInitialized;
    this.#token = null;
    this.accountId = null;

    this.dispatchEvent(new CustomEvent('authenticationState', {}));
  }

  /**
   * Clears both the in-memory authentication state and the persisted token.
   * Subscribers respond to Unauthenticated by navigating to the login page.
   */
  #removeToken() {
    this.authenticationState = AuthenticationState.Unauthenticated;
    this.#token = null;
    this.accountId = null;

    window.localStorage.removeItem('token');

    this.dispatchEvent(new CustomEvent('authenticationState', {}));
  }

  #updateToken(newToken: string): boolean {
    const decodedToken = decodeToken(newToken);

    if (!decodedToken)
      return false;

    let authenticationState: AuthenticationState;

    switch (decodedToken.scope) {
      case 'EmailVerificationSession':
        authenticationState = AuthenticationState.EmailVerificationSession;
        break;

      case 'Session':
        authenticationState = AuthenticationState.Session;
        break;

      default:
        return false;
    }

    localStorage.setItem('token', newToken);

    this.#token = newToken;
    this.accountId = decodedToken.sub;
    this.authenticationState = authenticationState;

    this.dispatchEvent(new CustomEvent('authenticationState', {}));

    return true;
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
      headers['Authorization'] = 'Bearer ' + this.#token;
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

  get isLoggedIn() {
    return !!this.#token;
  }

  /* AUTHENTICATION */
  async signup(
    { username, email, password, redirectUrl, captcha }: SignUpRequest
  ): Promise<ApiResult<TokenResponse>> {
    const passwordHash = await base64EncodedPbkdf2Sha256(password, PBKDF2_PARAMETERS);

    const res = await this.#request<TokenResponse>(
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
          redirect_url: redirectUrl
        },
        query: { captcha }
      }
    );

    if (res.ok)
      this.#updateToken(res.data.token);

    return res;
  }

  async login(loginDto: LoginRequest): Promise<ApiResult<TokenResponse>> {
    const kdf_res = await this.#request<KdfResponse>(
      `/login/${loginDto.accountIdentifier}/kdf`,
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

    const res = await this.#request<TokenResponse>(
      '/login',
      {
        method: 'POST',
        body: {
          account_identifier: loginDto.accountIdentifier,
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
        body: { token: this.#token }
      }
    );

    this.#removeToken();

    return res;
  }

  /* EMAIL VERIFICATION SESSION */
  async retrySignup(
    { email, captcha, redirectUrl }: RetrySignUpRequest
  ): Promise<ApiActionResult> {
    return await this.#request(
      '/signup/retry',
      {
        method: 'POST',
        body: { email, redirect_url: redirectUrl },
        query: { captcha }
      }
    );
  }

  /* AUTHORIZATION */
  async auth({ token }: AuthRequest): Promise<ApiResult<string>> {
    const scope = Object.entries(decodeToken(token)!.scope);
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

    if (!res.ok)
      return res;
    else
      return { ok: true, data: scopeName };
  }

  /* SESSION */
  async me(): Promise<ApiResult<AccountResponse>> {
    return await this.#request('/me', {});
  }

  async addEmail(
    { email, captcha }: AddEmailRequest
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
    { email, captcha }: SetPrimaryEmailRequest
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

  async deleteEmail({ email }: DeleteEmailRequest): Promise<ApiActionResult> {
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
    const kdf_res = await this.#request<KdfResponse>(
      `/login/${this.accountId}/kdf`,
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

    return await this.#request<TokenResponse>(
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
