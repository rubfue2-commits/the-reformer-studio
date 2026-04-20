import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const choose = (lang: 'fr' | 'en') => {
    setLanguage(lang);
    navigate('/auth');
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(180deg, #0F0F0F 0%, #141414 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px',
      textAlign: 'center',
    }}>

      {/* Gold line */}
      <div style={{ width: 40, height: 2, background: 'var(--ios-gold)', borderRadius: 2, marginBottom: 32 }} />

      {/* Logo */}
      <p style={{
        fontFamily: 'DM Sans',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ios-gold)',
        letterSpacing: 4,
        textTransform: 'uppercase',
        margin: '0 0 8px',
      }}>
        THE REFORMER
      </p>
      <h1 style={{
        fontFamily: 'Cormorant Garamond',
        fontSize: 56,
        fontWeight: 300,
        color: '#fff',
        margin: '0 0 6px',
        letterSpacing: -1,
      }}>
        Studio
      </h1>
      <p style={{
        fontFamily: 'DM Sans',
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: 2,
        margin: '0 0 56px',
        textTransform: 'uppercase',
      }}>
        Pilates &amp; Wellness
      </p>

      {/* Language cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
        {[
          { lang: 'fr' as const, flag: '🇫🇷', label: 'Français', sub: 'Continuer en français' },
          { lang: 'en' as const, flag: '🇬🇧', label: 'English', sub: 'Continue in English' },
        ].map(({ lang, flag, label, sub }) => (
          <button
            key={lang}
            onClick={() => choose(lang)}
            className="ios-pressable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              padding: '18px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: 32, flexShrink: 0 }}>{flag}</span>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 22, fontWeight: 400, color: '#fff', margin: '0 0 2px' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {sub}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--ios-gold)', fontSize: 18 }}>›</div>
          </button>
        ))}
      </div>

      <p style={{
        fontFamily: 'DM Sans',
        fontSize: 11,
        color: 'rgba(255,255,255,0.2)',
        marginTop: 48,
        letterSpacing: 0.5,
      }}>
        You can change this later in your profile
      </p>

      {/* Bottom gold line */}
      <div style={{ width: 40, height: 2, background: 'var(--ios-gold)', borderRadius: 2, marginTop: 40, opacity: 0.4 }} />
    </div>
  );
}
