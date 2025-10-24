const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}` : '');

function getAuth() {
  const raw = localStorage.getItem('auth');
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const auth = getAuth();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

export const api = {
  // auth
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  // orgs
  myOrgs: () => request('/api/orgs/mine'),
  createOrg: (payload) => request('/api/orgs', { method: 'POST', body: JSON.stringify(payload) }),
  inviteMembers: (orgId, emails) => request(`/api/orgs/${orgId}/invite`, { method: 'POST', body: JSON.stringify({ emails }) }),
  orgMembers: (orgId) => request(`/api/orgs/${orgId}/members`),

  // projects
  listProjects: () => request('/api/projects'),
  createProject: (payload) => request('/api/projects', { method: 'POST', body: JSON.stringify(payload) }),

  // tasks
  listTasks: (projectId) => request(`/api/tasks/project/${projectId}`),
  createTask: (payload) => request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  assignTask: (id, userId) => request(`/api/tasks/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ userId }) }),
  updateTaskStatus: (id, status) => request(`/api/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' })
};

export function saveAuth(auth) {
  localStorage.setItem('auth', JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem('auth');
}
