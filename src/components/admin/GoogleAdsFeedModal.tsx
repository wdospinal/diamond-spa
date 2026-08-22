'use client'

import { useState } from 'react'

export default function GoogleAdsFeedModal({ onClose }: { onClose: () => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://diamondspa.com.co'
  const secretKey = 'NbhB7rO30CBMoDNdhfzvV1mfS12juTxT'
  const username = 'admin'

  const feeds = [
    {
      id: 'all',
      title: 'Feed Recomendado (Ambas Conversiones)',
      subtitle: 'Sincroniza Leads Cualificados y Ventas Pagadas en un solo archivo CSV.',
      url: `${origin}/api/admin/bookings/export/conversions.csv?type=all`,
      tagColor: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30',
      badge: 'Recomendado',
    },
    {
      id: 'qualified',
      title: 'Solo Leads Cualificados (Cita Agendada)',
      subtitle: 'Dispara cuando el cliente agenda su cita en la etapa 3 del embudo.',
      url: `${origin}/api/admin/bookings/export/qualified.csv`,
      tagColor: 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30',
      badge: 'Etapa 3',
    },
    {
      id: 'converted',
      title: 'Solo Ventas Confirmadas (Servicio Pagado)',
      subtitle: 'Dispara cuando el cliente paga con el valor real en COP.',
      url: `${origin}/api/admin/bookings/export/converted.csv`,
      tagColor: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30',
      badge: 'Etapa 4',
    },
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0a182c] border border-[#1e385c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1e385c] bg-[#071322] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-2xl">sync_saved_locally</span>
            </div>
            <div>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-[#cfe5fa]">
                Datos de Conexión HTTPS para Google Ads
              </h2>
              <p className="text-xs text-[#8a9299]">
                Copia estos datos exactos en la pantalla de Google Ads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a9299] hover:text-white p-1 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-[#cfe5fa]">
          {/* Main Credentials Box */}
          <div className="p-5 rounded-2xl bg-[#071322] border-2 border-[#38bdf8]/40 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">key</span>
                Credenciales para Google Ads
              </span>
              <span className="text-[10px] text-[#34d399] font-bold bg-[#34d399]/10 px-2.5 py-0.5 rounded-full border border-[#34d399]/20">
                ✓ Formato .CSV Válido
              </span>
            </div>

            {/* URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#8a9299]">
                1. URL del archivo CSV:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${origin}/api/admin/bookings/export/conversions.csv?type=all`}
                  className="flex-1 bg-[#0a182c] border border-[#1e385c] text-[#38bdf8] text-xs font-mono rounded-lg px-3 py-2 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(`${origin}/api/admin/bookings/export/conversions.csv?type=all`, 'url')}
                  className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#001524] text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedKey === 'url' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedKey === 'url' ? '¡Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
            </div>

            {/* Username & Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#8a9299]">
                  2. Nombre de usuario:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={username}
                    className="flex-1 bg-[#0a182c] border border-[#1e385c] text-white text-xs font-mono rounded-lg px-3 py-2 outline-none font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(username, 'user')}
                    className="bg-[#1a3860] hover:bg-[#254e85] text-[#38bdf8] text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow"
                  >
                    {copiedKey === 'user' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#8a9299]">
                  3. Contraseña:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={secretKey}
                    className="flex-1 bg-[#0a182c] border border-[#1e385c] text-white text-xs font-mono rounded-lg px-3 py-2 outline-none font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(secretKey, 'pass')}
                    className="bg-[#1a3860] hover:bg-[#254e85] text-[#38bdf8] text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow"
                  >
                    {copiedKey === 'pass' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="p-4 rounded-xl bg-[#071322] border border-[#172c4c] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8]">
              <span className="material-symbols-outlined text-[16px]">info</span>
              ¿Qué hace Google con estos datos?
            </div>
            <p className="text-[11px] text-[#8a9299] leading-relaxed">
              Google Ads se conectará por HTTPS a este archivo <code>conversions.csv</code> de forma segura y leerá automáticamente las conversiones tanto de <strong>GCLID</strong> (matching exacto) como de <strong>Enhanced Conversions</strong> (teléfono normalizado), excluyendo cualquier tráfico orgánico no relacionado.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e385c] bg-[#071322] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1e385c] hover:bg-[#284b7a] text-[#cfe5fa] font-bold text-xs px-5 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
