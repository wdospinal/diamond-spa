// Videos por servicio para las tarjetas de la landing de pauta en inglés (v1).
// Archivos comprimidos (720×1280, sin audio, ~1,5 MB) + póster liviano.
export type ServiceVideo = { video: string; poster: string }

export const LANDING_SERVICE_VIDEOS: Record<string, ServiceVideo> = {
  'deep-tissue': { video: '/videos/landing/deep-tissue.mp4', poster: '/videos/landing/deep-tissue.webp' },
  relaxing: { video: '/videos/landing/relaxing.mp4', poster: '/videos/landing/relaxing.webp' },
  sports: { video: '/videos/landing/sports.mp4', poster: '/videos/landing/sports.webp' },
  sensitive: { video: '/videos/landing/sensitive.mp4', poster: '/videos/landing/sensitive.webp' },
}
