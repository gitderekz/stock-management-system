export const buildHeaders = (token, extra = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload.message || 'API request failed';
    throw new Error(error);
  }
  return payload;
};

// Default to backend API on port 3000 when VITE_API_BASE not provided (local dev)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

export const apiGet = async (path, token) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const apiPost = async (path, body, token) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const apiPut = async (path, body, token) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const apiDelete = async (path, token) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const apiUpload = async (path, formData, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse(response);
};
