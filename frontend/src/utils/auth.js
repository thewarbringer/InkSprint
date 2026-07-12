const AUTH_STORAGE_KEY = 'InkSprintUser';

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse user session:', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setUserSession(data, remember = true) {
  if (!data || typeof window === 'undefined') return;

  const existingSession = readStoredSession();
  const existingToken = existingSession?.token || null;
  const payload = data && Object.prototype.hasOwnProperty.call(data, 'token')
    ? { ...data, token: data.token || existingToken }
    : { user: data, token: existingToken };

  if (payload.user && Array.isArray(payload.user.gamesHistory)) {
    payload.user.gamesHistory = payload.user.gamesHistory.slice().sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
  }

  if (remember) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getUserSession() {
  return readStoredSession();
}

export function getCurrentUser() {
  const session = getUserSession();
  return session?.user || null;
}

export function getUserToken() {
  const session = getUserSession();
  return session?.token || null;
}

export async function fetchCurrentUser() {
  const token = getUserToken();
  if (!token) return null;

  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.user || null;
}

export function clearUserSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
}
