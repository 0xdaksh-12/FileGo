import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import Router from "@/routes/routes";
import { useAuthStore } from "@/store/useAuthStore";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Analytics } from "@vercel/analytics/react";

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <TooltipProvider>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Router />
        <Analytics />
      </TooltipProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
