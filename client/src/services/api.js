import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getMe: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
};

export const ngoAPI = {
  getAll: (p) => api.get('/ngos', { params: p }),
  getAllAdmin: () => api.get('/ngos/all'),
  getPending: () => api.get('/ngos/pending'),
  getMine: () => api.get('/ngos/mine'),
  getOne: (id) => api.get(`/ngos/${id}`),
  create: (d) => api.post('/ngos', d),
  update: (id, d) => api.put(`/ngos/${id}`, d),
  approve: (id, d) => api.put(`/ngos/${id}/approve`, d),
  setTier: (id, d) => api.put(`/ngos/${id}/tier`, d),
  toggleBlock: (id) => api.put(`/ngos/${id}/block`),
  delete: (id) => api.delete(`/ngos/${id}`),
  addDocument: (d) => api.post('/ngos/documents', d),
  verifyDocument: (id, d) => api.put(`/ngos/${id}/documents/verify`, d),
  markAttendance: (ngoId, eventId, d) => api.post(`/ngos/${ngoId}/attendance/${eventId}`, d),
  getAttendance: (ngoId, eventId) => api.get(`/ngos/${ngoId}/attendance/${eventId}`),
  expressInterest: (id, d) => api.post(`/ngos/${id}/volunteer-interest`, d),
  getInterests: (id) => api.get(`/ngos/${id}/volunteer-interests`),
  updateInterest: (id, d) => api.put(`/admin/volunteer-interests/${id}`, d),
  addNeed: (id, d) => api.post(`/ngos/${id}/needs`, d),
  deleteNeed: (id, needId) => api.delete(`/ngos/${id}/needs/${needId}`),
  getMyAttendance: (ngoId, eventId) => api.get(`/ngos/${ngoId}/my-attendance/${eventId}`),
};

export const donationAPI = {
  create: (d) => api.post('/donations', d),
  getMy: () => api.get('/donations/my'),
  getNGODonations: (id) => api.get(`/donations/ngo/${id}`),
};

export const statsAPI = { get: () => api.get('/stats') };

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  updateInterest: (id, d) => api.put(`/admin/volunteer-interests/${id}`, d),
};

export const volunteerAPI = {
  getAll: () => api.get('/volunteers'),
  register: () => api.post('/volunteers/register'),
};

export const eventAPI = {
  getAll: (p) => api.get('/events', { params: p }),
  getMyNGO: () => api.get('/events/my-ngo'),
  getOne: (id) => api.get(`/events/${id}`),
  create: (d) => api.post('/events', d),
  update: (id, d) => api.put(`/events/${id}`, d),
  apply: (id) => api.post(`/events/${id}/apply`),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getChat: (userId) => api.get(`/messages/${userId}`),
  send: (d) => api.post('/messages', d),
  getUnreadCount: () => api.get('/messages/unread/count'),
};


export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  create: (d) => api.post('/feedback', d),
};

export const opportunityAPI = {
  getAll: (p) => api.get('/opportunities', { params: p }),
  getMyNGO: () => api.get('/opportunities/my-ngo'),
  getMyApplications: () => api.get('/opportunities/my-applications'),
  getOne: (id) => api.get(`/opportunities/${id}`),
  create: (d) => api.post('/opportunities', d),
  update: (id, d) => api.put(`/opportunities/${id}`, d),
  delete: (id) => api.delete(`/opportunities/${id}`),
  apply: (id, d) => api.post(`/opportunities/${id}/apply`, d),
  updateApplication: (oppId, appId, d) => api.put(`/opportunities/${oppId}/applications/${appId}`, d),
};

export default api;
