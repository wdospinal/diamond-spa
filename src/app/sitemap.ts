import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'
import { SERVICES } from '@/lib/services'

const LOCALES = ['es', 'en'] as const

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',           priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/services',              priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/masajes-para-hombres', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about',     priority: 0.7, changeFrequency: 'monthly' },
  { path: '/location',  priority: 0.8, changeFrequency: 'monthly' },
  { path: '/history',   priority: 0.6, changeFrequency: 'monthly' },
  { path: '/press',     priority: 0.4, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    // Static pages
    for (const { path, priority, changeFrequency } of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
      })
    }

    // Service detail pages
    for (const svc of SERVICES) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${svc.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return entries
}
