import { isLocale, type Locale } from '@/lib/i18n'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'es'
  return (
    <div lang={locale}>
      <Navigation locale={locale} />
      <main className="pt-24 md:pt-28">{children}</main>
      <Footer locale={locale} />
    </div>
  )
}
