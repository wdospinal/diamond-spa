import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'
import { SERVICES } from '@/lib/services'
import { LOCALES_DISPLAY_ORDER } from '@/lib/constants'

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',                          priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/services',                 priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/masajes-para-hombres',     priority: 0.9, changeFrequency: 'monthly' },
  { path: '/dia-de-spa',               priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/spa-el-poblado',           priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/limpieza-facial-medellin', priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/massage-medellin',         priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/about',                    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/location',                 priority: 0.8, changeFrequency: 'monthly' },
  { path: '/history',                  priority: 0.6, changeFrequency: 'monthly' },
  { path: '/press',                    priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy',                  priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/terms',                    priority: 0.3, changeFrequency: 'yearly'  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES_DISPLAY_ORDER) {
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
