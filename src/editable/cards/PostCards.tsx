import Link from 'next/link'
import { ArrowRight, Clock3 } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

// Strip any rich HTML / entity-encoded HTML to clean plain text for card excerpts.
export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ============================================================
   1. EDITORIAL FEATURE CARD
   Full-bleed image with strong bottom overlay and lime CTA pill.
   Used for featured/hero card slots.
   ============================================================ */
export function EditorialFeatureCard({
  post,
  href,
  label = 'Featured',
}: {
  post: SitePost
  href: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className="group block min-w-0 overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]"
    >
      <div className="relative min-h-[520px] lg:min-h-[620px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />

        <div className="absolute inset-0 flex flex-col justify-end p-8">
          {/* Category badge */}
          <span
            className="mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
          >
            {label}
          </span>

          {/* Title */}
          <h3 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-white/65 sm:text-base">
            {getEditableExcerpt(post, 160)}
          </p>

          {/* CTA */}
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0d0d0d] transition group-hover:bg-[var(--slot4-accent)]">
            View work <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   2. RAIL POST CARD
   Narrow portrait card for horizontal scroll rails.
   Lime numbered badge + frosted category tag.
   ============================================================ */
export function RailPostCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className="group block w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] sm:w-[240px]"
    >
      {/* Portrait image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {/* Lime number badge */}
        <span
          className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black"
          style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
        >
          {index + 1}
        </span>
        {/* Category chip */}
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
          {getEditableCategory(post)}
        </span>
      </div>

      {/* Text content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 80)}
        </p>
      </div>
    </Link>
  )
}

/* ============================================================
   3. COMPACT INDEX CARD
   Horizontal pill-number + title + thumbnail. Good for
   list archives and sidebar-adjacent ranking areas.
   ============================================================ */
export function CompactIndexCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-start gap-4 rounded-2xl p-4 transition duration-200 hover:bg-[var(--slot4-panel-bg)]"
    >
      {/* Lime number circle */}
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black"
        style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Text block */}
      <div className="min-w-0 flex-1">
        <p
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--slot4-accent)' }}
        >
          <Clock3 className="h-3 w-3" />
          {getEditableCategory(post)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 90)}
        </p>
      </div>

      {/* Thumbnail */}
      {image ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--slot4-media-bg)]">
          <img
            src={image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
    </Link>
  )
}

/* ============================================================
   4. ARTICLE LIST CARD
   Wide horizontal split: image left, editorial text right.
   Section number eyebrow ("No. 01") ties to WEMBS numbering.
   ============================================================ */
export function ArticleListCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className="group grid min-w-0 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] sm:grid-cols-[280px_minmax(0,1fr)]"
    >
      {/* Image panel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)] sm:aspect-auto sm:min-h-[200px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
        >
          {getEditableCategory(post)}
        </span>
      </div>

      {/* Text panel */}
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
          No. {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)] sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 180)}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent-ink)]">
          View work <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
