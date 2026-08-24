import { permanentRedirect } from 'next/navigation'
import { DEFAULT_LOCALE } from '@/lib/constants'

/**
 * `/` has no content of its own — the site is entirely under /es and /en.
 *
 * This used to `return null`, i.e. serve a 200 with an empty <body>. In
 * production a Vercel project-level redirect happens to intercept `/` first, so
 * the emptiness was invisible; but nothing in this repo guaranteed that, and if
 * that dashboard rule were ever removed the site's most-linked URL would quietly
 * start serving a blank page to Googlebot. Redirect explicitly instead.
 */
export default function RootPage() {
  permanentRedirect(`/${DEFAULT_LOCALE}`)
}
