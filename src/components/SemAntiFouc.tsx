'use client'

import { useServerInsertedHTML } from 'next/navigation'

const SEM_ANTI_FOUC_SCRIPT = `(function(){
  try {
    var p = new URLSearchParams(window.location.search);
    if (sessionStorage.getItem('sem_hide_chrome') === 'false') return;
    var k = sessionStorage.getItem('sem_trigger_key') || 'utm_source';
    var v = sessionStorage.getItem('sem_trigger_value') || 'ads';
    if (p.get(k) === v) document.documentElement.classList.add('is-ads');
  } catch(e) {}
})();`

/**
 * Inyecta el script anti-FOUC de detección SEM directo en el stream HTML
 * del SSR, FUERA del árbol de componentes de React.
 *
 * Por qué: en Next.js 16.2+, React 19 muestra "Encountered a script tag
 * while rendering React component" para CUALQUIER <script>, incluso uno
 * crudo escrito en un Server Component (el comentario que había antes
 * asumía que eso era seguro — dejó de serlo con esta versión). Es un bug
 * ampliamente reportado, confirmado en varios proyectos con este mismo
 * stack trace. useServerInsertedHTML es el arreglo oficial recomendado:
 * inserta el HTML directo en el stream, sin que React lo "vea" como un
 * script renderizado por un componente, evitando el aviso por completo.
 */
export default function SemAntiFouc() {
  useServerInsertedHTML(() => (
    <script
      id="sem-anti-fouc"
      dangerouslySetInnerHTML={{ __html: SEM_ANTI_FOUC_SCRIPT }}
    />
  ))
  return null
}
