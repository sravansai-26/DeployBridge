import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User, getCurrentUser, setSession, clearSession, authenticateUser, createUser } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const authenticatedUser = authenticateUser(email, password);
    setIsLoading(false);

    if (authenticatedUser) {
      setSession(authenticatedUser.id);
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = createUser(email, name, password);
      setSession(newUser.id);
      setUser(newUser);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
