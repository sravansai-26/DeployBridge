import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import {
  User,
  getCurrentUser,
  setSession,
  clearSession,
  authenticateUser,
  createUser,
} from "@/lib/storage";

import { signInWithGooglePopup } from "@/lib/firebase"; // ⭐ Google login

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  googleLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on startup
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // -----------------------------
  // Email/Password Login
  // -----------------------------
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

  // -----------------------------
  // Register New User
  // -----------------------------
  const register = async (
    email: string,
    name: string,
    password: string
  ): Promise<boolean> => {
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

  // -----------------------------
  // LOGOUT (Google + Normal Users)
  // -----------------------------
  const logout = () => {
    clearSession();                    // remove session for normal users
    localStorage.removeItem("user");   // remove google user
    setUser(null);
  };

  // -----------------------------
  // GOOGLE LOGIN
  // -----------------------------
  const googleLogin = async (): Promise<boolean> => {
    try {
      const result = await signInWithGooglePopup();
      const g = result.user;

      const googleUser: User = {
        id: g.uid,
        email: g.email || "",
        name: g.displayName || "Google User",
        avatar: g.photoURL || "",
        createdAt: new Date().toISOString(),
      };

      // Save Google user so persistence works after refresh
      localStorage.setItem("user", JSON.stringify(googleUser));

      setUser(googleUser);
      return true;
    } catch (error) {
      console.error("Google Login Failed:", error);
      return false;
    }
  };

  // -----------------------------
  // Provide Auth values
  // -----------------------------
  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      googleLogin,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
