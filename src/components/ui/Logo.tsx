import { LogoMark } from './LogoMark'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  /** horizontal = icon + text side by side (sidebar, nav)
   *  stacked    = icon above text (login, onboarding hero) */
  variant?: 'horizontal' | 'stacked'
}

const config = {
  sm: { mark: 22, iconBox: 32, iconRx: 9,  textSize: 14, subSize: 10 },
  md: { mark: 28, iconBox: 40, iconRx: 11, textSize: 16, subSize: 11 },
  lg: { mark: 38, iconBox: 56, iconRx: 14, textSize: 22, subSize: 13 },
}

export function Logo({ size = 'md', variant = 'horizontal' }: LogoProps) {
  const c = config[size]
  const isStacked = variant === 'stacked'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isStacked ? 'column' : 'row',
      alignItems: 'center',
      gap: isStacked ? 10 : 10,
    }}>
      {/* Icon mark */}
      <div style={{
        width: c.iconBox,
        height: c.iconBox,
        borderRadius: c.iconRx,
        background: 'linear-gradient(135deg, #3b1f7a 0%, #1e3a6e 100%)',
        border: '1px solid rgba(124,58,237,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
      }}>
        <LogoMark size={c.mark} />
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: isStacked ? 'center' : 'left' }}>
        <p style={{
          fontSize: c.textSize,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {/* "IB" plain white, "Mentor AI" gradient */}
          <span style={{ color: 'white' }}>IB </span>
          <span style={{
            background: 'linear-gradient(90deg, #a78bfa, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Mentor AI
          </span>
        </p>
        {isStacked && (
          <p style={{ fontSize: c.subSize, color: '#475569', margin: '4px 0 0', fontWeight: 400 }}>
            Your personalised IB study companion
          </p>
        )}
      </div>
    </div>
  )
}
