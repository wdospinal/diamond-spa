import { getPlaceDetails } from '@/lib/google-places'
import { STATIC_REVIEWS } from '@/lib/reviews'
import { SPA_GOOGLE_REVIEW_URL } from '@/lib/spa'
import Image from 'next/image'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = rating >= n
        const half = !filled && rating >= n - 0.5
        return (
          <span
            key={n}
            className={`material-symbols-outlined text-sm ${filled || half ? 'text-[#C9A876]' : 'text-white/20'}`}
            style={{ fontVariationSettings: half ? "'FILL' 0" : "'FILL' 1" }}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

export function LandingTestimonials({
  title,
  items
}: {
  title?: string
  items?: { name: string; city: string; text: string }[]
}) {
  const hasManualItems = items && items.length > 0
  
  const place = getPlaceDetails()
  const apiReviews = place.reviews ?? []
  
  // Combine API and static reviews, filter for good ones with text
  const allReviews = [...apiReviews, ...STATIC_REVIEWS]
    .filter(r => r.text?.text && r.text.text.length > 30 && r.rating >= 4)
    .sort((a, b) => (b.text?.text?.length ?? 0) - (a.text?.text?.length ?? 0))
    .slice(0, 3) // Take top 3 for the landing

  if (!hasManualItems && allReviews.length === 0) return null

  return (
    <section className="py-24 bg-[#0a1628] text-white border-t border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-16 text-center">
          {title || "Lo que dicen nuestros clientes"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {hasManualItems ? (
            items.map((item, idx) => (
              <div key={idx} className="bg-white/5 p-8 rounded-2xl flex flex-col gap-6 hover:bg-white/10 transition-colors">
                <p className="text-white/80 font-body text-sm leading-relaxed italic flex-1">
                  "{item.text}"
                </p>
                <div className="pt-6 border-t border-white/10">
                  <p className="font-serif text-lg tracking-tight">
                    {item.name}
                  </p>
                  <p className="text-[#C9A876] font-label text-xs uppercase tracking-widest mt-1">
                    {item.city}
                  </p>
                </div>
              </div>
            ))
          ) : (
            allReviews.map((review, idx) => (
              <div key={idx} className="bg-white/5 p-8 rounded-2xl flex flex-col gap-6 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start">
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-white/80 font-body text-sm leading-relaxed italic flex-1 line-clamp-4 hover:line-clamp-none transition-all">
                  "{review.text?.text}"
                </p>
                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                  {review.authorAttribution?.photoUri ? (
                    <img 
                      src={review.authorAttribution.photoUri} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#C9A876]/20 flex items-center justify-center">
                      <span className="text-[#C9A876] font-bold text-sm">
                        {review.authorAttribution?.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="font-serif text-base tracking-tight">
                      {review.authorAttribution?.displayName}
                    </p>
                    <p className="text-white/50 font-body text-xs">
                      {review.relativePublishTimeDescription}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <a
            href={SPA_GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">rate_review</span>
            Déjanos una reseña en Google
          </a>
        </div>
      </div>
    </section>
  )
}
