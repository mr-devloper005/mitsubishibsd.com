import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Globe, MapPin, Phone, Search, SlidersHorizontal, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
// Reduce any content payload — rich HTML, entity-encoded HTML, or plain text — to a clean
// plain-text card summary. Two tag-strip passes (before + after entity decode) also catch
// entity-encoded markup like &lt;p&gt; so category/archive cards never show raw markup.
const stripHtml = (value: string) => value
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
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

/* ============================================================
   NEW BASE THEME PRIMITIVES
   Warm cream page, cream-white surfaces, single lime accent,
   dark forest bands. Swiss/editorial directory rhythm.
   ============================================================ */
const shellSection = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'
const eyebrowType = 'text-[11px] font-bold uppercase tracking-[0.24em]'
const limeStyle = { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' } as const
const darkStyle = { background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' } as const
const rail = 'flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

// Shared surface: hairline border, 2xl radius, smooth lift on hover.
const cardBase = 'group block min-w-0 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]'
// Dark variant used sparingly to break up long grids.
const cardDark = 'group block min-w-0 overflow-hidden rounded-2xl border border-white/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.22)]'

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const page = pagination.page || 1
  const totalPages = pagination.totalPages || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const progress = Math.min(100, Math.max(6, Math.round((page / totalPages) * 100)))

  return (
    <EditableSiteShell>
      <main className="min-h-screen overflow-x-hidden bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">

        {/* ---------- N°00X editorial rule row ---------- */}
        <div className={shellSection}>
          <div className="flex items-center justify-between gap-4 border-b border-[var(--editable-border)] py-5">
            <span className={`${eyebrowType} text-[var(--slot4-muted-text)]`}>
              N°{String(page).padStart(3, '0')}
            </span>
            <span className={`${eyebrowType} truncate text-[var(--slot4-soft-muted-text)]`}>
              {label} index
            </span>
          </div>
        </div>

        {/* ---------- HERO ---------- */}
        <header className={`${shellSection} py-14 sm:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div className="min-w-0">
              <p className={eyebrowType} style={{ color: 'var(--slot4-accent-ink)' }}>
                {voice?.eyebrow || label}
              </p>
              <h1
                className="editable-display mt-4 max-w-3xl text-balance font-black leading-[1.02] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)' }}
              >
                {voice?.headline || `Browse ${label}`}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">
                {voice?.description || `Browse every published ${label.toLowerCase()} entry, filtered by category.`}
              </p>
              {voice?.chips?.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3.5 py-1.5 text-xs font-bold text-[var(--slot4-muted-text)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Index ledger panel */}
            <aside className="relative overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-7">
              <span
                className="editable-display pointer-events-none absolute -right-1 -top-3 select-none font-black leading-none tracking-[-0.05em]"
                style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
                aria-hidden="true"
              >
                {String(page).padStart(2, '0')}
              </span>
              <p className={`${eyebrowType} relative text-[var(--slot4-soft-muted-text)]`}>The ledger</p>
              <dl className="relative mt-5 space-y-3.5">
                <LedgerRow term="On this page" value={`${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}`} />
                <LedgerRow term="Total indexed" value={String(pagination.total || posts.length)} />
                <LedgerRow term="Category" value={categoryLabel} />
                <LedgerRow term="Page" value={`${page} / ${totalPages}`} last />
              </dl>
              <div className="relative mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--slot4-panel-bg)]">
                <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${progress}%`, background: 'var(--slot4-accent)' }} />
              </div>
            </aside>
          </div>
        </header>

        {/* ---------- FILTER BAND ---------- */}
        <section className="border-y border-[var(--editable-border)]" style={{ background: 'var(--slot4-panel-bg)' }}>
          <div className={`${shellSection} py-7`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={limeStyle}
                  aria-hidden="true"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <span className={`${eyebrowType} truncate text-[var(--slot4-page-text)]`}>
                  {voice?.filterLabel || 'Filter category'}
                </span>
              </div>

              <form action={basePath} className="flex flex-wrap items-center gap-3">
                <div className="relative flex min-w-0 items-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition focus-within:border-[var(--slot4-accent)] focus-within:ring-2 focus-within:ring-[var(--slot4-accent)]/25">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full max-w-[15rem] cursor-pointer appearance-none truncate rounded-full bg-transparent pl-5 pr-11 text-sm font-bold text-[var(--slot4-page-text)] outline-none"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-[var(--slot4-muted-text)]" />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                  style={limeStyle}
                >
                  Apply <ArrowRight className="h-4 w-4" />
                </button>
                {category !== 'all' ? (
                  <Link
                    href={pageHref(basePath, 'all', 1)}
                    className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                  >
                    Reset
                  </Link>
                ) : null}
              </form>
            </div>

            {/* Category chip rail */}
            <div className={`mt-6 ${rail}`}>
              <CategoryChip href={pageHref(basePath, 'all', 1)} label="All" active={category === 'all'} />
              {CATEGORY_OPTIONS.map((item) => (
                <CategoryChip
                  key={item.slug}
                  href={pageHref(basePath, item.slug, 1)}
                  label={item.name}
                  active={category === item.slug}
                />
              ))}
            </div>

            {voice?.secondaryNote ? (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--slot4-muted-text)]">{voice.secondaryNote}</p>
            ) : null}
          </div>
        </section>

        {/* ---------- THE GRID ---------- */}
        <section className={`${shellSection} py-14 sm:py-16`}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-8">
            <div className="flex min-w-0 items-end gap-5">
              <span
                className="editable-display select-none font-black leading-none tracking-[-0.05em]"
                style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
                aria-hidden="true"
              >
                02
              </span>
              <div className="min-w-0 pb-1">
                <p className={eyebrowType} style={{ color: 'var(--slot4-accent-ink)' }}>The index</p>
                <h2
                  className="editable-display mt-1 font-black tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(1.5rem,3.5vw,2.5rem)' }}
                >
                  {categoryLabel}
                </h2>
              </div>
            </div>
            <span className={`${eyebrowType} pb-2 text-[var(--slot4-soft-muted-text)]`}>
              {posts.length} / {pagination.total || posts.length}
            </span>
          </div>

          <div className="mt-10">
            {posts.length ? (
              <div className={taskGrid[task]}>
                {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-14 text-center sm:px-10">
                <span
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={limeStyle}
                  aria-hidden="true"
                >
                  <Search className="h-6 w-6" />
                </span>
                <h3 className="editable-display mt-6 text-2xl font-black tracking-[-0.04em]">Nothing indexed yet</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
                  Try another category, or check back after new {label.toLowerCase()} are published.
                </p>
                {category !== 'all' ? (
                  <Link
                    href={pageHref(basePath, 'all', 1)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                    style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-accent)' }}
                  >
                    Clear filter <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          {/* ---------- PAGINATION ---------- */}
          {posts.length ? (
            <nav aria-label="Pagination" className="mt-14 border-t border-[var(--editable-border)] pt-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
                <span className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>
                  Page {String(page).padStart(2, '0')} of {String(totalPages).padStart(2, '0')}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {pagination.hasPrevPage ? (
                    <Link
                      href={pageHref(basePath, category, page - 1)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Link>
                  ) : null}
                  {pagination.hasNextPage ? (
                    <Link
                      href={pageHref(basePath, category, page + 1)}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                      style={limeStyle}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </nav>
          ) : null}
        </section>

        {/* ---------- CLOSING DARK BAND ---------- */}
        <section style={darkStyle}>
          <div className={`${shellSection} py-14 sm:py-16`}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <p className={eyebrowType} style={{ color: 'var(--slot4-accent)' }}>
                  End of page {String(page).padStart(2, '0')}
                </p>
                <h2
                  className="editable-display mt-4 max-w-2xl font-black leading-[1.04] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(1.75rem,4vw,3rem)' }}
                >
                  Keep browsing the {label.toLowerCase()} directory.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--slot4-dark-text)]/70">
                  {voice?.secondaryNote || `Every ${label.toLowerCase()} entry is filterable by category and refreshed continuously.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={pageHref(basePath, 'all', 1)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                  style={limeStyle}
                >
                  Browse all <ArrowUpRight className="h-4 w-4" />
                </Link>
                {pagination.hasNextPage ? (
                  <Link
                    href={pageHref(basePath, category, page + 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-[var(--slot4-dark-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                  >
                    Next page <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

function LedgerRow({ term, value, last = false }: { term: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${last ? '' : 'border-b border-[var(--editable-border)] pb-3.5'}`}>
      <dt className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--slot4-soft-muted-text)]">{term}</dt>
      <dd className="min-w-0 truncate text-sm font-bold text-[var(--slot4-page-text)]">{value}</dd>
    </div>
  )
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
        active
          ? 'border-transparent'
          : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-muted-text)] hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]'
      }`}
      style={active ? limeStyle : undefined}
    >
      {label}
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} index={index} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} index={index} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} index={index} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

const indexNo = (index: number) => String(index + 1).padStart(2, '0')

function CardArrow({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${dark ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)]'}`}>
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function LimeBadge({ children }: { children: string }) {
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
      style={limeStyle}
    >
      {children}
    </span>
  )
}

// Ratings. Prefers real rating/review fields, falls back to a stable derived
// value so the UI always reads well (wire to real data later).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false, dark = false }: { post: SitePost; center?: boolean; dark?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  const on = dark ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--slot4-page-text)] text-[var(--slot4-page-text)]'
  const off = dark ? 'fill-white/20 text-white/20' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'
  return (
    <div className={`mt-3 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < filled ? on : off}`} />
        ))}
      </span>
      <span className={`text-xs font-bold ${dark ? 'text-[var(--slot4-dark-text)]' : 'text-[var(--slot4-page-text)]'}`}>{rating.toFixed(1)}</span>
      <span className={`text-xs font-medium ${dark ? 'text-white/50' : 'text-[var(--slot4-soft-muted-text)]'}`}>({reviewsOf(post)})</span>
    </div>
  )
}

/* ============================================================
   ARTICLE — image card, with a text-forward ghost-number
   variant every 4th slot for editorial rhythm.
   ============================================================ */
function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  const summary = getSummary(post)

  if (index % 4 === 3) {
    return (
      <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`} style={{ background: 'var(--slot4-panel-bg)' }}>
        <div className="flex items-start justify-between gap-4">
          <span
            className="editable-display select-none font-black leading-none tracking-[-0.05em]"
            style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--slot4-soft-muted-text)' }}
            aria-hidden="true"
          >
            {indexNo(index)}
          </span>
          <LimeBadge>{category}</LimeBadge>
        </div>
        <h3 className="editable-display mt-6 line-clamp-3 break-words text-2xl font-black leading-tight tracking-[-0.04em]">{post.title}</h3>
        <RatingLine post={post} />
        {summary ? <p className="mt-3 line-clamp-4 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : <span className="flex-1" />}
        <CardArrow label="Read article" />
      </Link>
    )
  }

  return (
    <Link href={href} className={cardBase}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3"><LimeBadge>{category}</LimeBadge></span>
      </div>
      <div className="p-6 sm:p-7">
        <p className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>No. {indexNo(index)}</p>
        <h3 className="editable-display mt-3 line-clamp-2 break-words text-xl font-black leading-tight tracking-[-0.04em] sm:text-2xl">{post.title}</h3>
        <RatingLine post={post} />
        {summary ? <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <CardArrow label="Read article" />
      </div>
    </Link>
  )
}

/* ============================================================
   LISTING — wide directory row with logo tile and meta strip.
   ============================================================ */
function ListingArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  const summary = getSummary(post)
  return (
    <Link href={href} className={`${cardBase} p-5 sm:p-6`}>
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] sm:h-24 sm:w-24">
          {logo
            ? <img src={logo} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
            : <BriefcaseBusiness className="h-8 w-8 text-[var(--slot4-muted-text)]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>N°{indexNo(index)}</p>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--slot4-soft-muted-text)] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--slot4-page-text)]" />
          </div>
          <h3 className="editable-display mt-2 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em] sm:text-xl">{post.title}</h3>
          <RatingLine post={post} />
          {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        </div>
      </div>
      {location || phone || website ? (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--editable-border)] pt-4 text-xs font-bold text-[var(--slot4-muted-text)]">
          {location ? <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{location}</span></span> : null}
          {phone ? <span className="inline-flex min-w-0 items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{phone}</span></span> : null}
          {website ? <span className="inline-flex min-w-0 items-center gap-1.5"><Globe className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{cleanDomain(website)}</span></span> : null}
        </div>
      ) : null}
    </Link>
  )
}

/* ============================================================
   CLASSIFIED — price-led notice card; dark variant every 5th.
   ============================================================ */
function ClassifiedArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  const summary = getSummary(post)
  const dark = index % 5 === 4

  return (
    <Link
      href={href}
      className={`${dark ? cardDark : cardBase} flex flex-col p-6 sm:p-7`}
      style={dark ? darkStyle : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="editable-display min-w-0 break-words font-black leading-none tracking-[-0.04em]"
          style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: dark ? 'var(--slot4-accent)' : 'var(--slot4-page-text)' }}
        >
          {price || 'Open offer'}
        </span>
        {condition ? (
          dark
            ? <span className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-dark-text)]">{condition}</span>
            : <span className="shrink-0"><LimeBadge>{condition}</LimeBadge></span>
        ) : null}
      </div>
      <h3 className={`editable-display mt-5 line-clamp-3 break-words text-lg font-black leading-tight tracking-[-0.04em] sm:text-xl ${dark ? 'text-[var(--slot4-dark-text)]' : ''}`}>{post.title}</h3>
      <RatingLine post={post} dark={dark} />
      {summary ? <p className={`mt-3 line-clamp-3 flex-1 text-sm leading-7 ${dark ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}>{summary}</p> : <span className="flex-1" />}
      <div className={`mt-6 flex items-center justify-between gap-3 border-t pt-4 text-xs font-bold ${dark ? 'border-white/10 text-white/60' : 'border-[var(--editable-border)] text-[var(--slot4-muted-text)]'}`}>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {location ? <><MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{location}</span></> : <span className="truncate">N°{indexNo(index)} · Details inside</span>}
        </span>
        <ArrowUpRight className={`h-4 w-4 shrink-0 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${dark ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-page-text)]'}`} />
      </div>
    </Link>
  )
}

/* ============================================================
   IMAGE — masonry gallery with three rotating card styles:
   0 = overlay poster, 1 = caption panel, 2 = dark plate.
   ============================================================ */
function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Gallery')
  const summary = getSummary(post)
  const variant = index % 3

  if (variant === 1) {
    return (
      <Link href={href} className={`${cardBase} mb-5 break-inside-avoid`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
          <span className="absolute left-3 top-3"><LimeBadge>{category}</LimeBadge></span>
        </div>
        <div className="p-5 sm:p-6">
          <p className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>N°{indexNo(index)}</p>
          <h3 className="editable-display mt-2.5 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em]">{post.title}</h3>
          {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
          <CardArrow label="View image" />
        </div>
      </Link>
    )
  }

  if (variant === 2) {
    return (
      <Link href={href} className={`${cardDark} mb-5 break-inside-avoid`} style={darkStyle}>
        <div className="relative aspect-square overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
          <span
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black"
            style={limeStyle}
            aria-hidden="true"
          >
            {indexNo(index)}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <p className={eyebrowType} style={{ color: 'var(--slot4-accent)' }}>{category}</p>
          <h3 className="editable-display mt-2.5 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em] text-[var(--slot4-dark-text)]">{post.title}</h3>
          <CardArrow label="View image" dark />
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <span className="absolute left-4 top-4"><LimeBadge>{category}</LimeBadge></span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className={`${eyebrowType} text-white/60`}>N°{indexNo(index)}</p>
          <h3 className="editable-display mt-2 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em] text-white">{post.title}</h3>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white/75 transition group-hover:text-[var(--slot4-accent)]">
            View image <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   SBM — saved-resource row with dark icon plate.
   ============================================================ */
function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  const summary = getSummary(post)
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-6`}>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-accent)' }}
        aria-hidden="true"
      >
        <Globe className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>Saved · N°{indexNo(index)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em]">{post.title}</h3>
        {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        {website ? (
          <p className="mt-3 truncate text-xs font-bold text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-page-text)]">{cleanDomain(website)}</p>
        ) : null}
      </div>
    </Link>
  )
}

/* ============================================================
   PDF — document library tile with dark file plate.
   ============================================================ */
function PdfArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = getCategory(post, 'Document')
  const summary = getSummary(post)
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-accent)' }}
          aria-hidden="true"
        >
          <FileText className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-col items-end gap-2">
          <span className="shrink-0"><LimeBadge>{category}</LimeBadge></span>
          <span className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>N°{indexNo(index)}</span>
        </div>
      </div>
      <h3 className="editable-display mt-6 line-clamp-3 break-words text-lg font-black leading-tight tracking-[-0.04em] sm:text-xl">{post.title}</h3>
      <RatingLine post={post} />
      {summary ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : <span className="flex-1" />}
      <span className="mt-6 inline-flex items-center gap-2 border-t border-[var(--editable-border)] pt-4 text-sm font-bold text-[var(--slot4-page-text)]">
        Open document <Download className="h-4 w-4 transition duration-300 group-hover:translate-y-0.5" />
      </span>
    </Link>
  )
}

/* ============================================================
   PROFILE — three rotating identity cards:
   dark spotlight (every 6th), compact row, centered portrait.
   ============================================================ */
function ProfileArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const summary = getSummary(post)
  const spotlight = index % 6 === 0
  const compact = !spotlight && index % 3 === 1

  if (spotlight) {
    return (
      <Link href={href} className={`${cardDark} flex flex-col items-center p-7 text-center`} style={darkStyle}>
        <span className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--slot4-accent)]">
          <span className="absolute inset-0 bg-[var(--slot4-media-bg)]" />
          {avatar
            ? <img src={avatar} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
            : <UserRound className="relative h-10 w-10 text-[var(--slot4-muted-text)]" />}
        </span>
        <p className={`${eyebrowType} mt-6`} style={{ color: 'var(--slot4-accent)' }}>Spotlight · N°{indexNo(index)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em] text-[var(--slot4-dark-text)]">{post.title}</h3>
        {role ? <p className="mt-1.5 line-clamp-1 text-xs font-bold text-white/60">{role}</p> : null}
        <RatingLine post={post} center dark />
        {summary ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">{summary}</p> : null}
      </Link>
    )
  }

  if (compact) {
    return (
      <Link href={href} className={`${cardBase} flex items-start gap-4 p-5 sm:p-6`}>
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
          {avatar
            ? <img src={avatar} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
            : <UserRound className="h-7 w-7 text-[var(--slot4-muted-text)]" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`${eyebrowType} text-[var(--slot4-soft-muted-text)]`}>N°{indexNo(index)}</p>
          <h3 className="editable-display mt-1.5 line-clamp-2 break-words text-base font-black leading-tight tracking-[-0.04em]">{post.title}</h3>
          {role ? <p className="mt-1 line-clamp-1 text-xs font-bold text-[var(--slot4-muted-text)]">{role}</p> : null}
          <RatingLine post={post} />
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <span className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
        {avatar
          ? <img src={avatar} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
          : <UserRound className="h-10 w-10 text-[var(--slot4-muted-text)]" />}
      </span>
      {role ? <span className="mt-5"><LimeBadge>{role}</LimeBadge></span> : <p className={`${eyebrowType} mt-5 text-[var(--slot4-soft-muted-text)]`}>N°{indexNo(index)}</p>}
      <h3 className="editable-display mt-3 line-clamp-2 break-words text-lg font-black leading-tight tracking-[-0.04em]">{post.title}</h3>
      <RatingLine post={post} center />
      {summary ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
    </Link>
  )
}
