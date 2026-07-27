import { siteIdentity } from '@/config/site.identity'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'

const { recipe } = getFactoryState()
const productKind = getProductKind(recipe)

export const slot4BrandConfig = {
  siteName: siteIdentity.name,
  tagline: siteIdentity.tagline,
  domain: siteIdentity.domain,
  baseUrl: siteIdentity.url,
  productKind,
  ogImage: siteIdentity.ogImage,
  // Mirrors the canonical tokens in layouts/design-contract.ts. `onPrimary` is
  // dark because the lime primary is a light color — light text on it fails contrast.
  accents: {
    primary: '#a8ff5c',
    onPrimary: '#0d0d0d',
    // Text-safe variant of the primary, for accent-colored text on light surfaces.
    primaryInk: '#355c14',
    surface: '#faf8f3',
  },
} as const
