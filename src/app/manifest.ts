import type { MetadataRoute } from 'next'

/**
 * Manifest de la PWA del panel administrativo.
 *
 * Se sirve en /manifest.webmanifest (App Router). Con start_url en /admin y
 * display 'fullscreen', al instalarla desde Chrome (⋮ → Instalar app) la tablet
 * abre el panel sin barra de direcciones ni pestañas, y sobrevive reinicios.
 * Cambiar a 'standalone' si se prefiere conservar la barra de estado del sistema.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Diamond Spa — Admin',
    short_name: 'Diamond Admin',
    description: 'Sistema de reservas y check-in para Diamond Spa',
    start_url: '/admin',
    scope: '/admin',
    display: 'fullscreen',
    background_color: '#1b2340',
    theme_color: '#1b2340',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
