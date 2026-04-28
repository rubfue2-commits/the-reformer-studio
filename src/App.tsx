import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LanguageSelect from "./pages/LanguageSelect";
import Auth from "./pages/Auth";
import CGV from "./pages/CGV";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import Home from "./pages/Home";
import VideoLibrary from "./pages/VideoLibrary";
import Planner from "./pages/Planner";
import Programs from "./pages/Programs";
import Measurements from "./pages/Measurements";
import Profile from "./pages/Profile";
import Referral from "./pages/Referral";
import DeleteAccount from "./pages/DeleteAccount";
import CGV from "./pages/CGV";
import Achievements from "./pages/Achievements";
import Programs from "./pages/Programs";
import Wellness from "./pages/Wellness";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/language" replace />} />
              <Route path="/language" element={<LanguageSelect />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/onboarding"    element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/subscription"  element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/home"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/library"       element={<ProtectedRoute><VideoLibrary /></ProtectedRoute>} />
              <Route path="/programs"      element={<ProtectedRoute><Programs /></ProtectedRoute>} />
              <Route path="/planner"       element={<ProtectedRoute><Planner /></ProtectedRoute>} />
              <Route path="/progress"      element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/wellness"      element={<ProtectedRoute><Wellness /></ProtectedRoute>} />
              <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/referral"      element={<ProtectedRoute><Referral /></ProtectedRoute>} />
              <Route path="/achievements"  element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="*"              element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
