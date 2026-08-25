import { getAdminSemConfig } from '@/lib/landing-meta'
import LandingSemInit from '@/components/LandingSemInit'
import { SPA_BASE_URL } from '@/lib/spa'

interface Props {
  path: string
  locale: 'es' | 'en'
}

export default async function LandingHead({ path, locale }: Props) {
  const semConfig = await getAdminSemConfig(path)

  const esUrl = `${SPA_BASE_URL}/es${path}`
  const enUrl = `${SPA_BASE_URL}/en${path}`

  return (
    <>
      {/* hreflang — declare ES/EN variants for Google (avoids duplicate content penalty) */}
      <link rel="alternate" hrefLang="es" href={esUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {/* x-default points to Spanish as the primary audience */}
      <link rel="alternate" hrefLang="x-default" href={esUrl} />

      {/*
        JSON-LD: NOT rendered here anymore. The parent page.tsx already
        renders one DaySpa block via localBusinessJsonLd(locale) for every
        landing on this shared route. This admin-stored block used to render
        a second, near-identical DaySpa entity with its own aggregateRating,
        which Search Console flagged as invalid ("multiple aggregate ratings
        for the same entity") on every ad landing page.
      */}

      {/* SEM trigger sync (client-side) */}
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
