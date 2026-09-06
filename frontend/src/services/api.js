const GUEST_KEY = 'ea_guest_id';
const TOKEN_KEY = 'ea_token';
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body, formData, headers } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {
      'X-Guest-Id': getGuestId(),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
  };
  if (formData) {
    opts.body = formData;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      window.dispatchEvent(new Event('ea-auth-expired'));
    }
    const err = new Error(res.status === 401 ? 'Session expired. Please login again.' : (data.message || 'Request failed'));
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}
