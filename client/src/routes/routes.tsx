// Router.tsx
import { Switch, Route, Redirect } from "wouter";
import useAuth from "@/hooks/use-auth";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Auth from "@/pages/auth";
import Download from "@/pages/download";
import NotFound from "@/pages/not-found";

export default function Router() {
  const { isAuth, loading } = useAuth();

  if (loading) {
    // Skeleton loader while auth state is initializing
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuth ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>

      <Route path="/dashboard">
        {isAuth ? <Dashboard /> : <Redirect to="/auth" />}
      </Route>

      <Route path="/auth">
        {isAuth ? <Redirect to="/dashboard" /> : <Auth />}
      </Route>

      <Route path="/download/:id" component={Download} />

      <Route component={NotFound} />
    </Switch>
  );
}
