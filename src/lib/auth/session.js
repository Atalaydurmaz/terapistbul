/**
 * Server-side imzalı cookie session (Edge-uyumlu)
 * Web Crypto API ile HMAC-SHA256 imzalama → Node & Edge runtime'da çalışır
 */

const ADMIN_COOKIE = 'tb_admin_session';
const PANEL_COOKIE = 'tb_panel_session';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 saat

function getSecret() {
  const s = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!s) throw new Error('NEXTAUTH_SECRET / AUTH_SECRET tanımlı değil');
  return s;
}

function b64urlEncode(input) {
  const str = typeof input === 'string' ? input : new TextDecoder().decode(input);
  const b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(str, 'utf8').toString('base64')
    : btoa(str);
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function b64urlEncodeBytes(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  const b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(bytes).toString('base64')
    : btoa(s);
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = str.replaceAll('-', '+').replaceAll('_', '/') + pad;
  return typeof Buffer !== 'undefined'
    ? Buffer.from(b64, 'base64').toString('utf8')
    : atob(b64);
}

async function hmac(data) {
  const keyData = new TextEncoder().encode(getSecret());
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return new Uint8Array(signature);
}

export async function signSession(payload) {
  const body = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  });
  const bodyB64 = b64urlEncode(body);
  const sig = await hmac(bodyB64);
  return `${bodyB64}.${b64urlEncodeBytes(sig)}`;
}

export async function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const bodyB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  const expectedSig = await hmac(bodyB64);
  const expectedB64 = b64urlEncodeBytes(expectedSig);

  if (expectedB64.length !== sigB64.length) return null;
  let eq = 0;
  for (let i = 0; i < expectedB64.length; i++) {
    eq |= expectedB64.charCodeAt(i) ^ sigB64.charCodeAt(i);
  }
  if (eq !== 0) return null;

  try {
    const payload = JSON.parse(b64urlDecode(bodyB64));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIES = {
  ADMIN: ADMIN_COOKIE,
  PANEL: PANEL_COOKIE,
};

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}
