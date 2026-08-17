import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import { scheduleWorkoutReminder } from "./lib/workoutReminder";
import { initTheme } from "./lib/theme";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AnimatedRoutes from "./components/AnimatedRoutes";

function App() {
  useEffect(() => { scheduleWorkoutReminder(); initTheme(); }, []);

  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <LanguageProvider>
            <AnimatedRoutes />
          </LanguageProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
