import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import VideoLibrary from "./pages/VideoLibrary";
import Programs from "./pages/Programs";
import Wellness from "./pages/Wellness";
import Measurements from "./pages/Measurements";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Notifications from "./pages/Notifications";
import Referral from "./pages/Referral";
import DeleteAccount from "./pages/DeleteAccount";
import CGV from "./pages/CGV";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";
import LanguageSelect from "./pages/LanguageSelect";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/language" element={<LanguageSelect />} />
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Protected */}
            <Route path="/home"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/library"      element={<ProtectedRoute><VideoLibrary /></ProtectedRoute>} />
            <Route path="/programs"     element={<ProtectedRoute><Programs /></ProtectedRoute>} />
            <Route path="/wellness"     element={<ProtectedRoute><Wellness /></ProtectedRoute>} />
            <Route path="/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/referral"     element={<ProtectedRoute><Referral /></ProtectedRoute>} />
            <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
            <Route path="/cgv"          element={<ProtectedRoute><CGV /></ProtectedRoute>} />
            <Route path="/onboarding"   element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/planner"      element={<ProtectedRoute><Planner /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
