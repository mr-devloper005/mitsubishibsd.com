import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

const panelRows = [
  { index: 'N°001', label: 'Account created on this device' },
  { index: 'N°002', label: 'Publishing workspace access' },
  { index: 'N°003', label: 'Submit content through the site' },
]

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-start lg:gap-10">
            <div className="min-w-0 rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--editable-border)] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">N°000</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">New account</span>
              </div>
              <h1 className="editable-display mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {pagesContent.auth.signup.formTitle}
              </h1>
              <div className="mt-6">
                <EditableLocalSignupForm />
              </div>
              <div className="mt-8 border-t border-[var(--editable-border)] pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-soft-muted-text)]">
                  Already have an account?
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)]"
                >
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl bg-[var(--slot4-dark-bg)] p-6 text-[var(--slot4-dark-text)] sm:p-8 lg:p-10">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                {pagesContent.auth.signup.badge}
              </span>
              <h2
                className="editable-display mt-6 max-w-xl font-black leading-[0.98] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
              >
                {pagesContent.auth.signup.title}
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-[var(--slot4-dark-text)]/70">
                {pagesContent.auth.signup.description}
              </p>
              <ul className="mt-10 border-t border-white/15">
                {panelRows.map((row) => (
                  <li key={row.index} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 py-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{row.index}</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/60">{row.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
