export function LandingTrustBar({
  location,
  hours,
  certified,
  response
}: {
  location: string
  hours: string
  certified: string
  response: string
}) {
  return (
    <div className="bg-surface-container border-y border-outline-variant/10 py-4">
      <div className="max-w-screen-xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-4 text-xs md:text-sm font-body text-zinc-300">
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕐</span>
          <span>{hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span>{certified}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span>{response}</span>
        </div>
      </div>
    </div>
  )
}
