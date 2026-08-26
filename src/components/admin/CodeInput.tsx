'use client'

/**
 * Campo para el código de 6 dígitos que se envía por correo.
 *
 * Lo comparten la pantalla de recuperar contraseña y la de cuenta para que el
 * código se vea igual en toda la app: centrado, monoespaciado por tracking y
 * con placeholder `000000`.
 *
 * Sanea siempre a dígitos y recorta a `length`, así que pegar el código tal
 * como llega en el correo (con espacios, saltos de línea o texto alrededor)
 * deja el valor limpio en vez de fallar como código inválido.
 *
 * `className` estiliza el input, no el contenedor, igual que en PasswordInput:
 * cada pantalla conserva su paleta.
 */
export default function CodeInput({
  value,
  onValueChange,
  length = 6,
  className = '',
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: string
  onValueChange: (value: string) => void
  length?: number
}) {
  const sanitize = (raw: string) => raw.replace(/\D/g, '').slice(0, length)

  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={length}
      placeholder={'0'.repeat(length)}
      {...props}
      type="text"
      value={value}
      onChange={e => onValueChange(sanitize(e.target.value))}
      onPaste={e => {
        // El navegador insertaría el texto pegado tal cual y lo recortaría a
        // maxLength antes de sanear: "774782" pegado como "Código: 774782"
        // quedaría en "Código". Lo tomamos del portapapeles y lo limpiamos.
        e.preventDefault()
        onValueChange(sanitize(e.clipboardData.getData('text')))
      }}
      className={`${className} w-full text-center text-lg tracking-[0.5em]`}
    />
  )
}
