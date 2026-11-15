import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('jobtrack_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('jobtrack_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [initializing, setInitializing] = useState(() => Boolean(localStorage.getItem('jobtrack_token')));

  const persistSession = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('jobtrack_token', nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      localStorage.setItem('jobtrack_user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jobtrack_token');
    localStorage.removeItem('jobtrack_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('jobtrack:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('jobtrack:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    let active = true;
    const verifySession = async () => {
      if (!token) {
        if (active) setInitializing(false);
        return;
      }
      try {
        const profile = await userService.getProfile();
        if (active) {
          persistSession(token, profile);
        }
      } catch {
        if (active) {
          logout();
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };
    verifySession();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await authService.login(credentials);
      persistSession(response.token, response.user);
      return response;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const response = await authService.register(payload);
      persistSession(response.token, response.user);
      return response;
    },
    [persistSession]
  );

  const updateUserSession = useCallback(
    (updatedProfile) => {
      const nextToken = updatedProfile.accessToken || token;
      const sanitizedProfile = { ...updatedProfile };
      delete sanitizedProfile.accessToken;
      persistSession(nextToken, sanitizedProfile);
    },
    [persistSession, token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      initializing,
      login,
      register,
      logout,
      updateUserSession,
    }),
    [user, token, initializing, login, register, logout, updateUserSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
