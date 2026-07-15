export async function key_stretching_v1(
  keyString, { salt = 'metw-accounts-center', iterations = 500_000 }
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

  let derivedKey = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      iterations,
      salt: saltBits,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  let derivedKeyBase64 = new Uint8Array(derivedKey).toBase64();

  return derivedKeyBase64;
}
