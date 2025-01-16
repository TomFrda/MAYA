import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  userInfo: any;
  user: {
    id: string;
    profilePhotos?: string[];
  } | null;
  login: (token: string, userInfo: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userInfo: null,
  user: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState<any>(JSON.parse(localStorage.getItem('userInfo') || 'null'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken: string, userInfo: any) => {
    setToken(newToken);
    setUserInfo(userInfo);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        userInfo, 
        user: userInfo ? {
          id: userInfo.id,
          profilePhotos: userInfo.profilePhotos
        } : null,
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};