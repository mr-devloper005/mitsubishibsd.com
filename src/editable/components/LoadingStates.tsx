import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  className?: string
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

/* Skeleton block. Default radius is rounded-xl (small blocks);
   pass rounded-full / rounded-2xl to match pills and cards. */
function PulseBlock({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl',
        dark ? 'bg-white/10' : 'bg-[var(--slot4-media-bg)]',
        className,
      )}
    />
  )
}

/* Hairline label row — mirrors the N°001 editorial rule in real sections. */
function SkeletonLabelRow({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--editable-border)] py-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{label}</span>
      <PulseBlock className="h-3 w-24 rounded-full" />
    </div>
  )
}

/* Card skeleton — same silhouette as the real post cards:
   rounded-2xl bordered surface, media band, two text lines, pill CTA. */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
      <PulseBlock className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5">
        <PulseBlock className="h-3 w-20 rounded-full" />
        <PulseBlock className="mt-4 h-5 w-5/6" />
        <PulseBlock className="mt-2.5 h-5 w-2/3" />
        <PulseBlock className="mt-4 h-3.5 w-full" />
        <PulseBlock className="mt-2 h-3.5 w-4/5" />
        <PulseBlock className="mt-6 h-10 w-32 rounded-full" />
      </div>
    </div>
  )
}

export function PageLoadingState({ label = 'Loading page', className }: LoadingStateProps) {
  return (
    <div className={cn(container, 'py-8 sm:py-10', className)} aria-live="polite" aria-busy="true">
      <SkeletonLabelRow label={label} />

      {/* Hero silhouette */}
      <div className="py-14 sm:py-16">
        <PulseBlock className="h-3 w-28 rounded-full" />
        <PulseBlock className="mt-6 h-12 w-full max-w-3xl sm:h-14" />
        <PulseBlock className="mt-3 h-12 w-3/4 max-w-2xl sm:h-14" />
        <PulseBlock className="mt-6 h-4 w-full max-w-xl" />
        <PulseBlock className="mt-2.5 h-4 w-2/3 max-w-lg" />
        <div className="mt-8 flex flex-wrap gap-3">
          <PulseBlock className="h-12 w-40 rounded-full" />
          <PulseBlock className="h-12 w-32 rounded-full" />
        </div>
      </div>

      {/* Card grid silhouette */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <SkeletonCard key={item} />)}
      </div>
    </div>
  )
}

export function CardGridLoadingState({ count = 6, className }: LoadingStateProps & { count?: number }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => <SkeletonCard key={index} />)}
    </div>
  )
}

export function DetailLoadingState({ label = 'Loading detail', className }: LoadingStateProps) {
  return (
    <div className={cn(container, 'py-8 sm:py-10', className)} aria-live="polite" aria-busy="true">
      <SkeletonLabelRow label={label} />

      {/* Two-panel detail header silhouette */}
      <div className="grid gap-6 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8 lg:p-10">
          <PulseBlock className="h-10 w-32 rounded-full" />
          <PulseBlock className="mt-8 h-3 w-24 rounded-full" />
          <PulseBlock className="mt-5 h-11 w-full sm:h-12" />
          <PulseBlock className="mt-3 h-11 w-4/5 sm:h-12" />
        </div>

        <div
          className="min-w-0 overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{ background: 'var(--slot4-dark-bg)' }}
        >
          <PulseBlock dark className="h-3 w-24 rounded-full" />
          <PulseBlock dark className="mt-5 h-4 w-full" />
          <PulseBlock dark className="mt-2.5 h-4 w-5/6" />
          <PulseBlock dark className="mt-2.5 h-4 w-2/3" />
          <div className="mt-6 border-t border-white/10 pt-6">
            <PulseBlock dark className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Body silhouette */}
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 pb-10 sm:p-8 lg:p-12">
        <PulseBlock className="h-3 w-20 rounded-full" />
        <div className="mt-6 space-y-3">
          <PulseBlock className="h-4 w-full" />
          <PulseBlock className="h-4 w-11/12" />
          <PulseBlock className="h-4 w-full" />
          <PulseBlock className="h-4 w-4/5" />
          <PulseBlock className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
