'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name?: string) {
  return ((name || '').trim()[0] || 'G').toUpperCase()
}

const inputClass =
  'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] hover:border-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:ring-2 focus:ring-[var(--slot4-accent)]/25'

const labelClass = 'text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]'

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  // Load this article's comments after mount (initial render stays in sync with
  // the server so there's no hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* storage unavailable — keep the in-memory list */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  // User comments (newest first) sit above any existing comments.
  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-16 border-t border-[var(--editable-border)] pt-12">
      {/* Editorial label row */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--editable-border)] pb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent-ink)]">
          N°{String(Math.max(all.length, 1)).padStart(3, '0')}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
          Reader responses
        </p>
      </div>

      {/* Title + count badge, with a large ghost number motif */}
      <div className="mt-7 flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)]">
            <MessageCircle className="h-4 w-4 text-[var(--slot4-page-text)]" />
          </span>
          <h2
            className="editable-display font-black leading-[0.95] tracking-[-0.04em] text-[var(--slot4-page-text)]"
            style={{ fontSize: 'clamp(1.5rem,3.5vw,2.5rem)' }}
          >
            Comments
          </h2>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
          >
            {all.length} {all.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="editable-display hidden shrink-0 select-none font-black leading-none tracking-[-0.05em] text-[var(--editable-border)] sm:block"
          style={{ fontSize: 'clamp(3rem,7vw,5rem)' }}
        >
          {String(all.length).padStart(2, '0')}
        </span>
      </div>

      {/* Submission form */}
      <form
        onSubmit={submit}
        className="mt-8 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 focus-within:border-[var(--slot4-accent)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-5 py-3 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">
            Join the thread
          </p>
          <p className="text-xs text-[var(--slot4-soft-muted-text)]">{text.length}/1500</p>
        </div>

        <div className="grid gap-5 p-5 sm:p-6">
          <label className="grid gap-2">
            <span className={labelClass}>Your name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name (optional)"
              maxLength={60}
              className={inputClass}
            />
          </label>

          <label className="grid gap-2">
            <span className={labelClass}>Comment</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Share your thoughts…"
              rows={4}
              maxLength={1500}
              className={`${inputClass} resize-y leading-7`}
            />
          </label>

          <div className="flex flex-col-reverse items-stretch gap-4 border-t border-[var(--editable-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-[var(--slot4-soft-muted-text)]">
              Saved locally in this browser.
            </p>
            <button
              type="submit"
              disabled={!text.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
            >
              <Send className="h-4 w-4" /> Post comment
            </button>
          </div>
        </div>
      </form>

      {/* Thread */}
      {all.length ? (
        <ol className="mt-8 grid gap-4">
          {all.map((comment, index) => (
            <li
              key={comment.id || `comment-${index}`}
              className="group overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:border-[var(--slot4-accent)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--editable-border)] px-5 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                  N°{String(all.length - index).padStart(3, '0')}
                </span>
                {comment.createdAt ? (
                  <span className="text-xs text-[var(--slot4-soft-muted-text)]">{timeAgo(comment.createdAt)}</span>
                ) : null}
              </div>

              <div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)] text-sm font-black tracking-[-0.02em] text-[var(--slot4-page-text)] transition duration-300 group-hover:bg-[var(--slot4-accent)]">
                  {initial(comment.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-bold text-[var(--slot4-page-text)]">
                    {comment.name || 'Guest'}
                  </p>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[var(--slot4-muted-text)]">
                    {comment.comment || 'No comment text provided.'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-panel-bg)]">
            <MessageCircle className="h-5 w-5 text-[var(--slot4-muted-text)]" />
          </span>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
            Empty thread
          </p>
          <h3
            className="editable-display mt-3 font-black tracking-[-0.04em] text-[var(--slot4-page-text)]"
            style={{ fontSize: 'clamp(1.25rem,3vw,1.75rem)' }}
          >
            No comments yet
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[var(--slot4-muted-text)]">
            Be the first to comment. Your response opens the thread for everyone who reads next.
          </p>
        </div>
      )}
    </section>
  )
}
