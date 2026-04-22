// Password hashing utility using Node's built-in crypto (scrypt).
// No external dependency required. Uses Node runtime — NOT Edge-compatible.
// Stored format: "scrypt$<N>$<saltHex>$<hashHex>" so we can tune parameters later.
//
// IMPORTANT: Only import this from Node.js route handlers (API routes),
// never from middleware or Edge runtime code.

import { scrypt as scryptCb, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb);

const VERSION = 'scrypt';
const N = 16384; // cost parameter (2^14)
const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length === 0) {
    throw new Error('Parola boş olamaz.');
  }
  const salt = randomBytes(SALT_LEN);
  const derived = await scrypt(plain, salt, KEY_LEN, { N });
  return `${VERSION}$${N}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(plain, stored) {
  if (typeof plain !== 'string' || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== VERSION) return false;
  const n = parseInt(parts[1], 10);
  if (!Number.isFinite(n) || n < 1024) return false;
  let salt, expected;
  try {
    salt = Buffer.from(parts[2], 'hex');
    expected = Buffer.from(parts[3], 'hex');
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  const derived = await scrypt(plain, salt, expected.length, { N: n });
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
