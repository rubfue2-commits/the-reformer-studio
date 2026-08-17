import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./ProtectedRoute";
import PageTransition from "./PageTransition";

import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import VideoLibrary from "@/pages/VideoLibrary";
import Programs from "@/pages/Programs";
import Wellness from "@/pages/Wellness";
import Measurements from "@/pages/Measurements";
import Profile from "@/pages/Profile";
import Achievements from "@/pages/Achievements";
import Notifications from "@/pages/Notifications";
import Referral from "@/pages/Referral";
import DeleteAccount from "@/pages/DeleteAccount";
import CGV from "@/pages/CGV";
import Onboarding from "@/pages/Onboarding";
import Subscription from "@/pages/Subscription";
import Preferences from "@/pages/Preferences";
import Support from "@/pages/Support";
import Planner from "@/pages/Planner";
import NotFound from "@/pages/NotFound";
import LanguageSelect from "@/pages/LanguageSelect";

const P = ({ children }: { children: React.ReactNode }) => (
  <PageTransition>{children}</PageTransition>
);

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<P><Auth /></P>} />
        <Route path="/language" element={<P><LanguageSelect /></P>} />
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={<ProtectedRoute><P><Home /></P></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><P><VideoLibrary /></P></ProtectedRoute>} />
        <Route path="/programs" element={<ProtectedRoute><P><Programs /></P></ProtectedRoute>} />
        <Route path="/wellness" element={<ProtectedRoute><P><Wellness /></P></ProtectedRoute>} />
        <Route path="/measurements" element={<ProtectedRoute><P><Measurements /></P></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><P><Profile /></P></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><P><Achievements /></P></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><P><Notifications /></P></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><P><Referral /></P></ProtectedRoute>} />
        <Route path="/delete-account" element={<ProtectedRoute><P><DeleteAccount /></P></ProtectedRoute>} />
        <Route path="/cgv" element={<ProtectedRoute><P><CGV /></P></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><P><Onboarding /></P></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><P><Subscription /></P></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><P><Preferences /></P></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><P><Support /></P></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><P><Planner /></P></ProtectedRoute>} />

        <Route path="*" element={<P><NotFound /></P>} />
      </Routes>
    </AnimatePresence>
  );
}
