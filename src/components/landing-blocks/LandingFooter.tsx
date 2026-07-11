import Link from 'next/link'

export function LandingFooter({
  phoneText,
  address,
  hours,
  locale = 'es',
}: {
  phoneText: string
  address: string
  hours: string
  locale?: 'es' | 'en'
}) {
  const t = {
    hours:     locale === 'en' ? 'Hours'                        : 'Horario',
    legal:     locale === 'en' ? 'Legal'                        : 'Legal',
    privacy:   locale === 'en' ? 'Privacy Policy'               : 'Política de Privacidad',
    terms:     locale === 'en' ? 'Terms & Conditions'           : 'Términos y Condiciones',
    copyright: locale === 'en' ? 'All rights reserved.'         : 'Todos los derechos reservados.',
  }

  return (
    <footer className="bg-surface-container py-16 border-t border-outline-variant/10">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-headline text-xl tracking-tight text-on-surface mb-2">
            DIAMOND SPA
          </Link>
          <p className="text-zinc-400 font-body text-sm leading-relaxed">
            {address}
          </p>
          <p className="text-zinc-400 font-body text-sm leading-relaxed">
            Tel: {phoneText}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-label text-sm uppercase tracking-widest text-on-surface mb-2">{t.hours}</h3>
          <p className="text-zinc-400 font-body text-sm leading-relaxed whitespace-pre-line">
            {hours}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-label text-sm uppercase tracking-widest text-on-surface mb-2">{t.legal}</h3>
          <Link href={`/${locale}/privacy`} className="text-zinc-400 hover:text-primary font-body text-sm transition-colors">
            {t.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="text-zinc-400 hover:text-primary font-body text-sm transition-colors">
            {t.terms}
          </Link>
        </div>

      </div>
      
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-outline-variant/10 flex justify-between items-center text-xs text-zinc-500 font-body">
        <p>© {new Date().getFullYear()} Diamond Spa. {t.copyright}</p>
      </div>
    </footer>
  )
}
