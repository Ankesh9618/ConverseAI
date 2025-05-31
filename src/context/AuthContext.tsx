
"use client";

import type { User, AuthError } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<User | AuthError>;
  logIn: (email: string, password: string) => Promise<User | AuthError>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !currentUser && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    } else if (!loading && currentUser && (pathname === "/login" || pathname === "/signup")) {
      router.push("/");
    }
  }, [currentUser, loading, router, pathname]);

  const signUp = async (email: string, password: string): Promise<User | AuthError> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    }
  };

  const logIn = async (email: string, password: string): Promise<User | AuthError> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setCurrentUser(null); // Ensure state updates immediately
    router.push("/login"); // Redirect to login after logout
  };

  const value = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
  };

  // Prevent rendering children until loading is false and auth state is determined
  // or if user is on login/signup page (to avoid redirect loops during initial load)
  if (loading && pathname !== "/login" && pathname !== "/signup") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Loading application...</p>
      </div>
    );
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
