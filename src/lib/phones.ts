export const PHONES = [
  { display: '+57 305 4541635', wa: '573054541635' },
  { display: '+57 305 2263648', wa: '573052263648' },
] as const

export function randomWhatsAppUrl(text: string) {
  const { wa } = PHONES[Math.floor(Math.random() * PHONES.length)]
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
}
