const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, ...json };
}

export const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),
};
