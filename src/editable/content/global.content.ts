import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Independent reading platform',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  // Task keys hidden from navigation surfaces (nav, footer, home chips).
  // Their routes and detail pages keep working — they are only unlinked.
  hiddenNavTaskKeys: ['profile'],
  nav: {
    tagline: 'Creative freelancer directory',
    primaryLinks: [
      { label: 'Images', href: '/image-sharing' },
      { label: 'Profiles', href: '/profiles' },
      { label: 'Listings', href: '/listings' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse talent', href: '/' },
      secondary: { label: 'Post your work', href: '/create' },
    },
  },
  footer: {
    tagline: 'Creative freelancer directory',
    description: 'Browse images, portfolios, and professional profiles from independent freelancers across every creative discipline.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Articles', href: '/articles' },
          { label: 'Listings', href: '/listings' },
          { label: 'Images', href: '/image-sharing' },
          { label: 'PDF Library', href: '/pdf' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built for clean discovery and connected publishing.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
