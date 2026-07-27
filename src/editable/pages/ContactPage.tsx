'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const tone = {
  shell: 'bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]',
  container: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12',
  eyebrow: 'text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]',
  muted: 'text-[var(--slot4-muted-text)]',
}

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, boards, and links that deserve a place in the library.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className={tone.shell}>
      <main>
        <section className={`${tone.container} py-14 sm:py-16`}>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:items-start">
            <div className="min-w-0">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
              >
                {pagesContent.contact.eyebrow}
              </span>
              <h1
                className="editable-display mt-6 font-black leading-[0.98] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}
              >
                {pagesContent.contact.title}
              </h1>
              <p className={`mt-6 max-w-2xl text-base leading-7 ${tone.muted}`}>{pagesContent.contact.description}</p>

              <div className="mt-10 rounded-2xl bg-[var(--slot4-dark-bg)] p-6 text-[var(--slot4-dark-text)] sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/15 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Support lanes</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/50">
                    {String(lanes.length).padStart(2, '0')} channels
                  </span>
                </div>
                <ul className="divide-y divide-white/10">
                  {lanes.map((lane, index) => (
                    <li key={lane.title} className="flex gap-4 py-5">
                      <span
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'var(--slot4-accent)', color: 'var(--slot4-on-accent)' }}
                      >
                        <lane.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-dark-text)]/45">
                            {`N°00${index + 1}`}
                          </span>
                          <h2 className="editable-display text-lg font-black tracking-[-0.03em] sm:text-xl">{lane.title}</h2>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[var(--slot4-dark-text)]/70">{lane.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--editable-border)] pb-3">
                <span className={tone.eyebrow}>N°000</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-soft-muted-text)]">
                  Direct message
                </span>
              </div>
              <h2 className="editable-display mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {pagesContent.contact.formTitle}
              </h2>
              <p className={`mt-3 text-sm leading-7 ${tone.muted}`}>
                Fill in the three short steps below and we will reply from the matching lane.
              </p>
              <div className="mt-6">
                <EditableContactLeadForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
