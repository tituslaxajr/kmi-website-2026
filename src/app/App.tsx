import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { SiteImagesContext, useSiteImagesProvider } from "./hooks/useSiteImages";

function SiteImagesProvider({ children }: { children: React.ReactNode }) {
  const value = useSiteImagesProvider();
  return (
    <SiteImagesContext.Provider value={value}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        router.navigate("/admin/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AuthProvider>
      <SiteImagesProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </SiteImagesProvider>
    </AuthProvider>
  );
}