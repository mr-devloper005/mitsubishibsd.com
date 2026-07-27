import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surfaces (archive + detail).

  Every task shares one cohesive editorial identity: warm cream surfaces, the
  signature lime accent, hairline borders, and the Plus Jakarta Sans / DM Sans
  pairing used across the site. Per-task copy (kicker / note) still varies so
  each section keeps a little voice, but the visual language is unified.
  Tokens are delivered via CSS variables (`--tk-*`).

  NOTE: `onAccent` must stay dark — the lime accent is a light color, so light
  text on it would fail contrast.
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const FONT_DISPLAY = "'Plus Jakarta Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const FONT_BODY = "'DM Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

// Shared palette — every task inherits this; only kicker/note differ.
const base = {
  dark: false,
  fontDisplay: FONT_DISPLAY,
  fontBody: FONT_BODY,
  bg: '#f0ece5',
  surface: '#faf8f3',
  raised: '#e8e4db',
  text: '#0d0d0d',
  muted: '#6b6560',
  line: '#d8d3ca',
  accent: '#a8ff5c',
  accentSoft: '#dcffb0',
  onAccent: '#0d0d0d',
  glow: 'rgba(168,255,92,0.10)',
  radius: '1rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'In-depth reads, guides and stories worth your time.' },
  listing: { ...base, kicker: 'Businesses', note: 'Find, compare and connect with local businesses.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers and listings, ready to act on.' },
  image: { ...base, kicker: 'Portfolio', note: 'A visual feed of standout images and creative galleries.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated resources and links worth saving.' },
  pdf: { ...base, kicker: 'Documents', note: 'Downloadable guides, reports and references.' },
  profile: { ...base, kicker: 'Talent', note: 'Discover independent creators and their work.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's accent instead of the global site accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
