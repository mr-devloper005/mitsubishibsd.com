import type { CSSProperties } from 'react'

export const editableRootStyle = {
  // WEMBS-inspired: lime green accent, warm cream body, teal sections, dark forest footer
  '--slot4-page-bg': '#f0ece5',
  '--slot4-page-text': '#0d0d0d',
  '--slot4-panel-bg': '#e8e4db',
  '--slot4-surface-bg': '#faf8f3',
  '--slot4-muted-text': '#6b6560',
  '--slot4-soft-muted-text': '#9a9590',
  '--slot4-accent': '#a8ff5c',
  '--slot4-accent-fill': '#a8ff5c',
  '--slot4-accent-soft': '#dcffb0',
  '--slot4-on-accent': '#0d0d0d',
  // Text-safe accent. The lime accent is a light color — as TEXT on cream it sits
  // at ~1.04:1 contrast (invisible). Use lime for fills/badges//dark backgrounds,
  // and this deep green for accent-colored text on light surfaces (6.6:1 on cream).
  '--slot4-accent-ink': '#355c14',
  '--slot4-dark-bg': '#18221e',
  '--slot4-dark-text': '#f0ece5',
  '--slot4-media-bg': '#d5d0c8',
  '--slot4-cream': '#f0ece5',
  '--slot4-warm': '#faf8f3',
  '--slot4-lavender': '#7db5bc',
  '--slot4-gray': '#e8e4db',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#f0ece5',
  '--editable-page-text': '#0d0d0d',
  '--editable-container': '1440px',
  '--editable-border': '#d8d3ca',
  '--editable-nav-bg': '#f0ece5',
  '--editable-nav-text': '#0d0d0d',
  '--editable-nav-active': '#a8ff5c',
  '--editable-nav-active-text': '#0d0d0d',
  '--editable-cta-bg': '#a8ff5c',
  '--editable-cta-text': '#0d0d0d',
  '--editable-search-bg': '#faf8f3',
  '--editable-footer-bg': '#18221e',
  '--editable-footer-text': '#f0ece5',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  // accentText is for use on DARK backgrounds only. On light surfaces use accentInk.
  accentText: 'text-[var(--slot4-accent)]',
  accentInk: 'text-[var(--slot4-accent-ink)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
  shadowStrong: 'shadow-[0_6px_24px_rgba(0,0,0,0.10)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.78))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12',
    sectionY: 'py-16 sm:py-20 lg:py-24',
  },
  layout: {
    safeGrid: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-2 lg:items-center',
    rail: 'flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[200px] shrink-0 snap-start sm:w-[240px]',
  },
  type: {
    eyebrow: 'text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent-ink)]',
    heroTitle: 'text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em]',
    sectionTitle: 'text-3xl font-black tracking-[-0.03em] sm:text-4xl',
    body: 'text-base leading-relaxed',
  },
  surface: {
    card: `overflow-hidden rounded-2xl border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `overflow-hidden rounded-2xl ${editablePalette.panelBg}`,
    dark: `overflow-hidden rounded-2xl ${editablePalette.darkBg} ${editablePalette.darkText}`,
  },
  button: {
    primary: `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-bold text-[var(--slot4-on-accent)] transition duration-200 hover:opacity-80 active:scale-[0.98]`,
    secondary: `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition duration-200 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)] active:scale-[0.98]`,
    accent: `inline-flex items-center justify-center gap-2 rounded-full ${editablePalette.accentBg} px-6 py-3 text-sm font-bold text-[var(--slot4-on-accent)] transition duration-200 hover:opacity-80 active:scale-[0.98]`,
  },
  media: {
    frame: `relative overflow-hidden rounded-2xl ${editablePalette.mediaBg}`,
    ratio: 'aspect-[3/4]',
  },
  motion: {
    lift: 'transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]',
    fade: 'transition duration-300 hover:opacity-75',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; all homepage sections consume those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so AI can redesign the whole home experience in one file.',
  'Use wide readable grids; never create skinny columns for paragraphs or cards.',
  'Use horizontal rails for dense post browsing.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
