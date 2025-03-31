import { Switch, Route, useLocation } from "wouter";
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

function Router() {
  const [location] = useLocation();
  const { user, loading, signOut } = useSupabase();
  
  // Non-protected routes
  if (location === "/") {
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
