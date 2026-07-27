'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquare, RotateCcw, Search } from 'lucide-react'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

type StoredComment = {
  id: string
  name: string
  email?: string
  comment: string
  createdAt: string
  articleTitle?: string
  articleSlug?: string
}

const COMMENTS_PER_PAGE = 8
const COMMENT_KEY_PREFIX = 'slot4:article-comments:'

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Just now'
  }
}

const initial = (name?: string) => ((name || '').trim()[0] || 'G').toUpperCase()

const readCommentsFromStorage = (): StoredComment[] => {
  const items: StoredComment[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(COMMENT_KEY_PREFIX)) continue
    const articleSlug = key.replace(COMMENT_KEY_PREFIX, '')
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
      if (!Array.isArray(parsed)) continue
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue
        if (typeof item.name !== 'string' || typeof item.comment !== 'string') continue
        items.push({
          id: typeof item.id === 'string' ? item.id : `${articleSlug}-${items.length}`,
          name: item.name,
          email: typeof item.email === 'string' ? item.email : undefined,
          comment: item.comment,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          articleTitle: typeof item.articleTitle === 'string' ? item.articleTitle : undefined,
          articleSlug: typeof item.articleSlug === 'string' ? item.articleSlug : articleSlug,
        })
      }
    } catch {
      // Ignore corrupted local comment records.
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default function CommentsPage() {
  const [comments, setComments] = useState<StoredComment[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setComments(readCommentsFromStorage())
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return comments
    return comments.filter((item) => {
      return [item.name, item.email, item.comment, item.articleTitle, item.articleSlug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [comments, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / COMMENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleComments = filtered.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  function refreshComments() {
    setComments(readCommentsFromStorage())
    setPage(1)
  }

  const threadCount = new Set(comments.map((item) => item.articleSlug || 'unknown')).size

  return (
    <EditableSiteShell className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* ---------- Dark editorial masthead ---------- */}
        <section style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}>
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--slot4-dark-text)]/15 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">N°001</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/45">
                Local comment archive
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                  <MessageSquare className="h-4 w-4" /> Saved in this browser
                </p>
                <h1
                  className="editable-display mt-5 font-black leading-[0.9] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(2.5rem,7vw,4.25rem)' }}
                >
                  Comments
                </h1>
                <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[var(--slot4-dark-text)]/65">
                  Every response you have written from an article page, collected in one reading list.
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-10">
                <div className="flex gap-8">
                  <div>
                    <p
                      className="editable-display font-black leading-none tracking-[-0.04em]"
                      style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}
                    >
                      {String(comments.length).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/45">
                      Comments
                    </p>
                  </div>
                  <div>
                    <p
                      className="editable-display font-black leading-none tracking-[-0.04em]"
                      style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}
                    >
                      {String(threadCount).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/45">
                      Threads
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                  onClick={refreshComments}
                >
                  <RotateCcw className="h-4 w-4" /> Refresh comments
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Toolbar + thread ---------- */}
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-5 py-3 sm:px-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">
                Filter the archive
              </p>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <label className="grid w-full gap-2 sm:max-w-md">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]">
                  Search
                </span>
                <span className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-soft-muted-text)]" />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setPage(1)
                    }}
                    placeholder="Search comments..."
                    className="w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] py-3 pl-11 pr-4 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] hover:border-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:ring-2 focus:ring-[var(--slot4-accent)]/25"
                  />
                </span>
              </label>

              <p className="text-xs leading-6 text-[var(--slot4-soft-muted-text)]">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {visibleComments.length ? (
            <ol className="mt-10 grid gap-4">
              {visibleComments.map((item, index) => {
                const rank = (currentPage - 1) * COMMENTS_PER_PAGE + index + 1
                return (
                  <li
                    key={`${item.articleSlug}-${item.id}`}
                    className="group overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:border-[var(--slot4-accent)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--editable-border)] px-5 py-3 sm:px-6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                        N°{String(rank).padStart(3, '0')}
                      </span>
                      <span className="text-xs text-[var(--slot4-soft-muted-text)]">
                        {item.createdAt ? formatDate(item.createdAt) : 'Just now'}
                      </span>
                    </div>

                    <div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)] text-sm font-black tracking-[-0.02em] text-[var(--slot4-page-text)] transition duration-300 group-hover:bg-[var(--slot4-accent)]">
                        {initial(item.name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold text-[var(--slot4-page-text)]">
                          {item.name || 'Guest'}
                        </p>
                        {item.email ? (
                          <p className="mt-1 break-words text-xs text-[var(--slot4-soft-muted-text)]">{item.email}</p>
                        ) : null}

                        <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[var(--slot4-muted-text)]">
                          {item.comment || 'No comment text provided.'}
                        </p>

                        {item.articleTitle || item.articleSlug ? (
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-[var(--editable-border)] pt-4">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                                On article
                              </p>
                              <p className="mt-1 break-words text-sm font-bold text-[var(--slot4-page-text)]">
                                {item.articleTitle || item.articleSlug}
                              </p>
                            </div>
                            {item.articleSlug ? (
                              <Link
                                href={`/article/${item.articleSlug}`}
                                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                              >
                                Open article <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)]">
                <MessageSquare className="h-5 w-5 text-[var(--slot4-muted-text)]" />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                {query.trim() ? 'Nothing matched' : 'Empty archive'}
              </p>
              <h2
                className="editable-display mt-3 font-black tracking-[-0.04em] text-[var(--slot4-page-text)]"
                style={{ fontSize: 'clamp(1.5rem,3.5vw,2.5rem)' }}
              >
                {query.trim() ? 'No results found' : 'No comments yet'}
              </h2>
              <p className="mx-auto mt-4 max-w-md break-words text-sm leading-7 text-[var(--slot4-muted-text)]">
                {query.trim()
                  ? 'Try a shorter search term, or clear the field to see every saved comment.'
                  : 'Add a comment on any article page and it will appear here.'}
              </p>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setPage(1)
                  }}
                  className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  Clear search
                </button>
              ) : null}
            </div>
          )}

          {filtered.length > COMMENTS_PER_PAGE ? (
            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">
                Page {currentPage} <span className="text-[var(--slot4-soft-muted-text)]">of {totalPages}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--editable-border)]"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--editable-border)]"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}
