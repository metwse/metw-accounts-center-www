/* As of jul2026, Uint8Array.prototype.toBase64 is not supported by TypeScript. */
declare global {
  interface Uint8Array {
    toBase64: () => string
  }
}

export async function legacySha256Hex(keyString: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(keyString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join("");

  return 'legacy:' + hashHex;
}

export async function base64EncodedPbkdf2Sha256(
  keyString: string,
  { salt = 'metw-accounts-center', iterations = 500_000, length = 256 }
) {
  const utf8KeyEncoder = new TextEncoder();

  const keyBits = utf8KeyEncoder.encode(keyString);
  const saltBits = utf8KeyEncoder.encode(salt);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    keyBits,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedKey = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBits,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    length
  );

  const derivedKeyBase64 = new Uint8Array(derivedKey).toBase64();

  return derivedKeyBase64;
}
