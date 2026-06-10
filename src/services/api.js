import axios from 'axios';

const API = axios.create({
  baseURL: 'http://10.1.11.43:8080/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/profile/me');
export const updateProfile = (data) => API.put('/profile/me', data);
export const getEmergencyProfile = (id) => API.get(`/profile/emergency/${id}`);
export const changePassword = (data) => API.put('/account/change-password', data);
export const deleteAccount = () => API.delete('/account/delete');