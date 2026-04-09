export const SERVICES = [
  {
    id: 'deep-tissue',
    name: 'Deep Tissue Massage',
    category: 'Strength & Recovery',
    price: 180,
    duration: '90 min',
  },
  {
    id: 'relaxation',
    name: 'Relaxation Massage',
    category: 'Neurological Reset',
    price: 150,
    duration: '60 min',
  },
  {
    id: 'facial',
    name: 'Facial Rejuvenation',
    category: 'Precision Grooming',
    price: 165,
    duration: '45 min',
  },
] as const

export type ServiceId = (typeof SERVICES)[number]['id']

export function getServiceById(id: string) {
  return SERVICES.find(s => s.id === id)
}
