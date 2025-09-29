import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Stations from "@/pages/stations";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const typedUser = user as User;

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : !typedUser?.companyId ? (
        // Authenticated but no company - redirect to registration
        <>
          <Route path="/register" component={Register} />
          <Route path="/" component={Register} />
        </>
      ) : (
        // Fully registered user
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/stations" component={Stations} />
          <Route path="/users" component={Users} />
          <Route path="/register" component={Register} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
