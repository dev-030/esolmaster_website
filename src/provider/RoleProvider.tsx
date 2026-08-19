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
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await getMe();
        setRole(userData.role);
        setUser(userData);
      } catch (error: any) {
        setRole(null);
        setUser(null);
        if (typeof window !== 'undefined') {
          if (error?.response?.status === 401) {
            window.location.href = '/login?clearAuth=true';
          } else {
            setIsOffline(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  if (isOffline) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Cannot Connect to Server</h2>
          <p className="text-sm text-slate-500">The backend server is currently offline or unreachable. Please make sure the backend is running.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium w-full">Retry Connection</button>
        </div>
      </div>
    );
  }

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
