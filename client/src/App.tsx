import { Switch, Route, useLocation, useRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useSupabase } from "@/hooks/useSupabase";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Calories from "@/pages/Calories";
import Weight from "@/pages/Weight";
import Workouts from "@/pages/Workouts";
import Statistics from "@/pages/Statistics";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import { useEffect } from "react";

// Import the useBasePath hook
import { useBasePath } from './hooks/useBasePath';

function Router() {
  const [location] = useLocation();
  const { user, loading, signOut } = useSupabase();
  const { base, prependBase } = useBasePath();
  
  // Handle GitHub Pages base path
  useEffect(() => {
    // If we're at the root of the base path, redirect to home
    if (location === base) {
      window.history.replaceState({}, "", prependBase("/"));
    }
  }, [location, base]);
  
  // Non-protected routes
  if (location === "/" || location === base) {
    return <Auth />;
  }
  
  // Protected routes
  return (
    <AuthGuard>
      <Layout user={user} onSignOut={signOut}>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/calories" component={Calories} />
          <Route path="/weight" component={Weight} />
          <Route path="/workouts" component={Workouts} />
          <Route path="/statistics" component={Statistics} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
