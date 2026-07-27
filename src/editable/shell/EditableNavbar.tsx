'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle, ArrowRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const SITE_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Search', href: '/search' },
  { label: 'Contact', href: '/contact' },
] as const

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  // Enabled task routes, minus any hidden from navigation, then the site pages.
  const navItems = useMemo(() => {
    const hidden = globalContent.hiddenNavTaskKeys as readonly string[]
    const tasks = SITE_CONFIG.tasks
      .filter((task) => task.enabled && !hidden.includes(task.key))
      .map((task) => ({ label: task.label, href: task.route }))
    return [...tasks, ...SITE_LINKS]
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50">
      {/* ---------- Tier 1: dark utility strip (desktop) ---------- */}
      <div className="hidden md:block" style={{ background: 'var(--slot4-dark-bg)' }}>
        <div className="mx-auto flex h-9 w-full max-w-[var(--editable-container)] items-center justify-between gap-4 px-5 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
            {globalContent.nav?.tagline || SITE_CONFIG.tagline}
          </p>

          <div className="flex items-center gap-1">
            {session ? (
              <>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition hover:opacity-80"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  <PlusCircle className="h-3 w-3" /> Post
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold text-white/50 transition hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white/55 transition hover:text-white"
                >
                  <LogIn className="h-3 w-3" /> Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition hover:opacity-80"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  <UserPlus className="h-3 w-3" /> Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Tier 2: main bar ---------- */}
      <div
        className="relative transition-shadow duration-300"
        style={{
          background: 'var(--editable-nav-bg)',
          borderBottom: `1px solid ${scrolled ? 'var(--editable-border)' : 'transparent'}`,
          boxShadow: scrolled ? '0 6px 24px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <nav className="mx-auto flex min-h-[68px] w-full max-w-[var(--editable-container)] items-center gap-4 px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 transition hover:opacity-70">
            <img
              src="/favicon.png?v=20260413"
              alt=""
              className="h-9 w-9 shrink-0 object-contain transition duration-300 group-hover:scale-105"
              width={36}
              height={36}
            />
            <span
              className="editable-display text-xl font-black leading-none tracking-[-0.04em]"
              style={{ color: 'var(--editable-nav-text)' }}
            >
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Pill nav group — sits in a tinted track so it reads as one unit */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div
              className="flex items-center gap-1 rounded-full p-1"
              style={{ background: 'var(--slot4-panel-bg)' }}
            >
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-[13px] font-bold transition duration-200 ${
                      active
                        ? 'shadow-[0_2px_8px_rgba(0,0,0,0.10)]'
                        : 'text-[var(--slot4-muted-text)] hover:bg-white/70 hover:text-[var(--slot4-page-text)]'
                    }`}
                    style={
                      active
                        ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right cluster */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <form
              action="/search"
              className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2 transition focus-within:border-[var(--slot4-accent)] focus-within:ring-2 focus-within:ring-[var(--slot4-accent)]/25 xl:flex"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                type="search"
                placeholder="Search talent..."
                className="w-32 bg-transparent text-[13px] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
            </form>

            {/* Primary CTA — dark pill with lime text, the one high-contrast action */}
            <Link
              href={session ? '/create' : '/signup'}
              className="hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-bold transition duration-200 hover:opacity-85 active:scale-[0.98] sm:inline-flex"
              style={{ background: 'var(--slot4-dark-bg)', color: 'var(--slot4-accent)' }}
            >
              {session ? 'Post your work' : 'Join free'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] transition hover:bg-[var(--slot4-panel-bg)] lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Scroll progress */}
        <div
          className="scroll-progress-bar absolute bottom-0 left-0 h-[2px] w-full origin-left"
          style={{ background: 'var(--slot4-accent)' }}
          aria-hidden="true"
        />
      </div>

      {/* ---------- Mobile drawer ---------- */}
      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.10)] lg:hidden">
          <form
            action="/search"
            className="mb-4 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2.5 focus-within:border-[var(--slot4-accent)]"
          >
            <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="Search talent..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </form>

          <div className="flex flex-col gap-1">
            {[{ label: 'Home', href: '/' }, ...navItems].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold transition"
                  style={
                    active
                      ? { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
                      : { color: 'var(--slot4-page-text)' }
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--editable-border)] pt-4">
            {session ? (
              <>
                <Link
                  href="/create"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-5 py-3 text-center text-sm font-bold"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  Post your work
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-bold text-[var(--slot4-muted-text)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-5 py-3 text-center text-sm font-bold"
                  style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                >
                  Join free
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-center text-sm font-bold text-[var(--slot4-page-text)]"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
