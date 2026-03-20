import { useEffect } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router";

export default function App() {
  // Caffeine adds caffeineAdminToken to the hash on clone, which the
  // router misinterprets as a route. Redirect to home if present.
  useEffect(() => {
    if (window.location.hash.includes("caffeineAdminToken")) {
      window.location.hash = "#/";
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
