"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type RoleContextType = {
  role: string;
  setRole: (role: string) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState("admin");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
