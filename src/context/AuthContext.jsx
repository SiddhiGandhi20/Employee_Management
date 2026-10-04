/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

// .NET writes ClaimTypes.* as long URIs inside the JWT
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// read the user out of the JWT payload; null if missing / broken / expired
export function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    const p = JSON.parse(json);
    if (p.exp && p.exp * 1000 < Date.now()) return null;
    return {
      username: p[NAME_CLAIM] || p.unique_name || p.name || '',
      role: p[ROLE_CLAIM] || p.role || 'User',
    };
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const u = token ? decodeToken(token) : null;
    if (!u) localStorage.removeItem('token');
    return u;
  });

  const login = (token) => {
    const u = decodeToken(token);
    if (!u) throw new Error('Invalid token received from server');
    localStorage.setItem('token', token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
