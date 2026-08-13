const API_BASE = '/api/v1';

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export const endpoints = {
  dashboard: () => apiGet('/dashboard'),
  products: () => apiGet('/products'),
  stockMovements: () => apiGet('/stock/movements'),
  suppliers: () => apiGet('/suppliers'),
  locations: () => apiGet('/locations'),
  reports: () => apiGet('/reports'),
  logs: () => apiGet('/system-logs'),
  settings: () => apiGet('/settings'),
};
