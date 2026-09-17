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
  `${url}/rest/v1/blog_posts?slug=eq.masajes-reductivos-funcionan&select=id,data`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)
const rows = await getRes.json()
const { id, data: existing } = rows[0]

const updated = { ...existing, slugEn: 'do-slimming-massages-work' }

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

console.log('Status:', res.status)
console.log('slugEn set to:', updated.slugEn)
