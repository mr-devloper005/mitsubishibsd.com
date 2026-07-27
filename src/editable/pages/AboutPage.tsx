import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

function LabelRow({ index, label }: { index: string; label: string }) {
  return (
    <div className={container}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--editable-border)] py-5">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">{index}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{label}</span>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const about = pagesContent.about
  const paragraphs = about.paragraphs || []
  const values = about.values || []

  return (
    <EditableSiteShell>
      <main>
        {/* ================= HERO ================= */}
        <LabelRow index="N°001" label={`About ${SITE_CONFIG.name}`} />

        <section className={`${container} py-14 sm:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="min-w-0">
              {about.badge ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent-ink)]">{about.badge}</p>
              ) : null}
              <h1
                className="editable-display mt-5 font-black leading-[0.95] tracking-[-0.04em] text-[var(--slot4-page-text)]"
                style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
              >
                About {SITE_CONFIG.name}
              </h1>
              {about.title ? (
                <p className="mt-6 max-w-[70ch] text-lg font-medium leading-8 text-[var(--slot4-page-text)] sm:text-xl">
                  {about.title}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                In short
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--slot4-muted-text)]">{about.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  Get in touch <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= READING COLUMN ================= */}
        {paragraphs.length ? (
          <>
            <LabelRow index="N°002" label="The story" />
            <section className={`${container} py-14 sm:py-16`}>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
                <div className="min-w-0">
                  <h2
                    className="editable-display font-black leading-[1] tracking-[-0.04em] text-[var(--slot4-page-text)]"
                    style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)' }}
                  >
                    Why the platform exists.
                  </h2>
                </div>
                <div className="min-w-0 max-w-[70ch] space-y-6">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-[var(--slot4-muted-text)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {/* ================= PRINCIPLES / VALUES ================= */}
        {values.length ? (
          <>
            <LabelRow index="N°003" label="What we build for" />
            <section className={`${container} py-14 sm:py-16`}>
              <div className="divide-y divide-[var(--editable-border)]">
                {values.map((value, index) => (
                  <div
                    key={value.title}
                    className="grid gap-5 py-8 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)]"
                  >
                    {/* Large ghost number */}
                    <span
                      className="editable-display select-none font-black leading-none tracking-[-0.04em]"
                      style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', color: 'var(--editable-border)' }}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                        style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                      >
                        Principle {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3
                        className="editable-display mt-4 font-black leading-tight tracking-[-0.04em] text-[var(--slot4-page-text)]"
                        style={{ fontSize: 'clamp(1.375rem,2.6vw,2rem)' }}
                      >
                        {value.title}
                      </h3>
                      <p className="mt-3 max-w-[70ch] text-base leading-8 text-[var(--slot4-muted-text)]">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {/* ================= DARK CTA BAND ================= */}
        <section className={`${container} pb-14 sm:pb-16`}>
          <div
            className="overflow-hidden rounded-2xl p-8 sm:p-12 lg:p-16"
            style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-dark-text)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--slot4-accent)' }}>
              Next step
            </p>
            <h2
              className="editable-display mt-5 max-w-[24ch] font-black leading-[0.98] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
            >
              Start exploring {SITE_CONFIG.name}.
            </h2>
            <p className="mt-5 max-w-[60ch] text-base leading-8 text-white/65">
              Move between articles, visual posts, listings, and resources through one connected reading experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/article"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                Browse articles <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-[var(--slot4-dark-text)] transition hover:border-[var(--slot4-accent)]"
              >
                Contact the team
              </Link>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
