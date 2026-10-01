import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.currentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await authService.register(payload);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginHospital = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.loginHospital(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerHospital = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await authService.registerHospital(payload);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    loginHospital,
    registerHospital,
    logout,
    isAuthenticated: Boolean(user),
    isDonor: user?.role === 'donor',
    isHospital: user?.role === 'hospital',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuth };