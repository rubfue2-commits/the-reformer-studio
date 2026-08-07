import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import AppIcon from "@/components/AppIcon";

// Pages qui affichent la bottom nav
const TABS = [
  { path: '/home',     icon: '⌂', icon_active: '⌂', label_fr: 'Accueil',   label_en: 'Home'     },
  { path: '/library',  icon: '▶', icon_active: '▶', label_fr: 'Séances',   label_en: 'Sessions' },
  { path: '/progress', icon: '◈', icon_active: '◈', label_fr: 'Progrès',   label_en: 'Progress' },
  { path: '/profile',  icon: '◉', icon_active: '◉', label_fr: 'Profil',    label_en: 'Profile'  },
];

const PAGES_WITH_TABAR = ['/home', '/library', '/progress', '/profile', '/wellness', '/planner', '/programs', '/notifications'];
const PAGES_WITHOUT_STATUSBAR = ['/language'];
const PAGES_FULLSCREEN = ['/language', '/auth', '/onboarding', '/subscription'];

interface IOSLayoutProps {
  children: ReactNode;
}

export function IOSLayout({ children }: IOSLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const path = location.pathname;

  const showTabBar = PAGES_WITH_TABAR.some(p => path.startsWith(p));
  const showStatusBar = !PAGES_WITHOUT_STATUSBAR.some(p => path.startsWith(p));
  const isFullscreen = PAGES_FULLSCREEN.some(p => path.startsWith(p));

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  return (
    <div className="ios-shell">
      {/* iOS Status Bar */}
      {showStatusBar && (
        <div className="ios-status-bar">
          <span className="ios-status-time">{new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,'0')}</span>
          <div className="ios-status-icons">
            <span>●●●</span>
            <span>WiFi</span>
            <AppIcon name="battery" size={16} color="currentColor" />
          </div>
        </div>
      )}

      {/* Page Content */}
      <div
        className="ios-content"
        style={{
          paddingTop: showStatusBar ? '44px' : '0',
          paddingBottom: showTabBar ? '83px' : '0',
        }}
      >
        {children}
      </div>

      {/* iOS Tab Bar */}
      {showTabBar && (
        <div className="ios-tabbar">
          <div className="ios-tabbar-blur" />
          {TABS.map(tab => {
            const isActive = path.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`ios-tab-item ${isActive ? 'active' : ''}`}
              >
                <span className="ios-tab-icon">{tab.icon}</span>
                <span className="ios-tab-label">
                  {language === 'fr' ? tab.label_fr : tab.label_en}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
