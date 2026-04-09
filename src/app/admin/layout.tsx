import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diamond Spa — Administración',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#001524] text-[#cfe5fa] font-body antialiased pt-0">
      {children}
    </div>
  )
}
