// Composant Logo fidèle au branding Connect Reformer
// Deux barres obliques (noir + or) + CONNECT noir + REFORMER or
// Fond crème #F5F0E8

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon";
  className?: string;
}

const Logo = ({ size = "md", variant = "full", className = "" }: LogoProps) => {
  const configs = {
    sm: { width: 110, height: 28, barW: 5, barH: 20, barGap: 6, offsetX: 4, textSize: 9, gap: 8 },
    md: { width: 160, height: 40, barW: 7, barH: 29, barGap: 8, offsetX: 6, textSize: 13, gap: 12 },
    lg: { width: 220, height: 54, barW: 9, barH: 40, barGap: 11, offsetX: 8, textSize: 18, gap: 16 },
    xl: { width: 300, height: 74, barW: 12, barH: 54, barGap: 15, offsetX: 10, textSize: 24, gap: 22 },
  };

  const c = configs[size];
  const iconOnly = variant === "icon";
  const iconWidth = c.offsetX + c.barW + c.barGap + c.barW + 2;
  const totalWidth = iconOnly ? iconWidth : c.width;

  return (
    <svg
      width={totalWidth}
      height={c.height}
      viewBox={`0 0 ${totalWidth} ${c.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Connect Reformer"
    >
      {/* Barre gauche — noir */}
      <rect
        x={c.offsetX}
        y={(c.height - c.barH) / 2 + 2}
        width={c.barW}
        height={c.barH}
        rx={c.barW / 2}
        fill="#1C1B19"
        transform={`rotate(-12 ${c.offsetX + c.barW / 2} ${c.height / 2 + 2})`}
      />
      {/* Barre droite — or */}
      <rect
        x={c.offsetX + c.barW + c.barGap}
        y={(c.height - c.barH) / 2}
        width={c.barW}
        height={c.barH}
        rx={c.barW / 2}
        fill="#B8973E"
        transform={`rotate(-12 ${c.offsetX + c.barW + c.barGap + c.barW / 2} ${c.height / 2})`}
      />

      {/* Texte — uniquement si variant="full" */}
      {!iconOnly && (
        <>
          {/* CONNECT */}
          <text
            x={iconWidth + c.gap}
            y={c.height / 2 - 2}
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontSize={c.textSize}
            fontWeight="300"
            letterSpacing={c.textSize * 0.18}
            fill="#1C1B19"
            dominantBaseline="middle"
            textAnchor="start"
          >
            CONNECT
          </text>
          {/* REFORMER */}
          <text
            x={iconWidth + c.gap}
            y={c.height / 2 + c.textSize * 1.2}
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontSize={c.textSize * 0.85}
            fontWeight="300"
            letterSpacing={c.textSize * 0.22}
            fill="#B8973E"
            dominantBaseline="middle"
            textAnchor="start"
          >
            REFORMER
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;
