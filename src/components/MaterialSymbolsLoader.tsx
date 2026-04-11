'use client'
import { useEffect } from 'react'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional'

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    if (document.querySelector('[data-mat-symbols]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.dataset.matSymbols = '1'
    link.href = FONT_URL
    document.head.appendChild(link)
  }, [])
  return null
}
