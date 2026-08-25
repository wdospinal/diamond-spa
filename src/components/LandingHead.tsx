import { getAdminSemConfig } from '@/lib/landing-meta'
import LandingSemInit from '@/components/LandingSemInit'

interface Props {
  path: string
  locale: 'es' | 'en'
}

export default async function LandingHead({ path, locale }: Props) {
  const semConfig = await getAdminSemConfig(path)

  return (
    <>
      {/*
        No hreflang here on purpose. Every page that renders LandingHead already
        emits its hreflang cluster from generateMetadata via buildAlternates().
        Emitting a second set from the body produced two <link rel="alternate">
        blocks in <head> with *different* x-default values, so Google discarded
        the cluster and filed the pages under "Duplicate without user-selected
        canonical". Keep hreflang in metadata only.
      */}

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
