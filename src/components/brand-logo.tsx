export function BrandLogo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-sm surface-blood shadow-sm shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Horns + M monogram */}
        <path
          d="M6 14 C6 8, 10 6, 13.5 8.5 C14.8 9.2, 16 11, 16 13 C16 11, 17.2 9.2, 18.5 8.5 C22 6, 26 8, 26 14"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* M letter with meat-inspired cut */}
        <path
          d="M8 22 L11.5 12.5 L16 18 L20.5 12.5 L24 22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* small dot for premium */}
        <circle cx="16" cy="24.5" r="1" fill="white" opacity="0.9" />
      </svg>
    </span>
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="leading-none">
      <span className="text-display text-xl tracking-tight">Монгол Мах</span>
      {!compact && <span className="mt-1 block eyebrow text-primary">premium meat co.</span>}
    </span>
  );
}
