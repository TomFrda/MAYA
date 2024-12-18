import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  userInfo: any | null;
  login: (token: string, userInfo: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userInfo: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState<any>(JSON.parse(localStorage.getItem('userInfo') || 'null'));

  const login = (newToken: string, userInfo: any) => {
    setToken(newToken);
    setUserInfo(userInfo);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ token, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};