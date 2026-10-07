// Enlace guía entre secciones (prueba EN): lleva a la persona al siguiente paso
// sin que tenga que decidir hacia dónde bajar. Solo anclas, sin eventos nuevos.
export function LandingGuide({ href, label, dark = false }: { href: string; label: string; dark?: boolean }) {
  return (
    <div className={`${dark ? 'bg-surface' : 'bg-white'} pb-10 -mt-2 flex justify-center`}>
      <a
        href={href}
        className={`inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full border transition-colors ${
          dark ? 'text-white/80 border-white/20 hover:bg-white/10' : 'text-[#0a1628] border-gray-300 hover:bg-gray-50'
        }`}
      >
        {label}
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  )
}
