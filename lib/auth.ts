import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const SESSION_SECRET = process.env.SESSION_SECRET || 'havitall_default_secure_secret_key_2026';

export const ADMIN_COOKIE_NAME = 'havitall_admin_token';
export const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Constant-time string equality check to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Validate username and password/PIN against configured environment variables
 */
export function verifyAdminCredentials(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.trim();

  const isUserValid = timingSafeEqual(cleanUser, ADMIN_USERNAME.toLowerCase());
  const isPassValid =
    timingSafeEqual(cleanPass, ADMIN_PASSWORD) ||
    (process.env.ADMIN_PIN ? timingSafeEqual(cleanPass, ADMIN_PIN) : false);

  return isUserValid && isPassValid;
}

/**
 * Generate a cryptographically signed HMAC session token
 * Format: payload.signature (where payload is base64(json))
 */
export function createAdminToken(username: string): string {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({
    username: username.toLowerCase(),
    role: 'admin',
    expiresAt,
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a signed HMAC session token
 */
export function verifyAdminToken(token: string | null | undefined): { valid: boolean; username?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [encodedPayload, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  if (!timingSafeEqual(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const data = JSON.parse(payloadJson);

    if (!data.expiresAt || data.expiresAt < Date.now()) {
      return { valid: false };
    }

    if (data.role !== 'admin') {
      return { valid: false };
    }

    return { valid: true, username: data.username };
  } catch {
    return { valid: false };
  }
}

/**
 * Verify admin session from Next.js incoming Request (via cookies or Bearer header)
 */
export function verifyAdminSession(request: Request): { authenticated: boolean; username?: string } {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const result = verifyAdminToken(token);
    if (result.valid) {
      return { authenticated: true, username: result.username };
    }
  }

  // 2. Check cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookieHeader(cookieHeader);
  const cookieToken = cookies[ADMIN_COOKIE_NAME];

  if (cookieToken) {
    const result = verifyAdminToken(cookieToken);
    if (result.valid) {
      return { authenticated: true, username: result.username };
    }
  }

  return { authenticated: false };
}

function parseCookieHeader(header: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!header) return map;
  const parts = header.split(';');
  for (const part of parts) {
    const [rawKey, ...rawVal] = part.split('=');
    if (rawKey) {
      const key = rawKey.trim();
      const val = rawVal.join('=').trim();
      map[key] = decodeURIComponent(val);
    }
  }
  return map;
}
