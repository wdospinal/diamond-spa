import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const url = env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

const getRes = await fetch(
  `${url}/rest/v1/blog_posts?slug=eq.beneficios-masaje-relajante&select=id,data`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const rows = await getRes.json()
if (!rows.length) {
  console.error('Post not found — aborting')
  process.exit(1)
}
const { id, data: existing } = rows[0]

const contentEn = readFileSync('scripts/blog-beneficios-masaje-relajante.en.html', 'utf8')

const updated = {
  ...existing,
  slugEn: 'swedish-massage-benefits-stress-relief',
  title: { ...existing.title, en: 'Swedish Massage Benefits for Stress Relief: What the Science Really Says' },
  excerpt: {
    ...existing.excerpt,
    en: 'Which benefits of Swedish massage actually have scientific backing, and which are just repeated blog claims? We reviewed the evidence, no exaggeration.',
  },
  content: { ...existing.content, en: contentEn },
  locales: Array.from(new Set([...(existing.locales || []), 'en'])),
  metaTitle: { ...existing.metaTitle, en: 'Swedish Massage Benefits for Stress Relief | Diamond Spa' },
  metaDescription: {
    ...existing.metaDescription,
    en: 'Discover the real benefits of Swedish massage for stress relief, backed by science, not spa myths. What\u2019s proven, what\u2019s mixed, and what to expect in Medell\u00edn.',
  },
  keywords: (existing.keywords || '') +
    ', massage for stress relief, massage for tight muscles, benefits of swedish massage, massage for anxiety, relaxing massage benefits',
}

const res = await fetch(`${url}/rest/v1/blog_posts`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify({ id, data: updated }),
})

const out = await res.json()
console.log('Status:', res.status)
console.log('Locales now:', updated.locales)
console.log('slugEn:', updated.slugEn)
console.log(JSON.stringify(out, null, 2).slice(0, 300))
