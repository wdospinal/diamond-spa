'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatAnalytics } from '@/lib/chat-analytics'
import ChatbotView from './ChatbotView'

type Failure = 'missing_table' | 'error' | null

export default function ChatbotPage() {
  const { replace } = useRouter()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<ChatAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState<Failure>(null)

  const load = useCallback(
    async (d: number) => {
      setFailure(null)
      try {
        const res = await fetch(`/api/chat-analytics?days=${d}`, { credentials: 'same-origin' })
        if (res.status === 401) {
          replace('/admin/login')
          return
        }
        if (res.status === 424) {
          setFailure('missing_table')
          return
        }
        if (!res.ok) {
          setFailure('error')
          return
        }
        setData((await res.json()) as ChatAnalytics)
      } catch {
        setFailure('error')
      } finally {
        setLoading(false)
      }
    },
    [replace],
  )

  useEffect(() => {
    void load(days)
  }, [load, days])

  if (loading && !data && !failure) {
    return <div className="flex min-h-[40vh] items-center justify-center font-body text-[#8a9299]">Cargando…</div>
  }

  if (failure === 'missing_table') {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-headline text-3xl text-[#cfe5fa] md:text-4xl">Chatbot de la pauta</h1>
        <div className="mt-8 rounded-sm border border-[#42484c]/40 bg-[#0a2438] p-6 font-body">
          <p className="text-sm text-[#cfe5fa]">Falta crear la tabla donde se guardan los clics del chat.</p>
          <p className="mt-2 text-xs leading-relaxed text-[#8a9299]">
            Abre el editor SQL de Supabase y ejecuta el archivo <code className="text-[#a5cce6]">supabase/migrations/0017_chat_events.sql</code>.
            Después de eso, el chat empieza a registrar y este panel se llena solo.
          </p>
        </div>
      </div>
    )
  }

  if (failure === 'error' && !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-headline text-3xl text-[#cfe5fa] md:text-4xl">Chatbot de la pauta</h1>
        <p className="mt-8 font-body text-red-400/90">No se pudo cargar el panel. Intenta de nuevo en un momento.</p>
      </div>
    )
  }

  if (!data) return null
  return (
    <>
      {failure === 'error' ? <p className="mx-auto mb-4 max-w-6xl font-body text-sm text-red-400/90">No se pudo actualizar; se muestran los datos anteriores.</p> : null}
      <ChatbotView data={data} days={days} onDays={setDays} />
    </>
  )
}
