'use client'

import { pushEvent } from '@/lib/gtm'

function trackAdsClick(source: string) {
  const campaign = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sem_campaign') : null
  const adgroup  = typeof window     !== 'undefined' ? new URLSearchParams(window.location.search).get('adgroup') : null
  const payload: Record<string, string> = {
    event_label: 'general',
    source,
  }
  if (campaign) payload.campaign = campaign
  if (adgroup)  payload.adgroup  = adgroup

  pushEvent('booking_click', payload)
}

export function LandingFinalCTA({
  title,
  buttonText,
  phoneText,
  locale = 'es',
}: {
  title: string
  buttonText: string
  phoneText: string
  locale?: 'es' | 'en'
}) {
  return (
    <section className="py-24 bg-[#0a1628] text-white text-center">
      <div className="max-w-screen-md mx-auto px-6 flex flex-col items-center">
        <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-10">
          {title}
        </h2>
        
        <a
          href="#reservar"
          onClick={() => trackAdsClick('final_cta')}
          className="bg-[#C9A876] text-[#0a1628] font-medium px-10 py-4 rounded-full hover:bg-[#dbb98c] transition-colors flex items-center gap-3 mb-6 w-full sm:w-auto justify-center text-lg"
        >
          <span className="material-symbols-outlined text-xl">event</span>
          {buttonText}
        </a>

        <p className="text-white/60 text-sm">
          {locale === 'en' ? 'Call us: ' : 'Llámanos: '}{phoneText}
        </p>
      </div>
    </section>
  )
}
