'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const hiddenTasks = globalContent.hiddenNavTaskKeys as readonly string[]
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTasks.includes(task.key))
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer style={{ background: 'var(--editable-footer-bg)', color: 'var(--editable-footer-text)' }}>
      {/* Large site name — WEMBS-style display block */}
      <div className="overflow-hidden border-b border-white/10 px-5 py-10 sm:px-8 sm:py-14">
        <p
          className="editable-display select-none font-black leading-none tracking-[-0.05em]"
          style={{ fontSize: 'clamp(3.5rem,13vw,10rem)', color: 'var(--slot4-accent)', lineHeight: 0.88 }}
          aria-hidden="true"
        >
          {SITE_CONFIG.name}
        </p>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
          {globalContent.footer?.description || SITE_CONFIG.description}
        </p>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link href="/" className="group inline-flex items-center gap-2.5 transition hover:opacity-80">
            <img
              src="/favicon.png?v=20260413"
              alt=""
              className="h-10 w-10 shrink-0 object-contain transition duration-300 group-hover:scale-105"
              width={40}
              height={40}
            />
            <span className="editable-display text-xl font-black tracking-[-0.03em] text-white transition group-hover:text-[var(--slot4-accent)]">
              {SITE_CONFIG.name}
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/45">
            The creative freelancer directory — browse images, profiles, and portfolio posts from independent talent worldwide.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-80"
              style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
            >
              Join as a freelancer
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/40 hover:text-white"
            >
              Contact us
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.26em] text-white/35">Explore</h3>
          <div className="flex flex-col gap-3">
            {taskLinks.map((task) => (
              <Link
                key={task.key}
                href={task.route}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
              >
                {task.label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.26em] text-white/35">Site</h3>
          <div className="flex flex-col gap-3">
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Search', '/search'],
              ...(session
                ? [['Post content', '/create']]
                : [['Sign in', '/login'], ['Join free', '/signup']]),
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-white/60 transition hover:text-white"
              >
                {label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-sm font-medium text-white/60 transition hover:text-white"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-[0.1em] text-white/25">
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs font-medium text-white/25">Creative freelancer directory</p>
        </div>
      </div>
    </footer>
  )
}
