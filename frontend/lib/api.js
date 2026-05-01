const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const request = async (method, path, data, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.errors?.[0]?.msg || 'Request failed');
  return json;
};

export const api = {
  get:    (path, token)       => request('GET',    path, null, token),
  post:   (path, data, token) => request('POST',   path, data, token),
  put:    (path, data, token) => request('PUT',    path, data, token),
  patch:  (path, data, token) => request('PATCH',  path, data, token),
  delete: (path, token)       => request('DELETE', path, null, token),
};
