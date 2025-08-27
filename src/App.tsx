
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import ScheduledShifts from "./pages/ScheduledShifts";
import NotFound from "./pages/NotFound";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <RoleProvider>
                <SidebarProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute>
                          <Calendar />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/team"
                      element={
                        <ProtectedRoute>
                          <Team />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/scheduled-shifts"
                      element={
                        <ProtectedRoute>
                          <ScheduledShifts />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarProvider>
              </RoleProvider>
            </AuthProvider>
          </BrowserRouter>
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
