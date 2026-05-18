// helpers.js — Common utility functions

/**
 * Format ISO date string to local readable format
 */
export function formatDate(isoString, locale = 'uz-UZ') {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Clamp number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Truncate string to maxLen, adding ellipsis
 */
export function truncate(str, maxLen = 50) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Emailni sidebar uchun qisqa masqalash (to‘liq manzil ko‘rinmaydi). */
export function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '••••';
  const [userPart, domainPart] = email.split('@');
  const u =
    userPart.length <= 2 ? `${userPart.slice(0, 1)}•` : `${userPart.slice(0, 2)}•••`;
  const domBits = domainPart.split('.');
  const tld = domBits.length > 1 ? domBits.pop() : domainPart;
  const domMain = domBits.join('.') || '•';
  const d = domMain.length ? `${domMain.slice(0, 1)}•••` : '•••';
  return `${u}@${d}.${tld}`;
}

/**
 * FastAPI `detail`: string | { msg }[] | object
 */
export function formatApiDetail(detail) {
  if (detail == null) return null;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((x) => (typeof x === 'object' && x != null && 'msg' in x ? String(x.msg) : null))
      .filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  }
  if (typeof detail === 'object' && 'message' in detail) return String(detail.message);
  return null;
}

/**
 * Axios xatolari uchun foydalanuvchiga tushunarli matn (t — i18n obyekti).
 * options.fallback401 — login uchun 401 da server matni bo‘lmasa shu ishlatiladi.
 */
const API_DETAIL_I18N = {
  'Current password is incorrect or missing': 'profileWrongCurrentPassword',
  'Password must be at least 6 characters': 'profilePasswordTooShort',
  'Full name cannot be empty': 'profileNameRequired',
  'Main admin email cannot be changed': 'adminMainAdminLocked',
  'Main admin role cannot be changed': 'adminMainAdminLocked',
  'Main admin cannot be deactivated': 'adminMainAdminLocked',
  'Only configured main admin can have admin role': 'adminMainAdminLocked',
  'User not found': 'apiNotFound',
};

export function formatApiError(err, t, options = {}) {
  const { fallback401 } = options;
  const res = err.response;
  const detail = formatApiDetail(res?.data?.detail);

  if (res?.status === 401 && fallback401) {
    return detail || fallback401;
  }
  if (detail) {
    const key = API_DETAIL_I18N[detail];
    if (key && t[key]) return t[key];
    return detail;
  }

  if (!res) {
    return t.apiNetworkError;
  }

  if (res.status === 404) {
    return t.apiNotFound;
  }
  if (res.status >= 500) {
    return t.apiServerError;
  }

  return t.error;
}