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
        {/* Diagonal gradient so every bar catches different hues */}
        <linearGradient id="ibm-g" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0c8ff" />
          <stop offset="0.35" stopColor="#a78bfa" />
          <stop offset="0.7"  stopColor="#6366f1" />
          <stop offset="1"    stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* 4 bars × 45° apart — rendered back→front so depth reads naturally */}

      {/* 135° — dimmest, furthest back */}
      <rect x="25.5" y="5" width="5" height="46" rx="2.5"
        fill="url(#ibm-g)" opacity="0.28" transform="rotate(135 28 28)" />

      {/* 45° */}
      <rect x="25.5" y="5" width="5" height="46" rx="2.5"
        fill="url(#ibm-g)" opacity="0.48" transform="rotate(45 28 28)" />

      {/* 90° — horizontal */}
      <rect x="25.5" y="5" width="5" height="46" rx="2.5"
        fill="url(#ibm-g)" opacity="0.68" transform="rotate(90 28 28)" />

      {/* 0° — vertical, brightest / front */}
      <rect x="25.5" y="5" width="5" height="46" rx="2.5"
        fill="url(#ibm-g)" />
    </svg>
  )
}
