import { readFile } from 'fs/promises'
import { join } from 'path'

const ROOT = process.cwd()

try {
  const env = await readFile(join(ROOT, '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
} catch {
}

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function run() {
  console.log('Fetching landing dummy-landing-1234...')
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/landings?id=eq.dummy-landing-1234&select=data`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    }
  })
  
  const rows = await res.json()
  if (!rows || rows.length === 0) {
    console.error('Landing not found in Supabase!')
    process.exit(1)
  }
  
  const data = rows[0].data
  
  // Inject into whyUs pillars
  const pillars = data.content.whyUs.pillars
  pillars[0].body = "Instalaciones de lujo en el corazón de El Poblado. Como un spa exclusivo para caballeros, diseñamos cada espacio para garantizar total privacidad durante tus masajes relajantes para hombres."
  pillars[1].body = "Cosmetólogas y masajistas para hombres en Medellín con más de 3 años de experiencia. Formación certificada y resultados garantizados en cada terapia muscular."
  pillars[2].body = "El único spa solo para hombres en Medellín con salas individuales de acceso privado, camillas profesionales y temperatura ideal. Tu espacio seguro."
  
  // Inject into testimonials
  data.content.testimonials.items[0].text = "Buscaba masajes Medellín para hombres y encontré este spa. La masoterapeuta fue excelente, el nivel de profesionalismo es altísimo."
  data.content.testimonials.items[1].text = "El mejor spa para hombres en Medellín sin lugar a dudas. La técnica de tejido profundo y el nivel de higiene son de primera calidad."
  
  // Upsert
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/landings`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{ id: data.id, data }]),
  })
  
  if (!upsertRes.ok) {
    console.error('Failed to update:', await upsertRes.text())
    process.exit(1)
  }
  
  console.log('Successfully injected SEO keywords into Supabase!')
}

run()
