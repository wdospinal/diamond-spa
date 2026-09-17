import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'

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

const contentEs = readFileSync('scripts/blog-masajes-reductivos.es.html', 'utf8')

const post = {
  id: randomUUID(),
  slug: 'masajes-reductivos-funcionan',
  title: { es: '¿Los Masajes Reductivos Funcionan? La Verdad Según la Ciencia' },
  excerpt: {
    es: '¿Sirven realmente los masajes reductivos o es puro marketing? Te explicamos, con evidencia científica, qué funciona, qué es mito y qué esperar de verdad.',
  },
  content: { es: contentEs },
  category: 'bienestar',
  locales: ['es'],
  publishedAt: new Date().toISOString(),
  isDraft: false,
  authorName: 'Equipo Diamond Spa',
  metaTitle: { es: '¿Los Masajes Reductivos Funcionan? La Verdad Científica' },
  metaDescription: {
    es: 'Descubre qué dice la ciencia sobre los masajes reductivos: qué es real, qué es mito, cuántas sesiones necesitas y qué esperar en Medellín. Guía completa.',
  },
  keywords:
    'masajes reductivos, masajes reductores, funcionan los masajes reductivos, masaje reductor Medellín, cuánto se puede bajar con masajes reductores, drenaje linfático, masaje para reducir medidas, masajes reductivos cerca de mi, deep tissue Medellín, spa El Poblado',
}

const res = await fetch(`${url}/rest/v1/blog_posts`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify({ id: post.id, data: post }),
})

const out = await res.json()
console.log('Status:', res.status)
console.log('Slug:', post.slug)
console.log('ID:', post.id)
console.log(JSON.stringify(out, null, 2).slice(0, 500))
