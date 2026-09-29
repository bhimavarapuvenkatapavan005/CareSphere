import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: data => API.post('/auth/register', data),
  login: data => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: data => API.put('/users/profile', data),
};

// Doctors
export const doctorAPI = {
  apply: data => API.post('/doctors/apply', data),
  getAll: params => API.get('/doctors', { params }),
  getById: id => API.get(`/doctors/${id}`),
  getMyProfile: () => API.get('/doctors/my-profile'),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  getSlots: (id, date) => API.get(`/doctors/${id}/slots`, { params: { date } }),
  getReviews: id => API.get(`/doctors/${id}/reviews`),
};

// Appointments
export const appointmentAPI = {
  create: data => API.post('/appointments', data),
  getMy: () => API.get('/appointments/my'),
  getDoctorAppts: () => API.get('/appointments/doctor'),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status`, { status }),
  reschedule: (id, data) => API.put(`/appointments/${id}/reschedule`, data),
  cancel: id => API.delete(`/appointments/${id}`),
};

// Medical Records
export const recordAPI = {
  upload: data => API.post('/medical-records', data),
  getAll: params => API.get('/medical-records', { params }),
  delete: id => API.delete(`/medical-records/${id}`),
};

// Prescriptions
export const prescriptionAPI = {
  create: data => API.post('/prescriptions', data),
  getMy: () => API.get('/prescriptions/my'),
  getDoctorPrescriptions: () => API.get('/prescriptions/doctor'),
  getById: id => API.get(`/prescriptions/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: id => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  deleteRead: () => API.delete('/notifications/read'),
};

// Reviews
export const reviewAPI = {
  create: data => API.post('/reviews', data),
};

// Admin
export const adminAPI = {
  createUser: data => API.post('/admin/users/create', data),
  getUsers: () => API.get('/admin/users'),
  toggleUser: id => API.put(`/admin/users/${id}/toggle`),
  deleteUser: id => API.delete(`/admin/users/${id}`),
  getDoctors: () => API.get('/admin/doctors'),
  createDoctor: data => API.post('/admin/doctors/create', data),
  approveDoctor: id => API.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: id => API.put(`/admin/doctors/${id}/reject`),
  getAppointments: () => API.get('/admin/appointments'),
  getAnalytics: () => API.get('/admin/analytics'),
};

export default API;
