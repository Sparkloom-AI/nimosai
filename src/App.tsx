import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Team from "./pages/Team";
import ScheduledShifts from "./pages/ScheduledShifts";
import Locations from "./pages/Locations";
import Services from "./pages/Services";
import Packages from "./pages/Packages";
import SettingsOverview from "./pages/settings/index";
import SettingsBusinessProfile from "./pages/settings/business-profile";
import SettingsLocations from "./pages/settings/locations";
import SettingsAppointments from "./pages/settings/appointments";
import SettingsPayments from "./pages/settings/payments";
import SettingsCommunication from "./pages/settings/communication";
import SettingsTeam from "./pages/settings/team";
import SettingsIntegrations from "./pages/settings/integrations";
import SettingsAdvanced from "./pages/settings/advanced";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";

import OnboardingStudio from "./pages/OnboardingStudio";
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
          <AuthProvider>
            <RoleProvider>
              <SidebarProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/onboarding/studio" element={<OnboardingStudio />} />
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
                    path="/clients"
                    element={
                      <ProtectedRoute>
                        <Clients />
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
                    path="/services"
                    element={
                      <ProtectedRoute>
                        <Services />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/packages"
                    element={
                      <ProtectedRoute>
                        <Packages />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsOverview />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/business-profile"
                    element={
                      <ProtectedRoute>
                        <SettingsBusinessProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/locations"
                    element={
                      <ProtectedRoute>
                        <SettingsLocations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/appointments"
                    element={
                      <ProtectedRoute>
                        <SettingsAppointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/payments"
                    element={
                      <ProtectedRoute>
                        <SettingsPayments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/communication"
                    element={
                      <ProtectedRoute>
                        <SettingsCommunication />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/team"
                    element={
                      <ProtectedRoute>
                        <SettingsTeam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/integrations"
                    element={
                      <ProtectedRoute>
                        <SettingsIntegrations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/advanced"
                    element={
                      <ProtectedRoute>
                        <SettingsAdvanced />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarProvider>
            </RoleProvider>
          </AuthProvider>
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;