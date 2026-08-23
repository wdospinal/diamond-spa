'use client'

import { useId, useState } from 'react'

/**
 * Campo de contraseña con botón para mostrarla u ocultarla.
 *
 * El icono va como SVG inline y no como ligadura de Material Symbols: el
 * subset self-hosted (ver material-symbols.ts) no incluye `visibility`, y un
 * icono ausente del subset se dibuja como su texto crudo. Añadirlo obligaría a
 * regenerar el woff2 y a romper la caché en globals.css.
 *
 * `className` estiliza el input, no el contenedor, para que cada pantalla
 * conserve el suyo (el login usa su paleta propia; el resto, tokens del tema).
 */
export default function PasswordInput({
  className = '',
  wrapperClassName = '',
  toggleClassName = 'text-on-surface/40 hover:text-primary',
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  wrapperClassName?: string
  toggleClassName?: string
}) {
  const [visible, setVisible] = useState(false)
  const hintId = useId()
  const label = visible ? 'Ocultar contraseña' : 'Mostrar contraseña'

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        // w-full: el input ya no es hijo directo del layout, lo es el wrapper.
        // pr-11 deja sitio al botón para que el texto no pase por debajo.
        className={`${className} w-full pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center transition-colors ${toggleClassName}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
          {visible ? <line x1="3" y1="21" x2="21" y2="3" /> : null}
        </svg>
      </button>
      <span id={hintId} className="sr-only">
        {visible ? 'La contraseña está visible.' : 'La contraseña está oculta.'}
      </span>
    </div>
  )
}
