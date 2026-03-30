import jwtDecode from 'jwt-decode';

/**
 * Save token (server response token) to localStorage
 */
export function saveToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Remove token
 */
export function clearToken() {
  localStorage.removeItem('token');
}

/**
 * Return raw token
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Decode token safely. Return null if invalid.
 * Expect token payload to include either "role" or "roles"/"authorities".
 */
export function decodeToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error('Invalid JWT', e);
    return null;
  }
}

/**
 * Return boolean whether user is admin
 */
export function isAdmin() {
  const payload = decodeToken();
  if (!payload) return false;
  const role = payload.role || payload.roles || payload.authorities;
  if (!role) return false;
  return String(role).toLowerCase().includes('admin');
}

/**
 * Return user id if available in JWT subject or id claim
 */
export function getUserIdFromToken() {
  const payload = decodeToken();
  if (!payload) return null;
  return payload.sub || payload.id || payload.userId || null;
}

export function isPickupAgent() {
  const payload = decodeToken();
  if (!payload) return false;

  const role = payload.role || payload.roles || payload.authorities;
  if (!role) return false;

  return String(role).toLowerCase().includes("pickup");
}
