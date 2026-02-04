import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentPuntori, setCurrentPuntori] = useState(null);

  // Load saved Puntori from localStorage on mount
  useEffect(() => {
    const savedPuntori = localStorage.getItem('currentPuntori');
    if (savedPuntori) {
      try {
        setCurrentPuntori(JSON.parse(savedPuntori));
      } catch (error) {
        console.error('Error loading saved Puntori:', error);
        localStorage.removeItem('currentPuntori');
      }
    }
  }, []);

  const login = (puntori) => {
    setCurrentPuntori(puntori);
    localStorage.setItem('currentPuntori', JSON.stringify(puntori));
  };

  const logout = () => {
    setCurrentPuntori(null);
    localStorage.removeItem('currentPuntori');
  };

  const value = {
    currentPuntori,
    login,
    logout,
    isAuthenticated: !!currentPuntori,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

