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
import Locations from "./pages/Locations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";
import TermsLayout from "./components/layout/TermsLayout";
import TermsOverview from "./pages/terms/Overview";
import TermsOfUse from "./pages/terms/TermsOfUse";
import PrivacyPolicy from "./pages/terms/PrivacyPolicy";
import TermsOfService from "./pages/terms/TermsOfService";
import TermsOfBusiness from "./pages/terms/TermsOfBusiness";
import DataProtection from "./pages/terms/DataProtection";
import CookiesPolicy from "./pages/terms/CookiesPolicy";
import ForgotPasswordForm from "./components/ui/forgot-password";

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
                    <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                    <Route path="/terms" element={<TermsLayout />}>
                      <Route index element={<TermsOverview />} />
                      <Route path="terms-of-use" element={<TermsOfUse />} />
                      <Route path="privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="terms-of-service" element={<TermsOfService />} />
                      <Route path="terms-of-business" element={<TermsOfBusiness />} />
                      <Route path="data-protection" element={<DataProtection />} />
                      <Route path="cookies" element={<CookiesPolicy />} />
                    </Route>
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
                    <Route
                      path="/locations"
                      element={
                        <ProtectedRoute>
                          <Locations />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
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