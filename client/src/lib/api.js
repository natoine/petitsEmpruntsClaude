import { browser } from '$app/environment';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getToken() {
  if (!browser) return null;
  try {
    return JSON.parse(localStorage.getItem('pea_session'))?.token ?? null;
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, ...json };
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path, body) => request('DELETE', path, body),
};
