import { getAdminJsonLd, getAdminSemConfig } from '@/lib/landing-meta'
import LandingSemInit from '@/components/LandingSemInit'
import { SPA_BASE_URL } from '@/lib/spa'

interface Props {
  path: string
  locale: 'es' | 'en'
}

export default async function LandingHead({ path, locale }: Props) {
  // Fetch both in parallel
  const [jsonLdRaw, semConfig] = await Promise.all([
    getAdminJsonLd(path, locale),
    getAdminSemConfig(path),
  ])

  const esUrl = `${SPA_BASE_URL}/es${path}`
  const enUrl = `${SPA_BASE_URL}/en${path}`

  return (
    <>
      {/* hreflang — declare ES/EN variants for Google (avoids duplicate content penalty) */}
      <link rel="alternate" hrefLang="es" href={esUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {/* x-default points to Spanish as the primary audience */}
      <link rel="alternate" hrefLang="x-default" href={esUrl} />

      {/* 1. Admin JSON-LD */}
      {jsonLdRaw && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdRaw }}
        />
      )}

      {/* 2 & 3. SEM trigger sync (client-side) */}
      {semConfig && (
        <LandingSemInit
          triggerKey={semConfig.triggerKey}
          triggerValue={semConfig.triggerValue}
          hideChrome={semConfig.hideChrome}
        />
      )}
    </>
  )
}
