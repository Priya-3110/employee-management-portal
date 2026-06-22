import { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { TOKEN_KEY, USER_KEY } from '../utils/constants.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readStoredUser());

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: nextToken, user: nextUser } = response.data;

    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
