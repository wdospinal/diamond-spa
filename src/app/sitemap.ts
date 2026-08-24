import type { MetadataRoute } from 'next'
import { BASE_URL, X_DEFAULT_LOCALE } from '@/lib/seo'
import { SERVICES } from '@/lib/services'
import { LOCALES_DISPLAY_ORDER } from '@/lib/constants'
import { readPublishedPosts } from '@/lib/blog-store'
import type { Locale } from '@/lib/constants/locale'

// The blog section is data-backed (Supabase → KV → JSON), so the sitemap can't
// be fully static. Re-generate hourly instead of on every request.
export const revalidate = 3600

/**
 * Deployment timestamp, evaluated once when this module is first loaded.
 *
 * This used to be `new Date()` inside the loop, which stamped *every* URL with
 * the moment Googlebot happened to fetch the sitemap. A sitemap that claims all
 * 74 URLs changed seconds ago on every single fetch is a signal Google learns to
 * ignore, and lastmod stops earning recrawls. A per-deployment timestamp is the
 * honest answer for pages whose content ships with the build.
 */
const DEPLOYED_AT = new Date()

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',                          priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/services',                 priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/masajes-para-hombres',     priority: 0.9, changeFrequency: 'monthly' },
  { path: '/masajes-para-mujeres',     priority: 0.9, changeFrequency: 'monthly' },
  { path: '/depilacion-medellin',      priority: 0.9, changeFrequency: 'monthly' },
  { path: '/hydrafacial-medellin',     priority: 0.85, changeFrequency: 'monthly' },
  { path: '/dia-de-spa',               priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/spa-el-poblado',           priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/limpieza-facial-medellin', priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/massage-medellin',         priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/spa-near-me',              priority: 0.9, changeFrequency: 'monthly' },
  { path: '/blog',                     priority: 0.7, changeFrequency: 'weekly'  },
  { path: '/about',                    priority: 0.7, changeFrequency: 'monthly' },
  { path: '/location',                 priority: 0.8, changeFrequency: 'monthly' },
  { path: '/history',                  priority: 0.6, changeFrequency: 'monthly' },
  { path: '/press',                    priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy',                  priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/terms',                    priority: 0.3, changeFrequency: 'yearly'  },
]

/**
 * hreflang annotations for a URL whose slug is identical in both locales.
 *
 * Google treats sitemap `alternates` as a first-class hreflang signal, so
 * declaring them here reinforces the <link rel="alternate"> tags in <head> and
 * helps the EN pages stop being folded into their ES twins.
 */
function langAlternates(path: string): MetadataRoute.Sitemap[number]['alternates'] {
  return {
    languages: {
      es: `${BASE_URL}/es${path}`,
      en: `${BASE_URL}/en${path}`,
      'x-default': `${BASE_URL}/${X_DEFAULT_LOCALE}${path}`,
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Blog posts are read once and reused across locales — `locales` on each post
  // says which languages it was actually published in, so we never advertise an
  // /en/blog/<slug> that renders Spanish fallback copy.
  const posts = await readPublishedPosts().catch(() => [])

  for (const locale of LOCALES_DISPLAY_ORDER) {
    // Static pages
    for (const { path, priority, changeFrequency } of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: DEPLOYED_AT,
        changeFrequency,
        priority,
        alternates: langAlternates(path),
      })
    }

    // Service detail pages — English uses English slugs, Spanish uses Spanish
    for (const svc of SERVICES) {
      const slug = locale === 'en' ? svc.slugEn : svc.id
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}`,
        lastModified: DEPLOYED_AT,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            es: `${BASE_URL}/es/services/${svc.id}`,
            en: `${BASE_URL}/en/services/${svc.slugEn}`,
            'x-default': `${BASE_URL}/${X_DEFAULT_LOCALE}/services/${X_DEFAULT_LOCALE === 'en' ? svc.slugEn : svc.id}`,
          },
        },
      })
    }

    // Published blog posts. These were missing entirely, so Google had no
    // discovery path to them other than a crawl of /blog itself.
    for (const post of posts) {
      if (!post.locales.includes(locale as Locale)) continue
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries([
            ...post.locales.map(l => [l, `${BASE_URL}/${l}/blog/${post.slug}`]),
            ['x-default', `${BASE_URL}/${post.locales.includes(X_DEFAULT_LOCALE) ? X_DEFAULT_LOCALE : post.locales[0]}/blog/${post.slug}`],
          ]),
        },
      })
    }
  }

  return entries
}
