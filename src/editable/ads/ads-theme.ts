// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — matches the cream/lime editorial system.
// Radius 16px == rounded-2xl, the card radius used across the site.
// The label uses lime with dark text; lime is a light color, so light text on
// it would be unreadable.
export const adSkin: AdSkin = {
  radius: '16px',
  border: '1px solid #d8d3ca',
  shadow: '0 1px 4px rgba(0,0,0,0.06)',
  background: '#faf8f3',
  labelClassName: 'bg-[#a8ff5c] text-[#0d0d0d]',
}

// Optional per-slot overrides — adjust only where you need to.
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '16px', shadow: 'none', border: '1px solid #d8d3ca' },
  popup: { radius: '16px', shadow: '0 12px 36px rgba(0,0,0,0.12)' },
  header: { radius: '16px', background: '#e8e4db' },
  rail: { radius: '12px' },
  feature: { radius: '16px', shadow: '0 12px 36px rgba(0,0,0,0.12)' },
  // Dark overlay contexts — flip to the forest surface so the frame doesn't glare.
  interstitial: { radius: '16px', background: '#18221e', border: '1px solid rgba(255,255,255,0.10)', shadow: '0 20px 60px rgba(0,0,0,0.5)' },
  anchor: { radius: '12px', shadow: '0 6px 24px rgba(0,0,0,0.18)' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
