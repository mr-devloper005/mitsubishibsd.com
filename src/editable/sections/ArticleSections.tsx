import Link from 'next/link'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

function LabelRow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--editable-border)] py-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">{index}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{label}</span>
    </div>
  )
}

export function EditableArticleArchive({ posts, pagination, category = 'all', basePath = '/article' }: { posts: SitePost[]; pagination: SiteFeedPagination; category?: string; basePath?: string }) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) => `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`
  const categoryHref = (slug: string) => (slug === 'all' ? basePath : `${basePath}?${new URLSearchParams({ category: slug }).toString()}`)
  const activeCategory = category || 'all'

  return (
    <main className={dc.shell.page}>
      {/* ================= HERO ================= */}
      <section className={dc.shell.section}>
        <LabelRow index="N°001" label={voice.eyebrow} />
      </section>

      <section className={`${dc.shell.section} py-14 sm:py-16`}>
        <div
          className="overflow-hidden rounded-2xl p-7 sm:p-10 lg:p-14"
          style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--slot4-accent)' }}>
            {voice.eyebrow}
          </p>
          <h1
            className="editable-display mt-5 max-w-[24ch] font-black leading-[0.98] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
          >
            {voice.headline}
          </h1>
          <p className="mt-6 max-w-[70ch] text-base leading-8 text-white/65">{voice.description}</p>

          <form action={basePath} className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="article-category">{voice.filterLabel}</label>
            <select
              id="article-category"
              name="category"
              defaultValue={activeCategory}
              className="min-w-0 flex-1 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3 text-sm font-bold text-[var(--slot4-page-text)] outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <button
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
              style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
            >
              Filter
            </button>
          </form>
        </div>
      </section>

      {/* ================= CATEGORY RAIL ================= */}
      <section className={dc.shell.section}>
        <LabelRow index="N°002" label={voice.filterLabel} />
        <div className="flex snap-x gap-2 overflow-x-auto py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ name: 'All articles', slug: 'all' }, ...CATEGORY_OPTIONS].map((item) => {
            const isActive = activeCategory === item.slug
            return (
              <Link
                key={item.slug}
                href={categoryHref(item.slug)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'border-transparent'
                    : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-muted-text)] hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)]'
                }`}
                style={isActive ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' } : undefined}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </section>

      {/* ================= LIST ================= */}
      <section className={`${dc.shell.section} py-14 sm:py-16`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => <ArticleListCard key={post.id} post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />)}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 text-center sm:p-14">
            <span
              className="editable-display block select-none font-black leading-none tracking-[-0.04em]"
              style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
              aria-hidden="true"
            >
              00
            </span>
            <h2
              className="editable-display mt-4 font-black tracking-[-0.04em] text-[var(--slot4-page-text)]"
              style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)' }}
            >
              No articles found
            </h2>
            <p className="mx-auto mt-3 max-w-[60ch] text-base leading-8 text-[var(--slot4-muted-text)]">
              Try another category or return to all articles.
            </p>
            <Link
              href={basePath}
              className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
              style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
            >
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--editable-border)] pt-8">
          {pagination.hasPrevPage ? (
            <Link
              href={pageHref(page - 1)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Link>
          ) : null}
          <span
            className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold"
            style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
          >
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link
              href={pageHref(page + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  const title = post?.title || pagesContent.detailPages.article.fallbackTitle
  const body = post?.summary || `Article detail content for ${slug} will render through the editable detail page.`

  return (
    <main className={dc.shell.page}>
      {/* ================= HEADER ================= */}
      <section className={dc.shell.section}>
        <LabelRow index="N°001" label={voice.eyebrow} />
      </section>

      <section className={`${dc.shell.section} py-12 sm:py-14`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
          {/* Title panel */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8 lg:p-10">
            <Link
              href="/article"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-2.5 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
            >
              <ChevronLeft className="h-4 w-4" /> Articles
            </Link>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--slot4-accent-ink)' }}>
              {voice.eyebrow}
            </p>
            <h1
              className="editable-display mt-4 max-w-[26ch] break-words font-black leading-[0.98] tracking-[-0.04em] text-[var(--slot4-page-text)]"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
            >
              {title}
            </h1>
          </div>

          {/* Reading note sidebar */}
          <aside
            className="min-w-0 overflow-hidden rounded-2xl p-6 sm:p-8"
            style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--slot4-accent)' }}>
              Reading note
            </p>
            <p className="mt-4 text-base leading-8 text-white/65">{voice.secondaryNote}</p>
            <div className="mt-6 border-t border-white/10 pt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                Contact <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ================= BODY ================= */}
      <section className={`${dc.shell.section} pb-16 sm:pb-20`}>
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8 lg:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
            The read
          </p>
          <div className="article-content mt-5 max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">
            <p>{body}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
