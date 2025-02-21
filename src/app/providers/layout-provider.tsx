"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const LayoutContext = createContext({
  sidebarOpen: false,
  toggleSidebar: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return <LayoutContext.Provider value={{ sidebarOpen, toggleSidebar }}>{children}</LayoutContext.Provider>;
}

// Custom hook to use the layout context
export function useLayout() {
  return useContext(LayoutContext);
}
