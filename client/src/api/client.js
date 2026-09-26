const BASE = '/api';

let token = null;
export function setAuthToken(t) {
  token = t;
  if (t) localStorage.setItem('dph_token', t);
  else localStorage.removeItem('dph_token');
}
export function initAuthToken() {
  token = localStorage.getItem('dph_token') || null;
  return token;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => api('/auth/login', { method: 'POST', body: payload }),
  me: () => api('/auth/me'),
};

export const productApi = {
  list: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    return api(`/products${qs ? `?${qs}` : ''}`);
  },
  categories: () => api('/products/categories'),
  create: (payload) => api('/products', { method: 'POST', body: payload }),
  update: (id, payload) => api(`/products/${id}`, { method: 'PUT', body: payload }),
  toggle: (id) => api(`/products/${id}/toggle`, { method: 'PATCH' }),
  remove: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const orderApi = {
  create: (payload) => api('/orders', { method: 'POST', body: payload }),
  mine: () => api('/orders/mine'),
  adminList: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    return api(`/orders${qs ? `?${qs}` : ''}`);
  },
  setStatus: (id, status) => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const statsApi = {
  get: () => api('/stats'),
};

export const contactApi = {
  send: (payload) => api('/contact', { method: 'POST', body: payload }),
  adminList: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    return api(`/contact${qs ? `?${qs}` : ''}`);
  },
  setStatus: (id, status) => api(`/contact/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => api(`/contact/${id}`, { method: 'DELETE' }),
};