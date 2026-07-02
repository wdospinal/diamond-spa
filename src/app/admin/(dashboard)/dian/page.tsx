'use client'

import { useState } from 'react'

export default function DianSettingsPage() {
  const [certFile, setCertFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [softwareId, setSoftwareId] = useState('')
  const [testSetId, setTestSetId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate save (Normally this would hit a secure API route to store in Vercel KV)
    setTimeout(() => {
      alert('Configuración guardada exitosamente. El sistema está listo para pruebas.')
      setIsSaving(false)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-on-surface">Configuración DIAN</h1>
        <p className="text-on-surface-variant mt-2">
          Sube tu Certificado Digital y configura las credenciales de Software Propio provistas por la DIAN.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-surface-container rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-medium text-on-surface border-b border-outline-variant pb-2">
          1. Certificado Digital (.p12 / .pfx)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface">Archivo del Certificado</label>
            <input 
              type="file" 
              accept=".p12,.pfx"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface">Contraseña del Certificado</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-on-surface"
              placeholder="••••••••"
            />
          </div>
        </div>

        <h2 className="text-xl font-medium text-on-surface border-b border-outline-variant pb-2 pt-6">
          2. Credenciales de la DIAN (Habilitación)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface">Software ID</label>
            <input 
              type="text" 
              value={softwareId}
              onChange={(e) => setSoftwareId(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-on-surface"
              placeholder="Ej: d563a6c1-..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface">TestSetID (Código de Pruebas)</label>
            <input 
              type="text" 
              value={testSetId}
              onChange={(e) => setTestSetId(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-on-surface"
              placeholder="Ej: 4d284..."
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-3 bg-primary text-on-primary rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
