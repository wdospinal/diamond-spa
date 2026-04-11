import { isLocale } from '@/lib/i18n'

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const lang = isLocale(params.lang) ? params.lang : 'es'
  return <div lang={lang}>{children}</div>
}
