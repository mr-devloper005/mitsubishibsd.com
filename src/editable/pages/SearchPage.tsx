import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search, SearchX } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  // compactRaw only trims — it does NOT strip HTML — so the raw payload could leak markup
  // into the card summary. Route every candidate through toPlainText so cards stay plain,
  // and fall back to the article body when there's no dedicated summary/description.
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
    compactRaw(content.description) ||
    compactRaw(content.excerpt) ||
    compactRaw(content.body) ||
    '',
  )
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.24em]'
const ordinalOf = (index: number) => `N°${String(index + 1).padStart(3, '0')}`

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  // Route from the task config (e.g. /listing/<slug>); buildPostUrl can fall
  // back to /posts for tasks missing from the enabled taskViews map, which 404s.
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 5 === 0
  const ordinal = ordinalOf(index)

  return (
    <Link
      href={href}
      className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] ${strong ? 'md:col-span-2' : ''}`}
    >
      <div className={`relative w-full overflow-hidden bg-[var(--slot4-media-bg)] ${strong ? 'aspect-[16/8] sm:aspect-[16/7]' : 'aspect-[16/10]'}`}>
        {image ? (
          <>
            <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </>
        ) : (
          <span
            className="editable-display absolute inset-0 flex items-center justify-center font-black leading-none tracking-[-0.04em] text-[var(--editable-border)]"
            style={{ fontSize: 'clamp(2.5rem,10vw,5rem)' }}
          >
            {ordinal}
          </span>
        )}
        <span
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={strong
            ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
            : { background: 'var(--slot4-surface-bg)', color: 'var(--slot4-page-text)' }}
        >
          {taskLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className={`flex items-center justify-between gap-3 border-b border-[var(--editable-border)] pb-3 ${eyebrow} text-[var(--slot4-soft-muted-text)]`}>
          <span>{ordinal}</span>
          <span className="truncate">{strong ? 'Featured result' : 'Result'}</span>
        </div>

        <h2
          className={`editable-display mt-4 line-clamp-3 font-black leading-[1.08] tracking-[-0.04em] text-[var(--slot4-page-text)] ${strong ? 'text-2xl sm:text-3xl' : 'text-xl'}`}
        >
          {post.title}
        </h2>

        {summary ? (
          <p className={`mt-3 text-sm leading-7 text-[var(--slot4-muted-text)] ${strong ? 'line-clamp-2' : 'line-clamp-3'}`}>{summary}</p>
        ) : null}

        <span className={`mt-auto inline-flex items-center gap-2 pt-6 ${eyebrow} text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-page-text)]`}>
          Open result
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  // Primary browse target — the first enabled task, so the CTA never points at a disabled section.
  const browseRoute = SITE_CONFIG.tasks.find((item) => item.enabled)?.route || '/'

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Editorial rule header */}
        <div className={container}>
          <div className={`flex items-center justify-between gap-4 border-b border-[var(--editable-border)] py-5 ${eyebrow} text-[var(--slot4-muted-text)]`}>
            <span>N°001</span>
            <span className="truncate">{pagesContent.search.hero.badge}</span>
          </div>
        </div>

        {/* Search-first hero */}
        <section className={`${container} py-14 sm:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="min-w-0">
              <p className={eyebrow} style={{ color: 'var(--slot4-accent-ink)' }}>{pagesContent.search.hero.badge}</p>
              <h1
                className="editable-display mt-4 font-black leading-[1] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}
              >
                {pagesContent.search.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
            </div>

            <form action="/search" className="min-w-0 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 sm:p-7">
              <input type="hidden" name="master" value="1" />

              <p className={`${eyebrow} text-[var(--slot4-muted-text)]`}>Search the index</p>

              <label className="mt-4 flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3 transition focus-within:border-[var(--slot4-accent)] focus-within:ring-2 focus-within:ring-[var(--slot4-accent)]/25">
                <Search className="h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  aria-label="Search keyword"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                />
              </label>

              <label className="mt-3 flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3 transition focus-within:border-[var(--slot4-accent)] focus-within:ring-2 focus-within:ring-[var(--slot4-accent)]/25">
                <Filter className="h-4 w-4 shrink-0 text-[var(--slot4-soft-muted-text)]" />
                <input
                  name="category"
                  defaultValue={category}
                  placeholder="Category"
                  aria-label="Category"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
                />
              </label>

              <button
                type="submit"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
          <div className={`${container} py-14 sm:py-16`}>
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--editable-border)] pb-6">
              <div className="flex min-w-0 items-end gap-4 sm:gap-6">
                <span
                  className="editable-display hidden shrink-0 font-black leading-none tracking-[-0.04em] text-[var(--editable-border)] sm:block"
                  style={{ fontSize: 'clamp(3rem,6vw,5rem)' }}
                >
                  02
                </span>
                <div className="min-w-0">
                  <p className={`${eyebrow} text-[var(--slot4-muted-text)]`}>{results.length} results</p>
                  <h2
                    className="editable-display mt-2 font-black leading-[1.05] tracking-[-0.04em]"
                    style={{ fontSize: 'clamp(1.5rem,3.5vw,2.5rem)' }}
                  >
                    {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
                  </h2>
                </div>
              </div>

              <Link
                href={browseRoute}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
              >
                Browse latest <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {results.length ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 text-center sm:p-14">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)] text-[var(--slot4-muted-text)]">
                  <SearchX className="h-6 w-6" />
                </span>
                <p
                  className="editable-display mt-6 font-black leading-[1.1] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)' }}
                >
                  No matching posts found.
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">Try a different keyword or category.</p>
                <Link
                  href={browseRoute}
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                >
                  Browse latest <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Closing dark band */}
        <section style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}>
          <div className={`${container} py-14 sm:py-16`}>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 max-w-2xl">
                <p className={eyebrow} style={{ color: 'var(--slot4-accent)' }}>N°003 — Keep exploring</p>
                <h2
                  className="editable-display mt-4 font-black leading-[1.05] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(1.75rem,4vw,3rem)' }}
                >
                  Still looking? Browse every active section of the archive.
                </h2>
              </div>
              <Link
                href={browseRoute}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                Browse latest <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
