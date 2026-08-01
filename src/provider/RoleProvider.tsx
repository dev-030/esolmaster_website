"use client";

import { getMe } from "@/api/auth/api";
import React, { createContext, useContext, useEffect, useState } from "react";

type Role = "admin" | "student" | "teacher";

interface User {
  sub: string;
  email: string;
  role: Role;
}
interface RoleContextType {
  role: Role | null;
  user: User | null;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  user: null,
  isLoading: true,
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await getMe();
        setRole(userData.role);
        setUser(userData);
      } catch (error) {
        setRole(null);
        setUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Prevent UI flashing: Don't render children until we know the role
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RoleContext.Provider value={{ role, user, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
