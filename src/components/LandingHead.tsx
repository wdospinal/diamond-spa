import { getAdminJsonLd, getAdminSemConfig } from '@/lib/landing-meta'
import LandingSemInit from '@/components/LandingSemInit'

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

      {/* 1. Admin JSON-LD */}
      {jsonLdRaw && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdRaw.replace(/</g, '\\u003c'),
          }}
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
