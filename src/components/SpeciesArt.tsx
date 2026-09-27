import { cn } from '@/lib/utils'
import type { Species } from '@/lib/types'

const PALETTE: Record<Species['image'], { bg: string; fg: string; accent: string }> = {
  lobster: { bg: '#FDECEA', fg: '#C8423A', accent: '#E87467' },
  crab: { bg: '#FFF1E5', fg: '#D36A2A', accent: '#F09A5F' },
  scallop: { bg: '#FBF3E4', fg: '#B98A3E', accent: '#E0BD7B' },
  fish: { bg: '#E7F2F8', fg: '#2E6F95', accent: '#6CA8C9' },
  oyster: { bg: '#EEF1F4', fg: '#5E6E80', accent: '#A4B1BF' },
}

function Art({ kind, fg, accent }: { kind: Species['image']; fg: string; accent: string }) {
  switch (kind) {
    case 'lobster':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 18 C20 10 14 6 8 6 M36 18 C44 10 50 6 56 6" stroke={accent} strokeWidth="1.4" fill="none" />
          <path d="M27 24 L20 18 M37 24 L44 18" stroke={fg} strokeWidth="3" fill="none" />
          <path d="M20 18 C12 18 10 10 14 6 C16 10 19 11 21 10 C22 13 22 16 20 18Z" fill={fg} />
          <path d="M44 18 C52 18 54 10 50 6 C48 10 45 11 43 10 C42 13 42 16 44 18Z" fill={fg} />
          <ellipse cx="32" cy="29" rx="7" ry="10" fill={fg} />
          <path d="M26 30 L20 33 M26 34 L21 38 M38 30 L44 33 M38 34 L43 38" stroke={fg} strokeWidth="1.6" fill="none" />
          <rect x="26.5" y="38" width="11" height="5" rx="2.5" fill={fg} />
          <rect x="27.5" y="43.5" width="9" height="4.5" rx="2.25" fill={fg} />
          <rect x="28.5" y="48.5" width="7" height="4" rx="2" fill={fg} />
          <path d="M32 52 C26 54 24 58 25 60 C28 58 30 58 32 58 C34 58 36 58 39 60 C40 58 38 54 32 52Z" fill={accent} />
          <circle cx="29.5" cy="21.5" r="1" fill="#fff" />
          <circle cx="34.5" cy="21.5" r="1" fill="#fff" />
        </g>
      )
    case 'crab':
      return (
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M20 36 L10 30 L6 36 M20 40 L9 40 L6 47 M22 44 L13 49 L12 56 M44 36 L54 30 L58 36 M44 40 L55 40 L58 47 M42 44 L51 49 L52 56" stroke={accent} strokeWidth="2" />
          <path d="M24 30 L18 20 M40 30 L46 20" stroke={fg} strokeWidth="2.6" />
          <path d="M18 20 C11 19 10 11 15 9 C15 13 18 14 20 13 C21 16 20 19 18 20Z" fill={fg} />
          <path d="M46 20 C53 19 54 11 49 9 C49 13 46 14 44 13 C43 16 44 19 46 20Z" fill={fg} />
          <ellipse cx="32" cy="38" rx="14" ry="10" fill={fg} />
          <path d="M26 35 C29 37 35 37 38 35" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
          <circle cx="28.5" cy="29" r="1.6" fill={fg} />
          <circle cx="35.5" cy="29" r="1.6" fill={fg} />
        </g>
      )
    case 'scallop':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 50 C18 48 10 38 11 28 C12 18 21 12 32 12 C43 12 52 18 53 28 C54 38 46 48 32 50Z" fill={fg} />
          <path d="M26 50 L24 55 L40 55 L38 50Z" fill={accent} />
          <path d="M32 49 L32 14 M32 49 L22 16 M32 49 L42 16 M32 49 L15 22 M32 49 L49 22 M32 49 L12 31 M32 49 L52 31" stroke="#fff" strokeOpacity=".32" strokeWidth="1.5" fill="none" />
        </g>
      )
    case 'fish':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 32 C16 20 32 18 44 26 L56 18 C54 26 54 38 56 46 L44 38 C32 46 16 44 8 32Z" fill={fg} />
          <path d="M18 26 C22 24 24 28 28 26 C32 24 34 28 38 26 M20 30 C24 28 26 32 30 30 C34 28 36 32 40 30" stroke={accent} strokeWidth="1.6" fill="none" />
          <path d="M14 36 C22 41 34 41 42 36" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" fill="none" />
          <circle cx="15" cy="30" r="1.8" fill="#fff" />
        </g>
      )
    case 'oyster':
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 38 C10 28 16 14 30 12 C44 10 54 20 52 32 C50 44 40 52 28 50 C21 49 16 45 14 38Z" fill={fg} />
          <path d="M20 36 C18 28 23 19 32 18 C41 17 46 24 45 32 C44 40 37 45 29 44 C24 43 21 40 20 36Z" fill={accent} />
          <path d="M26 34 C25 29 28 25 33 25 C38 25 40 29 39 33 C38 37 34 39 30 38" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" fill="none" />
          <circle cx="33" cy="31" r="2.6" fill="#fff" fillOpacity=".9" />
        </g>
      )
  }
}

export function SpeciesArt({ kind, size = 48, className, rounded = 'rounded-xl' }: { kind: Species['image']; size?: number; className?: string; rounded?: string }) {
  const p = PALETTE[kind]
  return (
    <div className={cn('grid shrink-0 place-items-center', rounded, className)} style={{ width: size, height: size, background: p.bg }}>
      <svg viewBox="0 0 64 64" width={size * 0.78} height={size * 0.78} aria-hidden>
        <Art kind={kind} fg={p.fg} accent={p.accent} />
      </svg>
    </div>
  )
}
