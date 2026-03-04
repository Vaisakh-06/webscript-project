import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('teamFinderUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // NEW: Initialize token from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem('teamFinderToken') || null;
  });

  // NEW: Accept both userData and jwtToken
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('teamFinderUser', JSON.stringify(userData));
    localStorage.setItem('teamFinderToken', jwtToken); 
  };

  // NEW: Clear both user and token on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('teamFinderUser');
    localStorage.removeItem('teamFinderToken');
  };

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('teamFinderUser', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    // Expose the token to the rest of the app!
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};