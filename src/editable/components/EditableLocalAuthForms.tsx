'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'

const USERS_KEY = 'slot4:local-auth-users'
const SESSION_KEY = 'slot4:local-auth-session'

type LocalUser = {
  name: string
  email: string
  password: string
  createdAt: string
}

const readUsers = (): LocalUser[] => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveUsers = (users: LocalUser[]) => window.localStorage.setItem(USERS_KEY, JSON.stringify(users))

const saveSession = (user: Pick<LocalUser, 'name' | 'email'>) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, loggedInAt: new Date().toISOString() }))
  window.dispatchEvent(new Event('slot4-auth-change'))
}

const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]'
const inputClass =
  'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:ring-2 focus:ring-[var(--slot4-accent)]/25'
const buttonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
const buttonStyle = { background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }
const successClass = 'rounded-xl border border-[var(--slot4-accent)] bg-[var(--slot4-accent)]/15 px-4 py-3 text-sm font-bold text-[var(--slot4-page-text)]'
const errorClass = 'rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'

function StepRow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--editable-border)] pb-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">{index}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{label}</span>
    </div>
  )
}

export function EditableLocalLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const user = readUsers().find((item) => item.email.toLowerCase() === normalizedEmail)
    if (!user || user.password !== password) {
      setStatus('error')
      setMessage(pagesContent.auth.login.noAccount)
      return
    }
    saveSession(user)
    setStatus('success')
    setMessage(pagesContent.auth.login.success)
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <StepRow index="N°001" label="Credentials" />
      <div className="min-w-0">
        <label className={labelClass} htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          className={inputClass}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="min-w-0">
        <label className={labelClass} htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className={inputClass}
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {message ? (
        <p aria-live="polite" className={status === 'success' ? successClass : errorClass}>
          {message}
        </p>
      ) : null}
      <button type="submit" className={buttonClass} style={buttonStyle}>
        {pagesContent.auth.login.submitLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}

export function EditableLocalSignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    if (password.length < 4) {
      setStatus('error')
      setMessage(pagesContent.auth.signup.passwordShort)
      return
    }
    const users = readUsers()
    const nextUser: LocalUser = {
      name: normalizedName || normalizedEmail.split('@')[0] || 'Member',
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    }
    saveUsers([nextUser, ...users.filter((item) => item.email.toLowerCase() !== normalizedEmail)])
    saveSession(nextUser)
    setStatus('success')
    setMessage(pagesContent.auth.signup.success)
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <StepRow index="N°001" label="Your details" />
      <div className="min-w-0">
        <label className={labelClass} htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          className={inputClass}
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="min-w-0">
        <label className={labelClass} htmlFor="signup-email">
          Email address
        </label>
        <input
          id="signup-email"
          className={inputClass}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="min-w-0">
        <label className={labelClass} htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          className={inputClass}
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">
          Minimum 4 characters
        </p>
      </div>
      {message ? (
        <p aria-live="polite" className={status === 'success' ? successClass : errorClass}>
          {message}
        </p>
      ) : null}
      <button type="submit" className={buttonClass} style={buttonStyle}>
        {pagesContent.auth.signup.submitLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}

export function useEditableLocalAuthSession() {
  const [session, setSession] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
        setSession(parsed && typeof parsed.email === 'string' ? parsed : null)
      } catch {
        setSession(null)
      }
    }
    load()
    window.addEventListener('slot4-auth-change', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('slot4-auth-change', load)
      window.removeEventListener('storage', load)
    }
  }, [])

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('slot4-auth-change'))
    setSession(null)
  }

  return { session, logout }
}
