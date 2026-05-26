export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lm-grad" x1="6" y1="6" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ede9fe" />
          <stop offset="0.35" stopColor="#a78bfa" />
          <stop offset="0.75" stopColor="#6366f1" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* 3 full-length bars crossing at center — clean Claude-style asterisk */}
      <rect x="24.5" y="5" width="7" height="46" rx="3.5"
        fill="url(#lm-grad)" />
      <rect x="24.5" y="5" width="7" height="46" rx="3.5"
        fill="url(#lm-grad)" opacity="0.72" transform="rotate(60 28 28)" />
      <rect x="24.5" y="5" width="7" height="46" rx="3.5"
        fill="url(#lm-grad)" opacity="0.48" transform="rotate(120 28 28)" />
    </svg>
  )
}
