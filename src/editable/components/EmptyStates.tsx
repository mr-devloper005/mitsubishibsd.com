import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CheckCircle2, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

type StateShellProps = {
  title: string
  description: string
  actionLabel: string
  actionHref: string
  className?: string
  eyebrow: string
  ghost: string
  icon: LucideIcon
  tone: 'neutral' | 'positive'
}

/* Shared editorial shell for empty / success surfaces.
   Ghost number + icon chip + bold heading + muted line + one primary action. */
function StateShell({ title, description, actionLabel, actionHref, className, eyebrow, ghost, icon: Icon, tone }: StateShellProps) {
  const isPositive = tone === 'positive'
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 text-center sm:p-14',
        className,
      )}
    >
      {/* Large ghost number */}
      <span
        className="editable-display pointer-events-none absolute right-5 top-2 select-none font-black leading-none tracking-[-0.04em]"
        style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
        aria-hidden="true"
      >
        {ghost}
      </span>

      <div className="relative mx-auto flex max-w-[60ch] flex-col items-center">
        {/* Icon chip */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={
            isPositive
              ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
              : { background: 'var(--slot4-panel-bg)', color: 'var(--slot4-muted-text)' }
          }
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Eyebrow */}
        <p
          className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em]"
          style={{ color: isPositive ? 'var(--slot4-accent-ink)' : 'var(--slot4-soft-muted-text)' }}
        >
          {eyebrow}
        </p>

        {/* Heading */}
        <h2
          className="editable-display mt-4 font-black leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)]"
          style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)' }}
        >
          {title}
        </h2>

        {/* Supporting line */}
        <p className="mt-4 text-base leading-8 text-[var(--slot4-muted-text)]">{description}</p>

        {/* Primary action */}
        <Link
          href={actionHref}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
          style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <StateShell
      className={className}
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      eyebrow="Empty for now"
      ghost="00"
      icon={SearchX}
      tone="neutral"
    />
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} from the master panel will appear here automatically. The page layout stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <StateShell
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
      eyebrow="Sent successfully"
      ghost="01"
      icon={CheckCircle2}
      tone="positive"
    />
  )
}
