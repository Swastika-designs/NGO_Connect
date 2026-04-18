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
  approve: (id) => api.put(`/ngos/${id}/approve`),
  delete: (id) => api.delete(`/ngos/${id}`),
  expressInterest: (id, d) => api.post(`/ngos/${id}/volunteer-interest`, d),
  getInterests: (id) => api.get(`/ngos/${id}/volunteer-interests`),
  updateInterest: (id, d) => api.put(`/admin/volunteer-interests/${id}`, d),
};

export const donationAPI = {
  create: (d) => api.post('/donations', d),
  getMy: () => api.get('/donations/my'),
  getNGODonations: (id) => api.get(`/donations/ngo/${id}`),
};

export const statsAPI = { get: () => api.get('/stats') };

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
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

export default api;
