import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { buildAlternates, buildOpenGraph } from '@/lib/seo'
import { SPA_EMAIL, SPA_INSTAGRAM, SPA_TIKTOK, SPA_ADDRESS, SPA_NAME_FULL } from '@/lib/spa'
import { IGIcon, MailIcon, TikTokIcon } from '@/components/SocialIcons'
import { TrackedSocialLink } from '@/components/TrackedSocialLink'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : 'en'
  const { metaTitle: title, metaDesc: description } = getDict(locale).legal.press
  return {
    title,
    description,
    alternates: buildAlternates('/press', locale),
    openGraph: buildOpenGraph({ title, description, path: '/press', locale }),
  }
}

export default async function PressPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale = lang as Locale

  const isEn = locale === 'en'

  return (
    <>
      {/* Hero */}
      <header className="pt-40 pb-16 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-5 block">
            {isEn ? 'Media & Press' : 'Prensa y Medios'}
          </span>
          <h1 className="font-headline text-6xl md:text-8xl text-on-surface font-light leading-tight">
            {isEn ? 'Press Room' : 'Sala de Prensa'}
          </h1>
          <p className="mt-8 text-on-surface-variant text-lg max-w-xl font-light leading-relaxed">
            {isEn
              ? `For media inquiries, interview requests, photography, or brand partnerships, reach out directly. We respond within two business days.`
              : `Para consultas de medios, solicitudes de entrevistas, fotografía o alianzas de marca, contáctenos directamente. Respondemos en dos días hábiles.`}
          </p>
        </div>
      </header>

      {/* Contact card */}
      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="font-headline text-2xl text-on-surface mb-8">
                {isEn ? 'Media Contact' : 'Contacto de Prensa'}
              </h2>
              <div className="flex flex-col gap-5">
                <TrackedSocialLink
                  href={`mailto:${SPA_EMAIL}`}
                  platform="email"
                  source="press"
                  className="flex items-center gap-4 group"
                  aria-label={isEn ? `Email ${SPA_EMAIL}` : `Correo ${SPA_EMAIL}`}
                >
                  <span className="w-10 h-10 bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                    <MailIcon size={22} />
                  </span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-0.5">{isEn ? 'Email' : 'Correo'}</p>
                    <p className="font-body text-on-surface text-sm">{SPA_EMAIL}</p>
                  </div>
                </TrackedSocialLink>

                <TrackedSocialLink
                  href={SPA_INSTAGRAM}
                  platform="instagram"
                  source="press"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                  aria-label={isEn ? 'Diamond Spa on Instagram' : 'Diamond Spa en Instagram'}
                >
                  <span className="w-10 h-10 bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                    <IGIcon size={22} />
                  </span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-0.5">Instagram</p>
                    <p className="font-body text-on-surface text-sm">@diamondmassagesmed</p>
                  </div>
                </TrackedSocialLink>

                <TrackedSocialLink
                  href={SPA_TIKTOK}
                  platform="tiktok"
                  source="press"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                  aria-label={isEn ? 'Diamond Spa on TikTok' : 'Diamond Spa en TikTok'}
                >
                  <span className="w-10 h-10 bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                    <TikTokIcon size={22} />
                  </span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-0.5">TikTok</p>
                    <p className="font-body text-on-surface text-sm">@diamond.spa95</p>
                  </div>
                </TrackedSocialLink>
              </div>
            </div>

            {/* Brand kit quick facts */}
            <div>
              <h2 className="font-headline text-2xl text-on-surface mb-8">
                {isEn ? 'Brand Facts' : 'Datos de Marca'}
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  [isEn ? 'Full name' : 'Nombre completo', SPA_NAME_FULL],
                  [isEn ? 'Location' : 'Ubicación', SPA_ADDRESS.full],
                  [isEn ? 'Neighbourhood' : 'Barrio', `${SPA_ADDRESS.neighborhood}, ${SPA_ADDRESS.city}`],
                  [isEn ? 'Rating' : 'Calificación', '4.9 ★ Google (102+ reviews)'],
                  [isEn ? 'Languages' : 'Idiomas', isEn ? 'Spanish & English' : 'Español e Inglés'],
                  [isEn ? 'Hours (Mon–Sat)' : 'Horario (Lun–Sáb)', '10:00 AM – 10:00 PM'],
                  [isEn ? 'Hours (Sun)' : 'Horario (Dom)', '10:00 AM – 7:00 PM'],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-3 border-b border-outline-variant/10">
                    <span className="font-label text-[10px] uppercase tracking-widest text-outline w-32 shrink-0 pt-0.5">{label}</span>
                    <span className="font-body text-on-surface text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example post / content feature */}
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <span className="font-label text-primary tracking-[0.3em] uppercase text-xs mb-6 block">
            {isEn ? 'Featured Content' : 'Contenido Destacado'}
          </span>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface font-light mb-16">
            {isEn ? 'From our social media' : 'Desde nuestras redes sociales'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Post card */}
            <div className="bg-surface-container-low ring-1 ring-outline-variant/10 overflow-hidden">
              {/* Post header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                  <Image src="/logo.webp" alt="Diamond Spa" width={36} height={36} className="object-cover" />
                </div>
                <div>
                  <p className="font-label text-on-surface text-xs tracking-wider">diamond.spa95</p>
                  <p className="font-body text-outline text-[11px]">{isEn ? 'El Poblado, Medellín' : 'El Poblado, Medellín'}</p>
                </div>
                <a
                  href={SPA_TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isEn ? 'Follow on TikTok' : 'Seguir en TikTok'}
                  className="ml-auto text-primary hover:text-on-surface transition-colors"
                >
                  <TikTokIcon size={22} />
                </a>
              </div>

              {/* Post image */}
              <div className="relative aspect-square bg-surface-container-high overflow-hidden">
                <Image
                  src="/masaje.avif"
                  alt={isEn ? 'Relaxing massage session at Diamond Spa Medellín' : 'Sesión de masaje relajante en Diamond Spa Medellín'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Post caption */}
              <div className="px-5 py-4">
                <p className="font-body text-on-surface text-sm leading-relaxed">
                  {isEn
                    ? '✨ Because your body deserves the best. Deep tissue, four-hands, volcanic stones — every session is designed to give you back what the week took from you. Private rooms. Bilingual staff. El Poblado, Medellín.'
                    : '✨ Porque tu cuerpo merece lo mejor. Tejido profundo, cuatro manos, piedras volcánicas — cada sesión está diseñada para devolverte lo que la semana te quitó. Salas privadas. Atención bilingüe. El Poblado, Medellín.'}
                </p>
                <p className="mt-3 font-label text-primary text-xs tracking-wider">
                  #DiamondSpa #MasajesMedellin #ElPoblado #SpaLujo #MedellinColombia
                </p>
              </div>

              {/* Follow CTA */}
              <div className="px-5 pb-5 flex gap-3">
                <a
                  href={SPA_TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-primary text-on-primary py-3 font-label text-xs tracking-widest uppercase hover:bg-white transition-all"
                >
                  {isEn ? 'Follow on TikTok' : 'Seguir en TikTok'}
                </a>
                <a
                  href={SPA_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center border border-outline-variant text-on-surface py-3 font-label text-xs tracking-widest uppercase hover:bg-surface-container transition-all"
                >
                  {isEn ? 'Follow on Instagram' : 'Seguir en Instagram'}
                </a>
              </div>
            </div>

            {/* Usage rights */}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-headline text-xl text-on-surface mb-4">
                  {isEn ? 'Usage Rights' : 'Derechos de Uso'}
                </h3>
                <p className="font-body text-secondary text-sm leading-relaxed">
                  {isEn
                    ? `Journalists and content creators may use the ${SPA_NAME_FULL} name, logo, and photography for editorial coverage with proper attribution. Commercial use requires written approval. Please reach out before publishing.`
                    : `Periodistas y creadores de contenido pueden usar el nombre, logotipo y fotografías de ${SPA_NAME_FULL} para cobertura editorial con atribución correcta. El uso comercial requiere aprobación escrita. Por favor contáctenos antes de publicar.`}
                </p>
              </div>

              <div>
                <h3 className="font-headline text-xl text-on-surface mb-4">
                  {isEn ? 'Response Time' : 'Tiempo de Respuesta'}
                </h3>
                <p className="font-body text-secondary text-sm leading-relaxed">
                  {isEn
                    ? 'We respond to all media inquiries within two business days. For urgent requests, please indicate it in your subject line.'
                    : 'Respondemos a todas las consultas de medios en dos días hábiles. Para solicitudes urgentes, indíquelo en el asunto de su mensaje.'}
                </p>
              </div>

              <div>
                <h3 className="font-headline text-xl text-on-surface mb-4">
                  {isEn ? 'Collaborations' : 'Colaboraciones'}
                </h3>
                <p className="font-body text-secondary text-sm leading-relaxed">
                  {isEn
                    ? 'We welcome collaborations with travel bloggers, wellness creators, and lifestyle media. If your audience values quality experiences in Medellín, we would love to connect.'
                    : 'Damos la bienvenida a colaboraciones con bloggers de viajes, creadores de bienestar y medios de estilo de vida. Si tu audiencia valora experiencias de calidad en Medellín, nos encantaría conectar.'}
                </p>
              </div>

              <Link
                href={`mailto:${SPA_EMAIL}`}
                className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all w-fit"
              >
                <MailIcon size={22} />
                {isEn ? 'Contact Press Team' : 'Contactar Prensa'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
