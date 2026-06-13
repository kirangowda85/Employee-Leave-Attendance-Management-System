import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      const payload = parseJwt(stored);
      if (payload) {
        const roles = payload.roles || payload.authorities || [];
        const roleStr = Array.isArray(roles)
          ? roles.map(r => (typeof r === 'string' ? r : r.authority || '')).join(',')
          : '';
        setUser({
          username: payload.sub || payload.username || 'User',
          role: roleStr.includes('ADMIN') ? 'ADMIN' : roleStr.includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE',
        });
        setToken(stored);
      }
    }
  }, []);

  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    const payload = parseJwt(jwtToken);
    if (payload) {
      const roles = payload.roles || payload.authorities || [];
      const roleStr = Array.isArray(roles)
        ? roles.map(r => (typeof r === 'string' ? r : r.authority || '')).join(',')
        : '';
      const userData = {
        username: payload.sub || payload.username || 'User',
        role: roleStr.includes('ADMIN') ? 'ADMIN' : roleStr.includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE',
      };
      setUser(userData);
      setToken(jwtToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isEmployee = user?.role === 'EMPLOYEE';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
