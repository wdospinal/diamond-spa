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

// 1. Fetch the existing ES post by slug
const getRes = await fetch(
  `${url}/rest/v1/blog_posts?slug=eq.masajes-reductivos-funcionan&select=id,data`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const rows = await getRes.json()
if (!rows.length) {
  console.error('Post not found — aborting')
  process.exit(1)
}
const { id, data: existing } = rows[0]

const contentEn = readFileSync('scripts/blog-masajes-reductivos.en.html', 'utf8')

// 2. Merge EN fields into the existing post object
const updated = {
  ...existing,
  title:   { ...existing.title,   en: 'Do Slimming Massages Really Work? The Science-Backed Truth' },
  excerpt: { ...existing.excerpt, en: "Do slimming (reductive) massages actually work, or is it just marketing? Here's what the science really says — no exaggerated promises, just real answers." },
  content: { ...existing.content, en: contentEn },
  locales: Array.from(new Set([...(existing.locales || []), 'en'])),
  metaTitle: { ...existing.metaTitle, en: 'Do Slimming Massages Work? The Science-Backed Truth' },
  metaDescription: {
    ...existing.metaDescription,
    en: "Find out what science really says about slimming massages: what's real, what's a myth, how many sessions you need, and what to expect in Medellín.",
  },
  keywords: (existing.keywords || '') +
    ', slimming massage, reductive massage, does slimming massage work, slimming massage Medellin, body contouring massage, lymphatic drainage massage Medellin',
}

// 3. Upsert back
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
console.log(JSON.stringify(out, null, 2).slice(0, 300))
