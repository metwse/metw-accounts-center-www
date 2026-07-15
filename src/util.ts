export function getAuthToken() {
  return Object.fromEntries(
    (new URLSearchParams(window.location.search))
  ).auth;
}
