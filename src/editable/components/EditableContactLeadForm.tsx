'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]'
const inputClass =
  'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)] focus:ring-2 focus:ring-[var(--slot4-accent)]/25'

export function EditableContactLeadForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Unable to send your message.')
      setStatus('success')
      setMessage(data?.message || 'Thanks. Your message has been received.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8"
    >
      <StepRow index="N°001" label="Who is writing" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Full name" placeholder="Your name" autoComplete="name" required />
        <Field name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" required />
      </div>

      <div className="mt-8">
        <StepRow index="N°002" label="Where to route it" />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field name="phone" label="Phone number" placeholder="Optional" autoComplete="tel" />
        <Field name="subject" label="Subject" placeholder="How can we help?" />
      </div>

      <div className="mt-8">
        <StepRow index="N°003" label="The details" />
      </div>
      <div className="mt-5">
        <label className={labelClass} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell us what you need help with..."
          className={`${inputClass} resize-y leading-7`}
        />
      </div>

      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {message ? (
        <div
          aria-live="polite"
          className={
            status === 'success'
              ? 'mt-6 flex items-start gap-3 rounded-xl border border-[var(--slot4-accent)] bg-[var(--slot4-accent)]/15 px-4 py-3 text-sm font-bold text-[var(--slot4-page-text)]'
              : 'mt-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'
          }
        >
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span className="min-w-0 break-words">{message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send message
        {status === 'submitting' ? null : <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--slot4-soft-muted-text)]">
        Routed to the right lane, not a generic inbox
      </p>
    </form>
  )
}

function StepRow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--editable-border)] pb-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">{index}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">{label}</span>
    </div>
  )
}

function Field({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
}) {
  const id = `contact-${name}`
  return (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
      />
    </div>
  )
}
