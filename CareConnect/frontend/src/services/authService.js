import { authAPI } from '../api/authAPI';
import { hospitalAuthAPI } from '../api/hospitalAuthAPI';
import { decodeJwtPayload } from '../utils/jwt';

function userFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return { id: payload.id, email: payload.sub, role: payload.role || 'donor' };
}

function storeToken(token) {
  if (token) localStorage.setItem('bloodlink_token', token);
}

export const authService = {
  async login(email, password) {
    const { data } = await authAPI.login(email, password);
    storeToken(data.access_token);
    return { ...data, user: userFromToken(data.access_token) };
  },

  async register(payload) {
    const { data } = await authAPI.register(payload);
    storeToken(data.access_token);
    return { ...data, user: data.access_token ? userFromToken(data.access_token) : null };
  },

  async loginHospital(email, password) {
    const { data } = await hospitalAuthAPI.login(email, password);
    storeToken(data.access_token);
    return { ...data, user: userFromToken(data.access_token) };
  },

  async registerHospital(payload) {
    const { data } = await hospitalAuthAPI.register(payload);
    storeToken(data.access_token);
    return { ...data, user: data.access_token ? userFromToken(data.access_token) : null };
  },

  logout() {
    localStorage.removeItem('bloodlink_token');
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('bloodlink_token'));
  },

  currentUser() {
    const token = localStorage.getItem('bloodlink_token');
    if (!token) return null;
    return userFromToken(token);
  },
};