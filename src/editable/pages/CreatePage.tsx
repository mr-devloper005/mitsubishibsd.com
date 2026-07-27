'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowRight,
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.24em]'
const labelClass = 'text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]'
const fieldClass = 'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:ring-2 focus:ring-[var(--slot4-accent)]/25'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <div className={container}>
            <div className={`flex items-center justify-between gap-4 border-b border-[var(--editable-border)] py-5 ${eyebrow} text-[var(--slot4-muted-text)]`}>
              <span>N°001</span>
              <span className="truncate">{pagesContent.create.locked.badge}</span>
            </div>
          </div>

          <section className={`${container} py-14 sm:py-16`}>
            <div className="grid gap-8 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
              <div
                className="flex min-h-64 items-center justify-center rounded-2xl p-8"
                style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
              >
                <span
                  className="inline-flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  <Lock className="h-10 w-10" />
                </span>
              </div>

              <div className="min-w-0 self-center">
                <p className={eyebrow} style={{ color: 'var(--slot4-accent-ink)' }}>{pagesContent.create.locked.badge}</p>
                <h1
                  className="editable-display mt-4 font-black leading-[1] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}
                >
                  {pagesContent.create.locked.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                    style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                  >
                    Login <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Editorial rule header */}
        <div className={container}>
          <div className={`flex items-center justify-between gap-4 border-b border-[var(--editable-border)] py-5 ${eyebrow} text-[var(--slot4-muted-text)]`}>
            <span>N°001</span>
            <span className="truncate">{pagesContent.create.hero.badge}</span>
          </div>
        </div>

        {/* Workspace hero */}
        <section className={`${container} py-14 sm:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <aside className="min-w-0">
              <p className={eyebrow} style={{ color: 'var(--slot4-accent-ink)' }}>{pagesContent.create.hero.badge}</p>
              <h1
                className="editable-display mt-4 font-black leading-[1] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}
              >
                {pagesContent.create.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>

              <div className={`mt-8 flex items-center justify-between gap-4 border-b border-[var(--editable-border)] pb-3 ${eyebrow} text-[var(--slot4-muted-text)]`}>
                <span>N°002</span>
                <span className="truncate">Content type</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      aria-pressed={active}
                      className={`min-w-0 rounded-2xl border p-4 text-left transition duration-300 ${active ? 'border-transparent shadow-[0_12px_36px_rgba(0,0,0,0.12)]' : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] hover:-translate-y-1 hover:border-[var(--slot4-accent)]'}`}
                      style={active ? { background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' } : undefined}
                    >
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                        style={active
                          ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
                          : { background: 'var(--slot4-panel-bg)', color: 'var(--slot4-page-text)' }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="mt-3 block truncate text-sm font-bold">{item.label}</span>
                      <span className={`mt-1 block text-xs leading-6 ${active ? 'opacity-70' : 'text-[var(--slot4-muted-text)]'}`}>{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="min-w-0 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--editable-border)] pb-5">
                <div className="min-w-0">
                  <p className={`${eyebrow} text-[var(--slot4-muted-text)]`}>Create {activeTask?.label || 'post'}</p>
                  <h2
                    className="editable-display mt-2 font-black leading-[1.05] tracking-[-0.04em]"
                    style={{ fontSize: 'clamp(1.5rem,3.5vw,2.25rem)' }}
                  >
                    {pagesContent.create.formTitle}
                  </h2>
                </div>
                <span
                  className="max-w-full truncate rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  {session.name}
                </span>
              </div>

              <div className="mt-6 grid gap-5">
                <label className="grid gap-2">
                  <span className={labelClass}>Title</span>
                  <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2">
                    <span className={labelClass}>Category</span>
                    <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  </label>
                  <label className="grid min-w-0 gap-2">
                    <span className={labelClass}>Source URL</span>
                    <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className={labelClass}>Featured image</span>
                  <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Summary</span>
                  <textarea className={`${fieldClass} min-h-24 leading-7`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                </label>

                <label className="grid gap-2">
                  <span className={labelClass}>Body content</span>
                  <textarea className={`${fieldClass} min-h-48 leading-7`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
                </label>
              </div>

              {created ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--slot4-accent)] bg-[var(--slot4-page-bg)] p-4">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--slot4-page-text)]">{pagesContent.create.successTitle}</p>
                    <p className="mt-1 break-words text-sm leading-7 text-[var(--slot4-muted-text)]">{created.title}</p>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>

              <p className="mt-4 text-center text-xs leading-6 text-[var(--slot4-soft-muted-text)]">
                Drafts are saved locally to this browser before review.
              </p>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
