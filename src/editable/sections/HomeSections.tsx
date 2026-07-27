import Link from 'next/link'
import {
  ArrowRight,
  Bookmark,
  Building2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Search,
  Star,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
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

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.7 + (h % 13) / 10) * 10) / 10
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function Stars({ rating, className = 'h-3.5 w-3.5' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[2px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            // Filled stars use the accent ink — the lime fill would sit at ~1:1
            // against the cream card and read as blank space.
            i < rounded
              ? 'fill-[var(--slot4-accent-ink)] text-[var(--slot4-accent-ink)]'
              : 'fill-[var(--editable-border)] text-[var(--editable-border)]'
          }`}
        />
      ))}
    </span>
  )
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

// Enabled tasks minus any hidden from navigation surfaces.
function visibleTasks() {
  const hidden = globalContent.hiddenNavTaskKeys as readonly string[]
  return SITE_CONFIG.tasks.filter((task) => task.enabled && !hidden.includes(task.key))
}

// Supporting page links used to round out chip/pill rows.
const SITE_CHIPS = [
  { label: 'About', href: '/about' },
  { label: 'Search', href: '/search' },
  { label: 'Contact', href: '/contact' },
] as const

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* ============================= HERO ============================= */
// Takes the full HomeSectionProps so the call site stays uniform with the other
// sections; the hero only needs the post pool (chips come from the task config).
export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const heroImages = latestPostImages(pool)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Discover creative talent on ${SITE_CONFIG.name}`
  const categories = [
    ...visibleTasks().map((task) => ({ label: task.label, href: task.route })),
    ...SITE_CHIPS,
  ].slice(0, 6)

  return (
    <section style={{ background: 'var(--slot4-accent)' }} className="relative overflow-hidden">
      {/* Right-side image collage — decorative, desktop only */}
      {heroImages.length > 0 && (
        <div className="absolute right-0 top-0 hidden h-full w-[44%] lg:block" aria-hidden="true">
          <EditableHeroCollage images={heroImages} />
          {/* Gradient fade from lime into collage */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, var(--slot4-accent) 0%, transparent 60%)' }}
          />
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 flex min-h-[88vh] flex-col justify-center ${container}`}>
        <div className="max-w-[600px]">
          {/* Badge */}
          <p className="mb-7 inline-block rounded-full bg-black/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-black/65">
            {pagesContent.home.hero.badge || 'Creative talent directory'}
          </p>

          {/* Hero headline */}
          <h1
            className="editable-display font-black leading-[0.9] tracking-[-0.05em] text-[var(--slot4-on-accent)]"
            style={{ fontSize: 'clamp(2.8rem,7vw,5.5rem)' }}
          >
            {heroTitle}
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-md text-base font-medium leading-7 text-black/60 sm:text-lg">
            {pagesContent.home.hero.description}
          </p>

          {/* Search pill */}
          <form
            action="/search"
            className="mt-8 flex w-full max-w-[500px] overflow-hidden rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            style={{ background: 'var(--slot4-dark-bg)' }}
          >
            <div className="flex flex-1 items-center gap-2.5 px-5">
              <Search className="h-4 w-4 shrink-0 text-white/40" />
              <input
                name="q"
                placeholder={pagesContent.home.hero.searchPlaceholder || 'Search images, profiles, portfolios...'}
                className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 bg-white px-6 text-sm font-bold transition hover:bg-white/90 sm:px-8"
              style={{ color: 'var(--slot4-on-accent)' }}
            >
              Search
            </button>
          </form>

          {/* Category chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-black/15 bg-black/10 px-4 py-1.5 text-sm font-semibold text-black/70 transition hover:bg-black/20"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom label strip */}
      <div className="relative z-10 border-t border-black/10 px-5 py-4 sm:px-8">
        <div className={`flex items-center justify-between ${container}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">
            {SITE_CONFIG.name}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">
            Scroll to explore ↓
          </p>
        </div>
      </div>
    </section>
  )
}

/* ========================= STORY RAIL / BRAND ========================= */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = visibleTasks()
  if (!categories.length) return null

  return (
    <section style={{ background: 'var(--slot4-lavender)' }}>
      <div className={`py-16 sm:py-20 ${container}`}>
        {/* Huge site name — WEMBS logo treatment */}
        <div className="overflow-hidden pb-1">
          <p
            className="editable-display select-none font-black leading-none tracking-[-0.05em]"
            style={{ fontSize: 'clamp(4rem,13vw,10rem)', color: 'var(--slot4-accent)', lineHeight: 0.88 }}
          >
            {SITE_CONFIG.name}
          </p>
        </div>

        <p className="mt-5 max-w-md text-base font-medium text-white/65">
          The creative freelancer directory — browse images, portfolios, and professional profiles from independent talent worldwide.
        </p>

        {/* Category pill links */}
        <div className="mt-9 flex flex-wrap gap-3">
          {categories.map((task) => {
            const Icon = taskIcon[task.key] || FileText
            return (
              <Link
                key={task.key}
                href={task.route}
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent)] hover:text-[var(--slot4-on-accent)]"
              >
                <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                {task.label}
              </Link>
            )
          })}
          {SITE_CHIPS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent)] hover:text-[var(--slot4-on-accent)]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={primaryRoute}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-80"
            style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ======================= ACTIVITY CARD (internal) ======================= */
function ActivityCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  const rating = ratingOf(post)

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img
            src={image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          {category ? (
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold"
              style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
            >
              {category}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-5">
        <Link href={href}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em] text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent-ink)]">
            {post.title}
          </h3>
        </Link>
        <div className="mt-2.5 flex items-center gap-2">
          <Stars rating={rating} />
          <span className="text-xs font-semibold text-[var(--slot4-muted-text)]">
            {rating.toFixed(1)} ({reviewsOf(post)})
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">
          {getExcerpt(post, 110)}
        </p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent-ink)]"
        >
          View work <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  )
}

/* ========================== MAGAZINE SPLIT ========================== */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const activity = pool.slice(0, 9)
  const heroImages = latestPostImages(pool)
  if (!activity.length) return null

  return (
    <section style={{ background: 'var(--slot4-page-bg)' }}>
      {/* Editorial rule header — N°001 style */}
      <div className={container}>
        <div className="flex items-center justify-between border-b border-[var(--editable-border)] py-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-muted-text)]">
            N°001
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-muted-text)]">
            Community showcase
          </span>
        </div>
      </div>

      <div className={`py-14 sm:py-16 ${container}`}>
        {/* Feature split — image collage + editorial text */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: image mosaic collage */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--slot4-media-bg)]">
            <EditableHeroCollage images={heroImages} />
          </div>

          {/* Right: editorial description */}
          <div className="flex flex-col justify-center lg:py-8">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.26em]"
              style={{ color: 'var(--slot4-accent-ink)' }}
            >
              Latest posts
            </p>
            <h2
              className="editable-display mt-4 font-black leading-[1] tracking-[-0.04em] text-[var(--slot4-page-text)]"
              style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)' }}
            >
              Fresh work from the creative community.
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--slot4-muted-text)]">
              Browse the latest portfolio images, professional profiles, and creative posts from independent freelancers on {SITE_CONFIG.name}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryRoute}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                Browse all posts <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-3 text-sm font-semibold text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>

        {/* Activity card grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activity.map((post) => (
            <ActivityCard
              key={post.id || post.slug}
              post={post}
              href={postHref(primaryTask, post, primaryRoute)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={primaryRoute}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-7 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent-ink)]"
          >
            Show more <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ======================= COMPACT CARD (time sections) ======================= */
function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-[var(--slot4-media-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {category ? (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
            style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
          >
            {category}
          </span>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{post.title}</h3>
        </div>
      </div>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string; number: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New discoveries', number: '01' },
  browse: { eyebrow: 'Trending now', title: 'Popular talent', number: '02' },
  index: { eyebrow: 'Always fresh', title: 'From the archive', number: '03' },
}

/* ========================= TIME COLLECTIONS ========================= */
export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, idx) => {
        const copy = sectionCopy[section.key] || {
          eyebrow: 'Discover',
          title: 'More to explore',
          number: `0${idx + 1}`,
        }
        const isAlt = idx % 2 !== 0
        return (
          <section
            key={section.key}
            style={{ background: isAlt ? 'var(--slot4-panel-bg)' : 'var(--slot4-surface-bg)' }}
          >
            <div className={`py-14 sm:py-16 ${container}`}>
              {/* WEMBS-inspired numbered section header */}
              <div className="flex items-end justify-between gap-4 border-b border-[var(--editable-border)] pb-8">
                <div className="flex items-end gap-5">
                  {/* Large grey number */}
                  <span
                    className="editable-display select-none font-black leading-none tracking-[-0.05em]"
                    style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
                    aria-hidden="true"
                  >
                    {copy.number}
                  </span>
                  <div className="pb-1">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.26em]"
                      style={{ color: 'var(--slot4-accent-ink)' }}
                    >
                      {copy.eyebrow}
                    </p>
                    <h2
                      className="editable-display mt-1 font-black tracking-[-0.03em] text-[var(--slot4-page-text)]"
                      style={{ fontSize: 'clamp(1.5rem,3.5vw,2.5rem)' }}
                    >
                      {copy.title}
                    </h2>
                  </div>
                </div>
                <Link
                  href={section.href || primaryRoute}
                  className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
                >
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* 4-column image-first post grid */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <CompactCard
                    key={post.id || post.slug}
                    post={post}
                    href={postHref(primaryTask, post, primaryRoute)}
                  />
                ))}
              </div>

              {/* Mobile see all */}
              <div className="mt-6 sm:hidden">
                <Link
                  href={section.href || primaryRoute}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--slot4-page-text)]"
                >
                  See all {taskLabel(primaryTask)} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ============================== CTA ============================== */
export function EditableHomeCta() {
  return (
    <section style={{ background: 'var(--slot4-dark-bg)' }}>
      <div className={`flex flex-col items-center gap-8 py-24 text-center ${container}`}>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.28em]"
          style={{ color: 'var(--slot4-accent)' }}
        >
          Join the community
        </p>
        <h2
          className="editable-display max-w-3xl font-black leading-[0.93] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(2rem,5.5vw,4rem)', color: 'var(--slot4-dark-text)' }}
        >
          Got creative work worth showing?
        </h2>
        <p className="max-w-lg text-base leading-7 text-white/50 sm:text-lg">
          Post your portfolio, share your images, and get discovered by clients looking for independent talent on {SITE_CONFIG.name}.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition hover:opacity-80"
            style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
          >
            Post your work
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  )
}
