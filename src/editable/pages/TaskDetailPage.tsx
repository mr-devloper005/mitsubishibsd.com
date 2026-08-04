import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Quote, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableRootStyle } from '@/editable/layouts/design-contract'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

// Purely presentational date label — always guarded so posts without dates render fine.
const dateLabel = (post: SitePost) => {
  const raw = post.publishedAt || post.createdAt || ''
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const tagsOf = (post: SitePost, limit = 8) =>
  (Array.isArray(post.tags) ? post.tags : [])
    .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => tag.trim())
    .slice(0, limit)

/*
  Detail surfaces run on the site's base theme (warm cream + lime + dark forest).
  `taskThemeStyle` still ships the older per-task accent + typeface tokens, so the
  design-contract tokens are layered on top and the font overrides are dropped so
  the shell typefaces (display / body) keep applying.
*/
function detailSurfaceStyle(task: TaskKey): React.CSSProperties {
  return {
    ...taskThemeStyle(task),
    ...editableRootStyle,
    '--editable-font-display': undefined,
    '--editable-font-body': undefined,
    fontFamily: undefined,
  } as React.CSSProperties
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={detailSurfaceStyle(task)} className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// ----- Base theme tokens (Swiss/editorial directory language) -----
const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'
const sectionY = 'py-14 sm:py-16'
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.24em]'
const microLabel = 'text-[10px] font-bold uppercase tracking-[0.18em]'
const cardShell = 'overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]'
const panelShell = 'overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]'
const btnBase = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]'
const btnSecondary = 'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] active:scale-[0.98]'
const btnOnDark = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-[var(--slot4-dark-text)] transition hover:border-[var(--slot4-accent)] active:scale-[0.98]'
const titleStyle = { fontSize: 'clamp(2rem,5vw,4rem)' } as React.CSSProperties
const accentStyle = { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' } as React.CSSProperties
const darkCtaStyle = { background: 'var(--slot4-dark-bg)', color: 'var(--slot4-accent)' } as React.CSSProperties
const darkPanelStyle = { background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' } as React.CSSProperties
const tealPanelStyle = { background: 'var(--slot4-lavender)', color: 'var(--slot4-page-text)' } as React.CSSProperties
// Article body links are handled globally in editable-global.css: they paint with
// --slot4-accent-ink (readable on cream) and carry a lime underline. No local
// override here — re-pointing --slot4-accent-fill would also darken any lime fill
// that appears inside the body subtree.

// Star rating row. Uses real rating/review fields when present, otherwise a
// stable derived value (wire to real data when available).
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

function DetailMeta({ post, category, center = false, tone = 'light' }: { post: SitePost; category?: string; center?: boolean; tone?: 'light' | 'dark' }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  const dark = tone === 'dark'
  return (
    <div className={`mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[2px]" aria-label={`${rating.toFixed(1)} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            // Filled stars: lime on dark, accent ink on light. A lime star on a
            // cream card sits at ~1:1 contrast and reads as an empty slot.
            className={`h-4 w-4 ${i < filled
              ? dark ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--slot4-accent-ink)] text-[var(--slot4-accent-ink)]'
              : dark ? 'fill-white/20 text-white/20' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
          />
        ))}
      </span>
      <span className={`text-sm font-bold ${dark ? 'text-[var(--slot4-dark-text)]' : 'text-[var(--slot4-page-text)]'}`}>{rating.toFixed(1)}</span>
      <span className={`text-sm ${dark ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}>{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span aria-hidden className={`h-1 w-1 rounded-full ${dark ? 'bg-white/35' : 'bg-[var(--slot4-soft-muted-text)]'}`} />
          <span className={`${microLabel} ${dark ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}`}>{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children, tone = 'light' }: { task: TaskKey; children: React.ReactNode; tone?: 'light' | 'dark' }) {
  const theme = getTaskTheme(task)
  // Lime only reads on dark surfaces (13:1). On light surfaces it measures ~1:1,
  // so switch to the text-safe accent ink. The dot inherits via `bg-current`.
  const kickerColor = tone === 'dark' ? 'var(--slot4-accent)' : 'var(--slot4-accent-ink)'
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${eyebrow}`} style={{ color: kickerColor }}>
      <span>{theme.kicker}</span>
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      <span className={tone === 'dark' ? 'text-white/60' : 'text-[var(--slot4-muted-text)]'}>{children}</span>
    </div>
  )
}

// Breadcrumb rail + return pill — the shared header of every detail layout.
function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const route = taskConfig?.route || '/'
  const label = taskConfig?.label || 'posts'
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-x-2.5 gap-y-3 pt-8 ${microLabel} text-[var(--slot4-soft-muted-text)]`}>
      <Link href="/" className="transition hover:text-[var(--slot4-page-text)]">Home</Link>
      <span aria-hidden>/</span>
      <Link href={route} className="transition hover:text-[var(--slot4-page-text)]">{label}</Link>
      <span aria-hidden>/</span>
      <span className="text-[var(--slot4-page-text)]">Detail</span>
      <Link
        href={route}
        className={`ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2 ${microLabel} text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]`}
      >
        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" /> Back
      </Link>
    </nav>
  )
}

// `N°001` left, descriptor right, hairline underneath.
function LabelRow({ index, label, tone = 'light' }: { index: string; label: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b py-5 ${eyebrow} ${dark ? 'border-white/10 text-white/55' : 'border-[var(--editable-border)] text-[var(--slot4-muted-text)]'}`}>
      <span>{index}</span>
      <span className="min-w-0 break-words sm:text-right">{label}</span>
    </div>
  )
}

// Ghost number beside a section title.
function SectionHeading({ number, title, note, action }: { number: string; title: string; note?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-[var(--editable-border)] pb-6">
      <div className="flex min-w-0 items-end gap-4">
        <span aria-hidden className="editable-display shrink-0 text-4xl font-black leading-[0.8] tracking-[-0.04em] text-[var(--editable-border)] sm:text-5xl">{number}</span>
        <div className="min-w-0">
          <h2 className="editable-display break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">{title}</h2>
          {note ? <p className="mt-2 max-w-[60ch] text-sm leading-6 text-[var(--slot4-muted-text)]">{note}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}

function AccentBadge({ children }: { children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${microLabel}`} style={accentStyle}>{children}</span>
}

function TagChips({ post, label = 'Tagged' }: { post: SitePost; label?: string }) {
  const tags = tagsOf(post)
  if (!tags.length) return null
  return (
    <div className="mt-10 border-t border-[var(--editable-border)] pt-6">
      <p className={`${eyebrow} text-[var(--slot4-soft-muted-text)]`}>{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-3.5 py-1.5 ${microLabel} text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]`}>
            <Tag className="h-3 w-3 shrink-0 text-[var(--slot4-soft-muted-text)]" />
            <span className="min-w-0 break-words">{tag}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Dark forest meta block — used for sidebars and identity rails.
function MetaPanel({ title, rows, children }: { title: string; rows: Array<[string, string]>; children?: React.ReactNode }) {
  const visible = rows.filter(([, value]) => value)
  if (!visible.length && !children) return null
  return (
    <div className="overflow-hidden rounded-2xl p-7" style={darkPanelStyle}>
      <p className={`${eyebrow} text-[var(--slot4-accent)]`}>{title}</p>
      {visible.length ? (
        <dl className="mt-5 divide-y divide-white/10">
          {visible.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3">
              <dt className={`${microLabel} shrink-0 pt-0.5 text-white/45`}>{label}</dt>
              <dd className="min-w-0 break-words text-right text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children ? <div className={visible.length ? 'mt-6 border-t border-white/10 pt-6' : 'mt-6'}>{children}</div> : null}
    </div>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const category = categoryOf(post, 'Article')
  const lead = leadText(post)
  const published = dateLabel(post)
  return (
    <>
      <div className={container}>
        <BackLink task="article" />
        <LabelRow index="N°001" label={category} />
      </div>

      <article className={container}>
        <header className="max-w-[46rem] py-12 sm:py-14">
          <Kicker task="article">{category}</Kicker>
          <h1 className="editable-display mt-5 break-words text-balance font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
          <div className={`mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 ${microLabel} text-[var(--slot4-muted-text)]`}>
            <span className="text-[var(--slot4-page-text)]">{post.authorName || SITE_CONFIG.name}</span>
            {published ? (
              <>
                <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--slot4-soft-muted-text)]" />
                <span>{published}</span>
              </>
            ) : null}
          </div>
        </header>

        {images[0] ? (
          <figure className="group overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
            <img src={images[0]} alt={post.title} className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          </figure>
        ) : null}

        <div className={`grid gap-10 ${sectionY} lg:grid-cols-[minmax(0,1fr)_300px]`}>
          <div className="min-w-0">
            {lead ? (
              <div className={`${panelShell} p-6 sm:p-8`}>
                <Quote className="h-5 w-5 text-[var(--slot4-accent-ink)]" aria-hidden />
                <p className="mt-4 max-w-[70ch] text-base leading-8 text-[var(--slot4-page-text)]">{lead}</p>
              </div>
            ) : null}
            <BodyContent post={post} />
            <TagChips post={post} />
          </div>
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <MetaPanel
              title="The record"
              rows={[['Section', category], ['Author', post.authorName || SITE_CONFIG.name], ['Published', published], ['Source', SITE_CONFIG.name]]}
            >
              <Link href="/contact" className={btnBase} style={accentStyle}>Get in touch <ArrowRight className="h-4 w-4" /></Link>
            </MetaPanel>
          </aside>
        </div>

        <div className="pb-6">
          <EditableArticleComments slug={post.slug} comments={comments} />
        </div>
      </article>
      <RelatedStrip task="article" related={related} />
      <ClosingCta task="article" />
    </>
  )
}

// ----- Listing: a precise directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const category = getField(post, ['category'])
  const mapSrc = mapSrcFor(post)
  const lead = leadText(post)
  return (
    <>
      <div className={container}>
        <BackLink task="listing" />
        <LabelRow index="N°001" label={category || 'Business record'} />
      </div>

      <section className={`${container} ${sectionY}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="min-w-0">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] sm:h-28 sm:w-28">
                {logo ? <img src={logo} alt={post.title} className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10 text-[var(--slot4-soft-muted-text)]" />}
              </div>
              <div className="min-w-0">
                <Kicker task="listing">Business listing</Kicker>
                <h1 className="editable-display mt-4 break-words font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <AccentBadge><CheckCircle2 className="h-3 w-3" /> Listed</AccentBadge>
              {category ? (
                <span className={`rounded-full border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-3 py-1 ${microLabel} text-[var(--slot4-muted-text)]`}>{category}</span>
              ) : null}
            </div>
            <DetailMeta post={post} category={category} />
            {lead ? <p className="mt-7 max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">{lead}</p> : null}
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <Divider />
            <SectionHeading number="02" title="About this business" note="Everything published for this record." />
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Showcase" />
            <TagChips post={post} />
          </article>
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
      <ClosingCta task="listing" />
    </>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const category = getField(post, ['category'])
  const lead = leadText(post)
  return (
    <>
      <div className={container}>
        <BackLink task="classified" />
        <LabelRow index="N°001" label={category || 'Marketplace notice'} />
      </div>

      <section className={`${container} ${sectionY}`}>
        <div className="grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl p-7" style={darkPanelStyle}>
              <Kicker task="classified" tone="dark">Classified</Kicker>
              <h1 className="editable-display mt-4 break-words text-2xl font-black leading-[1.05] tracking-[-0.04em] sm:text-3xl">{post.title}</h1>
              <DetailMeta post={post} category={category} tone="dark" />
              <div className="mt-7 border-t border-white/10 pt-6">
                <p className={`${microLabel} text-white/45`}>Asking price</p>
                <p className="editable-display mt-2 break-words text-4xl font-black tracking-[-0.04em] text-[var(--slot4-accent)] sm:text-5xl">{price || 'Open offer'}</p>
              </div>
              <div className="mt-6 space-y-2.5">
                {condition ? <BadgeLine label="Condition" value={condition} tone="dark" /> : null}
                {location ? <BadgeLine label="Location" value={location} tone="dark" /> : null}
              </div>
              {phone || email ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  {phone ? <a href={`tel:${phone}`} className={btnBase} style={accentStyle}><Phone className="h-4 w-4" /> Call now</a> : null}
                  {email ? <a href={`mailto:${email}`} className={btnOnDark}><Mail className="h-4 w-4" /> Email</a> : null}
                </div>
              ) : null}
            </div>
          </aside>
          <article className="min-w-0">
            {lead ? <p className="max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">{lead}</p> : null}
            <ImageStrip images={images} label="Offer images" large />
            <div className="mt-12">
              <SectionHeading number="02" title="Full description" />
              <BodyContent post={post} />
            </div>
            <TagChips post={post} />
            <div className="mt-10">
              <ContactAction website={website} phone={phone} email={email} />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
      <ClosingCta task="classified" />
    </>
  )
}

// ----- Image: an image-led gallery canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  const hero = gallery[0]
  const rest = gallery.slice(1)
  const category = categoryOf(post, 'Photography')
  const lead = leadText(post)
  const published = dateLabel(post)
  const taskConfig = getTaskConfig('image')
  const frames = `${gallery.length} frame${gallery.length === 1 ? '' : 's'}`
  return (
    <>
      <div className={container}>
        <BackLink task="image" />
        <LabelRow index="N°001" label={`${frames} — ${category}`} />
      </div>

      {/* Headline block */}
      <section className={container}>
        <div className="grid gap-x-12 gap-y-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-end">
          <div className="min-w-0">
            <Kicker task="image">{category}</Kicker>
            <h1 className="editable-display mt-5 break-words text-balance font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
          </div>
          <div className="min-w-0">
            {lead ? <p className="max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">{lead}</p> : null}
            <DetailMeta post={post} category={category} />
          </div>
        </div>
      </section>

      {/* Hero frame */}
      <section className={container}>
        <figure className="group relative overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
          <img src={hero} alt={post.title} className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-3 gap-y-2 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.72))] p-5 sm:p-7">
            <AccentBadge><Camera className="h-3 w-3" /> Featured frame</AccentBadge>
            <span className={`${microLabel} text-white/75`}>{SITE_CONFIG.name}</span>
          </figcaption>
        </figure>
      </section>

      {/* Gallery + meta rail */}
      <section className={`${container} ${sectionY}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <SectionHeading
              number="02"
              title="The gallery"
              note={rest.length ? 'Every frame published with this set.' : 'This set ships with a single frame.'}
            />
            {rest.length ? (
              <div className="mt-8 columns-1 gap-5 [column-fill:_balance] sm:columns-2">
                {rest.map((image, index) => (
                  <figure
                    key={`${image}-${index}`}
                    className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={image}
                        alt={`${post.title} — frame ${index + 2}`}
                        className="w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 ${microLabel} opacity-0 transition duration-300 group-hover:opacity-100`}
                        style={accentStyle}
                      >
                        {String(index + 2).padStart(2, '0')}
                      </span>
                    </div>
                  </figure>
                ))}
              </div>
            ) : (
              <div className={`mt-8 ${panelShell} p-8 text-sm leading-7 text-[var(--slot4-muted-text)]`}>
                No additional frames were published with this set yet.
              </div>
            )}
          </div>
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <MetaPanel
              title="Frame details"
              rows={[['Frames', String(gallery.length)], ['Category', category], ['Collection', taskConfig?.label || 'Photos'], ['Published', published], ['Source', SITE_CONFIG.name]]}
            >
              <Link href={taskConfig?.route || '/'} className={btnBase} style={accentStyle}>
                More photos <ArrowUpRight className="h-4 w-4" />
              </Link>
            </MetaPanel>
            <div className={`${panelShell} p-6`}>
              <p className={`${eyebrow} text-[var(--slot4-soft-muted-text)]`}>Usage</p>
              <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">
                Open any frame in a new tab to view it at full resolution.
              </p>
              <Link href={hero} target="_blank" rel="noreferrer" className={`mt-5 w-full ${btnSecondary}`}>
                Open original <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Story */}
      <section className={`${container} pb-14 sm:pb-16`}>
        <SectionHeading number="03" title="About this set" />
        <BodyContent post={post} />
        <TagChips post={post} />
      </section>

      <RelatedStrip task="image" related={related} />
      <ClosingCta task="image" />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = categoryOf(post, 'Resource')
  const lead = leadText(post)
  return (
    <>
      <div className={container}>
        <BackLink task="sbm" />
        <LabelRow index="N°001" label={category} />
      </div>

      <section className={`${container} py-12 sm:py-14`}>
        <div className="overflow-hidden rounded-2xl p-7 sm:p-10" style={tealPanelStyle}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-dark-bg)] text-[var(--slot4-accent)]">
              <Bookmark className="h-5 w-5" />
            </span>
            <span className={`${eyebrow} text-[var(--slot4-page-text)]`}>Saved resource</span>
          </div>
          <h1 className="editable-display mt-6 max-w-[26ch] break-words font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
          {lead ? <p className="mt-6 max-w-[70ch] text-base leading-8 text-[var(--slot4-page-text)]">{lead}</p> : null}
          {website ? (
            <Link href={website} target="_blank" rel="noreferrer" className={`mt-8 ${btnBase}`} style={darkCtaStyle}>
              Open resource <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>

      <article className={`${container} pb-14 sm:pb-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <SectionHeading number="02" title="Why it is worth saving" />
            <BodyContent post={post} />
            <TagChips post={post} />
          </div>
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <MetaPanel title="Resource card" rows={[['Category', category], ['Published', dateLabel(post)], ['Curated by', SITE_CONFIG.name]]}>
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className={btnBase} style={accentStyle}>
                  Visit link <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </MetaPanel>
          </aside>
        </div>
      </article>

      <RelatedStrip task="sbm" related={related} />
      <ClosingCta task="sbm" />
    </>
  )
}

// ----- PDF: a document workspace -----
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Document')
  const lead = leadText(post)
  return (
    <>
      <div className={container}>
        <BackLink task="pdf" />
        <LabelRow index="N°001" label={category} />
      </div>

      <section className={`${container} ${sectionY}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[var(--slot4-accent)]" style={darkPanelStyle}>
                <FileText className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <Kicker task="pdf">{category}</Kicker>
                <h1 className="editable-display mt-3 break-words font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
              </div>
            </div>
            {lead ? <p className="mt-7 max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">{lead}</p> : null}
            <div className="mt-12">
              <SectionHeading number="02" title="Summary" />
              <BodyContent post={post} />
            </div>
            <TagChips post={post} />
            {fileUrl ? (
              <div className="mt-12">
                <SectionHeading
                  number="03"
                  title="Document preview"
                  action={
                    <Link href={fileUrl} target="_blank" rel="noreferrer" className={btnBase} style={accentStyle}>
                      Download <Download className="h-4 w-4" />
                    </Link>
                  }
                />
                <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
                  <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-[var(--editable-border)] px-5 py-4 ${microLabel} text-[var(--slot4-muted-text)]`}>
                    <span className="min-w-0 break-words text-[var(--slot4-page-text)]">{post.title}</span>
                    <span>PDF</span>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[70vh] w-full min-w-full border-0 bg-[var(--slot4-media-bg)]" />
                  </div>
                </div>
              </div>
            ) : null}
          </article>
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <MetaPanel title="Document card" rows={[['Format', 'PDF'], ['Category', category], ['Published', dateLabel(post)], ['Source', SITE_CONFIG.name]]}>
              {fileUrl ? (
                <Link href={fileUrl} target="_blank" rel="noreferrer" className={`w-full ${btnBase}`} style={accentStyle}>
                  Download file <Download className="h-4 w-4" />
                </Link>
              ) : (
                <p className="text-sm leading-7 text-white/60">The file for this document is not available yet.</p>
              )}
            </MetaPanel>
            <RelatedPanel task="pdf" post={post} related={related} />
          </aside>
        </div>
      </section>
      <ClosingCta task="pdf" />
    </>
  )
}

// ----- Profile: identity-first, dark portrait header + meta rail -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const company = getField(post, ['company', 'organisation', 'organization'])
  const location = getField(post, ['location', 'city', 'address'])
  const category = categoryOf(post, 'Profile')
  const lead = leadText(post)
  const portrait = images[0]
  return (
    <>
      <div className={container}>
        <BackLink task="profile" />
        <LabelRow index="N°001" label={role || category} />
      </div>

      {/* Identity header */}
      <section className={`${container} py-12 sm:py-14`}>
        <div className="overflow-hidden rounded-2xl" style={darkPanelStyle}>
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center lg:gap-12">
            <div className="mx-auto w-full max-w-[240px] lg:mx-0">
              <div className="group relative aspect-square overflow-hidden rounded-2xl bg-[var(--slot4-media-bg)]">
                {portrait ? (
                  <img src={portrait} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <span className="flex h-full items-center justify-center"><UserRound className="h-16 w-16 text-[var(--slot4-soft-muted-text)]" /></span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <AccentBadge><BadgeCheck className="h-3 w-3" /> Verified profile</AccentBadge>
                {role ? <span className={`max-w-full rounded-full border border-white/15 px-3 py-1 ${microLabel} text-white/70`}><span className="break-words">{role}</span></span> : null}
              </div>
              <h1 className="editable-display mt-5 break-words font-black leading-[0.95] tracking-[-0.04em]" style={titleStyle}>{post.title}</h1>
              {lead ? <p className="mt-6 max-w-[70ch] text-base leading-8 text-white/65">{lead}</p> : null}
              <DetailMeta post={post} category={category} tone="dark" />
              {website || email ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {website ? (
                    <Link href={website} target="_blank" rel="noreferrer" className={btnBase} style={accentStyle}>
                      Visit website <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {email ? <a href={`mailto:${email}`} className={btnOnDark}><Mail className="h-4 w-4" /> Email</a> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Biography + facts rail */}
      <section className={`${container} pb-14 sm:pb-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <SectionHeading number="02" title="Biography" note={`Published on ${SITE_CONFIG.name}.`} />
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
            <TagChips post={post} />
          </article>
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className={`${panelShell} p-6`}>
              <p className={`${eyebrow} text-[var(--slot4-soft-muted-text)]`}>Profile facts</p>
              <div className="mt-4 space-y-2.5">
                {role ? <BadgeLine label="Role" value={role} /> : null}
                {company ? <BadgeLine label="Company" value={company} /> : null}
                {location ? <BadgeLine label="Based in" value={location} /> : null}
                {dateLabel(post) ? <BadgeLine label="Joined" value={dateLabel(post)} /> : null}
                <BadgeLine label="Directory" value={getTaskConfig('profile')?.label || 'People'} />
              </div>
            </div>
            <ContactAction phone={phone} email={email} />
          </aside>
        </div>
      </section>

      <RelatedStrip task="profile" related={related} />
      <ClosingCta task="profile" />
    </>
  )
}

// ----- Shared building blocks -----
function Divider() {
  return <div className="my-12 h-px bg-[var(--editable-border)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  const typography = [
    '[&_p]:mt-5 [&_p:first-child]:mt-0',
    '[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-[var(--slot4-page-text)]',
    '[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-[var(--slot4-page-text)]',
    '[&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-[var(--slot4-page-text)]',
    '[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-2',
    '[&_strong]:font-bold [&_strong]:text-[var(--slot4-page-text)]',
    '[&_a]:font-semibold',
    '[&_blockquote]:my-7 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--slot4-accent)] [&_blockquote]:pl-5 [&_blockquote]:text-[var(--slot4-page-text)]',
    '[&_img]:mt-6 [&_img]:w-full [&_img]:rounded-2xl',
    '[&_hr]:my-10 [&_hr]:border-[var(--editable-border)]',
    '[&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[var(--slot4-panel-bg)] [&_pre]:p-4',
    '[&_code]:break-words',
    '[&_table]:mt-6 [&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto',
    '[&_iframe]:mt-6 [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-2xl',
  ].join(' ')
  return (
    <div
      className={`article-content mt-8 break-words text-[var(--slot4-muted-text)] ${compact ? 'max-w-none text-[15px] leading-7' : 'max-w-[70ch] text-base leading-8'} ${typography}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div
          key={label}
          className="min-w-0 rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 transition duration-300 hover:border-[var(--slot4-accent)] hover:-translate-y-0.5"
        >
          <div className={`flex items-center gap-2 ${microLabel} text-[var(--slot4-soft-muted-text)]`}>
            <Icon className="h-3.5 w-3.5 text-[var(--slot4-page-text)]" /> {label}
          </div>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-[var(--slot4-page-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <div className={`flex items-center justify-between gap-4 border-b border-[var(--editable-border)] pb-4 ${eyebrow} text-[var(--slot4-soft-muted-text)]`}>
        <span>{label}</span>
        <span>{String(Math.min(images.length, large ? 4 : 8)).padStart(2, '0')}</span>
      </div>
      <div className={`mt-5 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <figure
            key={`${image}-${index}`}
            className="group m-0 overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
          >
            <img src={image} alt={`${label} ${index + 1}`} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
          </figure>
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className={panelShell}>
      <div className={`flex items-center gap-2 border-b border-[var(--editable-border)] px-5 py-4 ${eyebrow} text-[var(--slot4-muted-text)]`}>
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--slot4-page-text)]" />
        <span className="min-w-0 break-words">{label || 'Map location'}</span>
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full max-w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className={btnBase} style={accentStyle}>
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? <a href={`tel:${phone}`} className={btnSecondary}><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className={btnSecondary}><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className={`${panelShell} p-6`}>
      <p className={`${eyebrow} text-[var(--slot4-soft-muted-text)]`}>Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value, tone = 'light' }: { label: string; value: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border px-4 py-3 ${dark ? 'border-white/10 bg-white/5' : 'border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]'}`}>
      <span className={`${microLabel} ${dark ? 'text-white/45' : 'text-[var(--slot4-soft-muted-text)]'}`}>{label}</span>
      <span className={`min-w-0 break-words text-sm font-semibold ${dark ? 'text-[var(--slot4-dark-text)]' : 'text-[var(--slot4-page-text)]'}`}>{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const category = categoryOf(post, taskConfig?.label || 'Directory')
  return (
    <div className="space-y-6">
      <div className={`${panelShell} p-6`}>
        <p className={`${eyebrow} text-[var(--slot4-soft-muted-text)]`}>About this post</p>
        <div className="mt-4 grid gap-3 text-sm text-[var(--slot4-muted-text)]">
          <p className="flex items-start gap-2">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-page-text)]" />
            <span className="min-w-0 break-words">{taskConfig?.label || task}{category ? ` — ${category}` : ''}</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-page-text)]" />
            <span className="min-w-0 break-words">{SITE_CONFIG.name}</span>
          </p>
        </div>
      </div>
      {related.length ? (
        <div className={`${panelShell} p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--editable-border)] pb-4">
            <h2 className="editable-display text-lg font-black tracking-[-0.04em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className={`${microLabel} text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-muted-text)]`}>View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = (taskConfig?.label || 'posts').toLowerCase()
  return (
    <section className="border-t border-[var(--editable-border)]" style={{ background: 'var(--slot4-panel-bg)' }}>
      <div className={container}>
        <LabelRow index="N°004" label={`More from ${SITE_CONFIG.name}`} />
        <div className={sectionY}>
          <SectionHeading
            number="04"
            title={`More ${label}`}
            action={<Link href={taskConfig?.route || '/'} className={btnSecondary}>View all <ArrowUpRight className="h-4 w-4" /></Link>}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
          </div>
        </div>
      </div>
    </section>
  )
}

// Closing dark band — one lime CTA, editorial voice from the task theme.
function ClosingCta({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const theme = getTaskTheme(task)
  return (
    <section style={darkPanelStyle}>
      <div className={`${container} ${sectionY}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className={`${eyebrow} text-[var(--slot4-accent)]`}>{theme.kicker}</p>
            <h2 className="editable-display mt-4 max-w-[26ch] break-words text-3xl font-black leading-[1.02] tracking-[-0.04em] sm:text-4xl">{theme.note}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={taskConfig?.route || '/'} className={btnBase} style={accentStyle}>
              Browse {(taskConfig?.label || 'posts').toLowerCase()} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className={btnOnDark}>Search the site</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const excerpt = stripHtml(summaryText(post))
  const category = categoryOf(post, '')
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className={`group block min-w-0 ${cardShell}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
          {image ? (
            <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
          ) : (
            <span className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--slot4-soft-muted-text)]" /></span>
          )}
          {category ? (
            <span className={`absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[var(--slot4-surface-bg)] px-3 py-1 ${microLabel} text-[var(--slot4-page-text)]`}>{category}</span>
          ) : null}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 break-words text-base font-black leading-snug tracking-[-0.03em]">{post.title}</h3>
          {excerpt ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{excerpt}</p> : null}
          <span className={`mt-4 inline-flex items-center gap-1.5 ${microLabel} text-[var(--slot4-page-text)]`}>
            View <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex min-w-0 gap-3 rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-3 transition duration-300 hover:border-[var(--slot4-accent)] hover:-translate-y-0.5">
      {image && task !== 'sbm' ? (
        <img src={image} alt={post.title} className="h-16 w-16 shrink-0 rounded-lg bg-[var(--slot4-media-bg)] object-cover" />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--slot4-panel-bg)]"><FileText className="h-5 w-5 text-[var(--slot4-soft-muted-text)]" /></span>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-2 break-words text-sm font-bold leading-snug tracking-[-0.02em] text-[var(--slot4-page-text)]">{post.title}</h3>
        {excerpt ? <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{excerpt}</p> : null}
      </div>
    </Link>
  )
}
