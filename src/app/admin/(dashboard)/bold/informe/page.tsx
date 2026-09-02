import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Informe financiero mayo–agosto 2026 — Diamond Spa',
}

/* Paleta del panel. Los SVG no pueden usar clases de Tailwind para `fill`,
   así que los tonos viven aquí y se comparten entre marcado y gráficas. */
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const INK = '#cfe5fa'
const MUTED = '#8a9299'
const DIM = '#5c656d'
const GRID = '#2a3f4f'
const BLUE = '#a5cce6'
const STEEL = '#4d7d99'
const CLAY = '#e08a6f'
const OCHRE = '#f0bd8d'
const GREEN = '#7fc9a6'

const ax = { fill: MUTED, fontFamily: MONO, fontSize: 12, fontWeight: 500 } as const
const axB = { fill: INK, fontFamily: MONO, fontSize: 12, fontWeight: 600 } as const
const val = { fill: INK, fontFamily: MONO, fontSize: 12.5, fontWeight: 600 } as const

const CARD = 'bg-[#0a2438] border border-[#42484c]/30'
const TH = 'text-left font-label text-[10px] uppercase tracking-[0.15em] text-[#8a9299] font-medium pb-2.5 pr-4 border-b border-[#42484c]/70'
const TD = 'py-2.5 pr-4 border-b border-[#42484c]/25 align-top text-[#cfe5fa]'
const TDR = `${TD} text-right tabular-nums pr-0`
const THR = `${TH} text-right pr-0`
const TOT = 'py-2.5 pr-4 border-t border-[#42484c]/70 font-semibold text-[#cfe5fa]'
const TOTR = `${TOT} text-right tabular-nums pr-0`

function Section({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="py-9 border-b border-[#42484c]/30 last:border-b-0">
      <h2 className="font-headline text-2xl md:text-[27px] text-[#cfe5fa] mb-2">
        <span className="font-label text-[11px] tracking-[0.15em] text-[#8a9299] align-middle mr-3">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Figure({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className={`${CARD} rounded-sm p-4 sm:p-5 my-6`}>
      {children}
      <figcaption className="text-[12.5px] leading-relaxed text-[#8a9299] font-body mt-3 pt-3 border-t border-[#42484c]/30">
        {caption}
      </figcaption>
    </figure>
  )
}

function Flag({
  title,
  tone = 'warn',
  children,
}: {
  title: string
  tone?: 'warn' | 'ok'
  children: React.ReactNode
}) {
  const bar = tone === 'ok' ? 'border-l-[#7fc9a6]' : 'border-l-[#e08a6f]'
  const label = tone === 'ok' ? 'text-[#7fc9a6]' : 'text-[#e08a6f]'
  return (
    <div className={`border-l-2 ${bar} bg-[#0a2438]/60 px-5 py-4 my-6 rounded-r-sm`}>
      <p className={`font-label text-[10px] uppercase tracking-[0.2em] ${label} mb-2`}>{title}</p>
      <div className="flex flex-col gap-2.5 text-[#cfe5fa]/90 font-body text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone?: 'warn'
}) {
  return (
    <div className={`${CARD} rounded-sm p-4`}>
      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8a9299] mb-2">
        {label}
      </p>
      {/* Cifras en la fuente del cuerpo, no en la de titulares: Playfair usa
          cifras de estilo antiguo, así que en «$19,57M» el número quedaba
          hundido respecto al «$» y a la «M». Manrope trae cifras a altura de
          mayúscula —mismo criterio que los totales de /admin/caja—. */}
      <p
        className={`font-body font-light tracking-tight text-2xl tabular-nums ${
          tone === 'warn' ? 'text-[#e08a6f]' : 'text-[#cfe5fa]'
        }`}
      >
        {value}
      </p>
      <p className="text-[12px] text-[#5c656d] font-body mt-1 leading-snug">{note}</p>
    </div>
  )
}

function Horizon({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-block font-label text-[10px] uppercase tracking-[0.2em] text-[#001524] bg-[#a5cce6] px-3 py-1.5 rounded-sm mt-8 mb-1">
      {children}
    </p>
  )
}

function Plan({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="list-none p-0 my-4">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="relative pl-11 pb-4 mb-4 border-b border-[#42484c]/25 last:border-b-0 last:pb-0 last:mb-0"
        >
          <span className="absolute left-0 top-0.5 font-label text-[11px] tabular-nums text-[#8a9299]">
            {String(i + 1).padStart(2, '0')}
          </span>
          <b className="block font-body font-semibold text-[16px] text-[#cfe5fa] mb-1">
            {item.title}
          </b>
          <span className="font-body text-[15px] leading-relaxed text-[#cfe5fa]/75">
            {item.body}
          </span>
        </li>
      ))}
    </ol>
  )
}

const P = 'font-body text-[15px] leading-relaxed text-[#cfe5fa]/80 max-w-[66ch] mb-3.5'
const NUM = 'tabular-nums'

export default function BoldReportPage() {
  return (
    <div className="max-w-3xl mx-auto pb-16">
      <Link
        href="/admin/bold"
        className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.15em] text-[#8a9299] hover:text-[#a5cce6] transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          arrow_back
        </span>
        Ventas Bold
      </Link>

      <header className="pt-7 pb-7 border-b-2 border-[#42484c]/70">
        <p className="font-label text-[10px] uppercase tracking-[0.25em] text-[#8a9299]">
          Diamond Spa · El Poblado, Medellín
        </p>
        <h1 className="font-headline text-3xl md:text-5xl text-[#cfe5fa] leading-tight mt-3 mb-2">
          Informe financiero
          <br />
          mayo – agosto 2026
        </h1>
        <p className="font-body text-[17px] text-[#a5cce6]/80">
          Cuatro meses de operación · Elaborado el 27 de agosto de 2026 · Datos del datáfono
          actualizados el 1 de septiembre con los informes de transacciones de Bold
        </p>
      </header>

      {/* 01 ------------------------------------------------------------- */}
      <Section n="01" title="Dónde está el negocio">
        <p className="font-body text-[17px] leading-relaxed text-[#a5cce6]/90 max-w-[66ch] mb-4">
          Diamond Spa es rentable y crece rápido. También opera al filo: en agosto facturó apenas un
          3,5% por encima de lo que necesita para no perder dinero.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
          <Kpi label="Ingresos agosto" value="$19,57M" note="+88% desde mayo" />
          <Kpi label="Utilidad agosto" value="$1,05M" note="margen del 5,4%" tone="warn" />
          <Kpi
            label="Margen de seguridad"
            value="+3,5%"
            note="$654.490 sobre el equilibrio"
            tone="warn"
          />
          <Kpi label="Caja tras pagar" value="$0,40M" note="en cuenta Bancolombia" tone="warn" />
          <Kpi label="Capital aportado" value="$63,0M" note="tres socios" />
          <Kpi label="Retorno acumulado" value="+10,9%" note="$6,88M en cuatro meses" />
        </div>

        <p className={P}>
          Los cuatro períodos cerraron en positivo y las ventas casi se duplicaron. Pero los costos
          crecieron más rápido que los ingresos, y el margen pasó del 14,8% en julio al 5,4% en
          agosto. El problema no está en la demanda: está en la estructura de costos.
        </p>

        <Figure caption="El colchón completo del negocio son $654.490 al mes: alrededor de tres servicios. Dos citas canceladas convierten un mes bueno en un mes en pérdida.">
          <svg
            viewBox="0 0 720 210"
            className="w-full h-auto"
            role="img"
            aria-label="Margen de seguridad: los ingresos de agosto superan el punto de equilibrio en 3,5 por ciento"
          >
            <rect x="40" y="34" width="640" height="134" fill="none" stroke={GRID} strokeWidth="1" />
            <rect x="40" y="45.8" width="640" height="122.2" fill={BLUE} opacity=".12" />
            <rect x="40" y="41.6" width="640" height="4.2" fill={BLUE} opacity=".5" />
            <line x1="40" y1="45.8" x2="680" y2="45.8" stroke={CLAY} strokeWidth="2.5" />
            <text x="48" y="65.8" style={{ ...val, fill: CLAY }}>
              Punto de equilibrio · $18.917.510
            </text>
            <line x1="40" y1="41.6" x2="680" y2="41.6" stroke={INK} strokeWidth="2.5" />
            <text x="48" y="32.6" style={val}>
              Ingresos agosto · $19.572.000
            </text>
            <line x1="552" y1="41.6" x2="552" y2="45.8" stroke={INK} strokeWidth="1.5" />
            <text x="562" y="45.7" style={val}>
              +3,5% · $654.490
            </text>
            <text x="40" y="202" style={ax}>
              La franja clara es el colchón completo. Debajo de la línea roja, el mes cierra en
              pérdida.
            </text>
          </svg>
        </Figure>
      </Section>

      {/* 02 ------------------------------------------------------------- */}
      <Section n="02" title="Ingresos">
        <p className={P}>
          Las ventas crecen de forma sostenida, sin un solo mes de retroceso. En cuatro meses pasaron
          de $10,4 a $19,6 millones.
        </p>

        <Figure caption="Los períodos siguen los cortes del registro, que no coinciden con meses calendario. Junio se reconstruyó a partir de los cierres del datáfono y es una estimación.">
          <svg
            viewBox="0 0 720 340"
            className="w-full h-auto"
            role="img"
            aria-label="Ingresos y egresos por periodo frente al punto de equilibrio"
          >
            <line x1="74" y1="288" x2="702" y2="288" stroke={GRID} strokeWidth="1" />
            <text x="64" y="292" textAnchor="end" style={ax}>
              0M
            </text>
            <line x1="74" y1="222.5" x2="702" y2="222.5" stroke={GRID} strokeWidth="1" />
            <text x="64" y="226.5" textAnchor="end" style={ax}>
              5M
            </text>
            <line x1="74" y1="157" x2="702" y2="157" stroke={GRID} strokeWidth="1" />
            <text x="64" y="161" textAnchor="end" style={ax}>
              10M
            </text>
            <line x1="74" y1="91.5" x2="702" y2="91.5" stroke={GRID} strokeWidth="1" />
            <text x="64" y="95.5" textAnchor="end" style={ax}>
              16M
            </text>
            <line x1="74" y1="26" x2="702" y2="26" stroke={GRID} strokeWidth="1" />
            <text x="64" y="30" textAnchor="end" style={ax}>
              21M
            </text>

            <rect x="80.3" y="157.9" width="72.2" height="130.1" fill={BLUE} />
            <rect x="152.5" y="172.3" width="72.2" height="115.7" fill={STEEL} />
            <text x="152.5" y="308" textAnchor="middle" style={axB}>
              Mayo
            </text>
            <text x="116.4" y="150.9" textAnchor="middle" style={val}>
              10.4M
            </text>

            <rect x="237.3" y="124.2" width="72.2" height="163.8" fill={BLUE} />
            <rect x="309.5" y="153.1" width="72.2" height="134.9" fill={STEEL} />
            <text x="309.5" y="308" textAnchor="middle" style={axB}>
              Junio*
            </text>
            <text x="273.4" y="117.2" textAnchor="middle" style={val}>
              13.1M
            </text>

            <rect x="394.3" y="88.3" width="72.2" height="199.7" fill={BLUE} />
            <rect x="466.5" y="117.9" width="72.2" height="170.1" fill={STEEL} />
            <text x="466.5" y="308" textAnchor="middle" style={axB}>
              Julio
            </text>
            <text x="430.4" y="81.3" textAnchor="middle" style={val}>
              16.0M
            </text>

            <rect x="551.3" y="43.8" width="72.2" height="244.2" fill={BLUE} />
            <rect x="623.5" y="56.9" width="72.2" height="231.1" fill={STEEL} />
            <text x="623.5" y="308" textAnchor="middle" style={axB}>
              Agosto
            </text>
            <text x="587.4" y="36.8" textAnchor="middle" style={val}>
              19.6M
            </text>

            <line
              x1="74"
              y1="52"
              x2="702"
              y2="52"
              stroke={CLAY}
              strokeWidth="2"
              strokeDasharray="7 4"
            />
            <text x="702" y="44" textAnchor="end" style={{ ...val, fill: CLAY }}>
              Punto de equilibrio 18.9M
            </text>

            <rect x="74" y="324" width="11" height="11" fill={BLUE} />
            <text x="91" y="334" style={ax}>
              Ingresos
            </text>
            <rect x="166" y="324" width="11" height="11" fill={STEEL} />
            <text x="183" y="334" style={ax}>
              Egresos
            </text>
          </svg>
        </Figure>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-5">
            <thead>
              <tr>
                <th className={TH}>Período</th>
                <th className={THR}>Ingresos</th>
                <th className={THR}>Egresos</th>
                <th className={THR}>Utilidad</th>
                <th className={THR}>Margen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Mayo</td>
                <td className={TDR}>$10.430.732</td>
                <td className={TDR}>$9.277.378</td>
                <td className={TDR}>+$1.153.354</td>
                <td className={TDR}>11,1%</td>
              </tr>
              <tr>
                <td className={TD}>Junio (estimado)</td>
                <td className={TDR}>$13.130.681</td>
                <td className={TDR}>$10.815.136</td>
                <td className={TDR}>+$2.315.545</td>
                <td className={TDR}>17,6%</td>
              </tr>
              <tr>
                <td className={TD}>Julio</td>
                <td className={TDR}>$16.005.000</td>
                <td className={TDR}>$13.636.724</td>
                <td className={TDR}>+$2.368.276</td>
                <td className={TDR}>14,8%</td>
              </tr>
              <tr>
                <td className={TD}>Agosto</td>
                <td className={TDR}>$19.572.000</td>
                <td className={TDR}>$18.524.759</td>
                <td className={TDR}>+$1.047.241</td>
                <td className={TDR}>5,4%</td>
              </tr>
              <tr>
                <td className={TOT}>Acumulado</td>
                <td className={TOTR}>$59.138.413</td>
                <td className={TOTR}>$52.253.997</td>
                <td className={TOTR}>+$6.884.416</td>
                <td className={TOTR}>11,6%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={P}>
          El ticket promedio en agosto fue de <span className={NUM}>$210.452</span> sobre 93
          servicios. La facturación crece por volumen, no por precio.
        </p>
      </Section>

      {/* 03 ------------------------------------------------------------- */}
      <Section n="03" title="Egresos">
        <p className={P}>
          Estructura real de agosto. Las 19 partidas registradas suman exactamente $18.524.759.
        </p>

        <Figure caption="Arriendo, salarios y publicidad concentran el 91% de los costos.">
          <svg
            viewBox="0 0 720 236"
            className="w-full h-auto"
            role="img"
            aria-label="Estructura de costos de agosto"
          >
            <rect x="150" y="8" width="400" height="24" fill={BLUE} rx="2" />
            <text x="138" y="25" textAnchor="end" style={axB}>
              Arriendo
            </text>
            <text x="560" y="25" style={val}>
              $7.000.000 · 37.8%
            </text>

            <rect x="150" y="52" width="324.4" height="24" fill={CLAY} rx="2" />
            <text x="138" y="69" textAnchor="end" style={axB}>
              Salarios
            </text>
            <text x="484.4" y="69" style={val}>
              $5.676.300 · 30.6%
            </text>

            <rect x="150" y="96" width="240" height="24" fill={OCHRE} rx="2" />
            <text x="138" y="113" textAnchor="end" style={axB}>
              Publicidad
            </text>
            <text x="400" y="113" style={val}>
              $4.200.000 · 22.7%
            </text>

            <rect x="150" y="140" width="67.1" height="24" fill={STEEL} rx="2" />
            <text x="138" y="157" textAnchor="end" style={axB}>
              Servicios públicos
            </text>
            <text x="227.1" y="157" style={val}>
              $1.173.959 · 6.3%
            </text>

            <rect x="150" y="184" width="27.1" height="24" fill={STEEL} rx="2" />
            <text x="138" y="201" textAnchor="end" style={axB}>
              Insumos
            </text>
            <text x="187.1" y="201" style={val}>
              $474.500 · 2.6%
            </text>
          </svg>
        </Figure>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">
          Qué cambió entre julio y agosto
        </h3>

        <Figure caption="Los ingresos crecieron 22% y los costos 36%. Ese diferencial explica toda la compresión del margen.">
          <svg
            viewBox="0 0 720 316"
            className="w-full h-auto"
            role="img"
            aria-label="Comparación de costos julio contra agosto"
          >
            <text x="120" y="42" textAnchor="end" style={axB}>
              Arriendo
            </text>
            <rect x="132" y="24" width="438" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="40" width="438" height="13" fill={BLUE} rx="1.5" />
            <text x="580" y="45" style={{ ...val, fill: BLUE }}>
              sin cambio
            </text>

            <text x="120" y="98" textAnchor="end" style={axB}>
              Salarios
            </text>
            <rect x="132" y="80" width="148.4" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="96" width="355.2" height="13" fill={CLAY} rx="1.5" />
            <text x="497.2" y="101" style={{ ...val, fill: CLAY }}>
              +139%
            </text>

            <text x="120" y="154" textAnchor="end" style={axB}>
              Publicidad
            </text>
            <rect x="132" y="136" width="156.4" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="152" width="262.8" height="13" fill={CLAY} rx="1.5" />
            <text x="404.8" y="157" style={{ ...val, fill: CLAY }}>
              +68%
            </text>

            <text x="120" y="210" textAnchor="end" style={axB}>
              Serv. públicos
            </text>
            <rect x="132" y="192" width="64.3" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="208" width="73.5" height="13" fill={OCHRE} rx="1.5" />
            <text x="215.5" y="213" style={{ ...val, fill: OCHRE }}>
              +14%
            </text>

            <text x="120" y="266" textAnchor="end" style={axB}>
              Insumos
            </text>
            <rect x="132" y="248" width="46.1" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="264" width="29.7" height="13" fill={GREEN} rx="1.5" />
            <text x="188.1" y="269" style={{ ...val, fill: GREEN }}>
              -36%
            </text>

            <rect x="132" y="2" width="11" height="11" fill={STEEL} />
            <text x="149" y="12" style={ax}>
              Julio
            </text>
            <rect x="202" y="2" width="11" height="11" fill={CLAY} />
            <text x="219" y="12" style={ax}>
              Agosto
            </text>
          </svg>
        </Figure>

        <Flag title="El dato que hay que explicar">
          <p>
            Los salarios pasaron de $2.372.300 a $5.676.300 en un mes. Agosto registra pagos a seis
            personas: Sary, Saira, Sheila, Ana, Daniela y Tatiana.
          </p>
          <p>
            Hay dos explicaciones posibles y los datos no permiten distinguirlas. Si son pagos
            atrasados de meses anteriores, la utilidad recurrente es más pareja de lo que muestra el
            corte. Si es dotación nueva, conviene revisarla: el spa opera al 44% de su capacidad
            instalada, así que la restricción no es de personal sino de demanda.
          </p>
          <p className="text-[#cfe5fa] font-semibold">
            De esa respuesta depende que el plazo de recuperación sea de 33 meses o de 54.
          </p>
        </Flag>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Clasificación</h3>
        <table className="w-full text-[14.5px] font-body border-collapse my-4">
          <tbody>
            <tr>
              <td className={TD}>Costos fijos mensuales</td>
              <td className={TDR}>$18.050.259</td>
            </tr>
            <tr>
              <td className={TD}>Costo variable sobre ventas</td>
              <td className={TDR}>4,6%</td>
            </tr>
            <tr>
              <td className={TD}>Margen bruto</td>
              <td className={TDR}>95,4%</td>
            </tr>
          </tbody>
        </table>
        <p className={P}>
          El margen bruto altísimo es normal en servicios: casi no hay costo de mercancía. Toda la
          rentabilidad depende de cubrir los costos fijos, y esos son los que se dispararon.
        </p>
      </Section>

      {/* 04 ------------------------------------------------------------- */}
      <Section n="04" title="Rentabilidad">
        <Figure caption="Agosto es el mejor mes en ventas y el peor en rentabilidad.">
          <svg
            viewBox="0 0 720 260"
            className="w-full h-auto"
            role="img"
            aria-label="Evolución del margen neto por periodo"
          >
            <line x1="52" y1="216" x2="702" y2="216" stroke={GRID} strokeWidth="1" />
            <text x="42" y="220" textAnchor="end" style={ax}>
              0%
            </text>
            <line x1="52" y1="168" x2="702" y2="168" stroke={GRID} strokeWidth="1" />
            <text x="42" y="172" textAnchor="end" style={ax}>
              5%
            </text>
            <line x1="52" y1="120" x2="702" y2="120" stroke={GRID} strokeWidth="1" />
            <text x="42" y="124" textAnchor="end" style={ax}>
              10%
            </text>
            <line x1="52" y1="72" x2="702" y2="72" stroke={GRID} strokeWidth="1" />
            <text x="42" y="76" textAnchor="end" style={ax}>
              15%
            </text>
            <line x1="52" y1="24" x2="702" y2="24" stroke={GRID} strokeWidth="1" />
            <text x="42" y="28" textAnchor="end" style={ax}>
              20%
            </text>

            <polyline
              points="133.2,109.9 295.8,46.7 458.2,73.9 620.8,164.6"
              fill="none"
              stroke={BLUE}
              strokeWidth="2.5"
            />
            <circle cx="133.2" cy="109.9" r="4.5" fill={BLUE} />
            <text x="133.2" y="95.9" textAnchor="middle" style={{ ...val, fill: BLUE }}>
              11.1%
            </text>
            <text x="133.2" y="236" textAnchor="middle" style={axB}>
              Mayo
            </text>
            <circle cx="295.8" cy="46.7" r="4.5" fill={BLUE} />
            <text x="295.8" y="32.7" textAnchor="middle" style={{ ...val, fill: BLUE }}>
              17.6%
            </text>
            <text x="295.8" y="236" textAnchor="middle" style={axB}>
              Junio*
            </text>
            <circle cx="458.2" cy="73.9" r="4.5" fill={BLUE} />
            <text x="458.2" y="59.9" textAnchor="middle" style={{ ...val, fill: BLUE }}>
              14.8%
            </text>
            <text x="458.2" y="236" textAnchor="middle" style={axB}>
              Julio
            </text>
            <circle cx="620.8" cy="164.6" r="6" fill={CLAY} />
            <text x="620.8" y="150.6" textAnchor="middle" style={{ ...val, fill: CLAY }}>
              5.4%
            </text>
            <text x="620.8" y="236" textAnchor="middle" style={axB}>
              Agosto
            </text>
          </svg>
        </Figure>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Punto de equilibrio</h3>
        <table className="w-full text-[14.5px] font-body border-collapse my-4">
          <tbody>
            <tr>
              <td className={TD}>Facturación necesaria para no perder</td>
              <td className={TDR}>$18.917.510</td>
            </tr>
            <tr>
              <td className={TD}>Servicios equivalentes al mes</td>
              <td className={TDR}>90</td>
            </tr>
            <tr>
              <td className={TD}>Servicios realizados en agosto</td>
              <td className={TDR}>93</td>
            </tr>
            <tr>
              <td className={TOT}>Margen de seguridad</td>
              <td className={TOTR}>+3,5%</td>
            </tr>
          </tbody>
        </table>

        <p className={P}>
          Recortar los salarios al nivel de julio bajaría el punto de equilibrio a{' '}
          <span className={NUM}>$15.457.294</span> y devolvería el colchón al 26,6%. Es la palanca de
          mayor impacto disponible hoy.
        </p>
      </Section>

      {/* 05 ------------------------------------------------------------- */}
      <Section n="05" title="Capital y socios">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-5">
            <thead>
              <tr>
                <th className={TH}>Socio</th>
                <th className={THR}>Aporte</th>
                <th className={THR}>Participación</th>
                <th className={THR}>Utilidad acumulada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Daniela</td>
                <td className={TDR}>$27.000.000</td>
                <td className={TDR}>42,9%</td>
                <td className={TDR}>$2.950.464</td>
              </tr>
              <tr>
                <td className={TD}>Sary</td>
                <td className={TDR}>$27.000.000</td>
                <td className={TDR}>42,9%</td>
                <td className={TDR}>$2.950.464</td>
              </tr>
              <tr>
                <td className={TD}>Daniel</td>
                <td className={TDR}>$9.000.000</td>
                <td className={TDR}>14,3%</td>
                <td className={TDR}>$983.488</td>
              </tr>
              <tr>
                <td className={TOT}>Total</td>
                <td className={TOTR}>$63.000.000</td>
                <td className={TOTR}>100%</td>
                <td className={TOTR}>$6.884.416</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={P}>
          Daniela y Sary controlan juntas el 85,8% del capital. El reparto de utilidades es
          proporcional, de modo que las tres participaciones rinden lo mismo:{' '}
          <strong className="text-[#cfe5fa] font-semibold">+10,9%</strong> en cuatro meses.
        </p>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">En qué se gastó</h3>
        <table className="w-full text-[14.5px] font-body border-collapse my-4">
          <tbody>
            <tr>
              <td className={TD}>Constitución y montaje (abril 2026)</td>
              <td className={TDR}>$39.226.746</td>
            </tr>
            <tr>
              <td className={TD}>Ampliación: camillas, drywall, obra</td>
              <td className={TDR}>$15.429.000</td>
            </tr>
            <tr>
              <td className={TOT}>Desembolsos con soporte</td>
              <td className={TOTR}>$54.655.746</td>
            </tr>
          </tbody>
        </table>

        <Flag title="Brecha sin conciliar">
          <p>
            Los socios aportaron $63.000.000 y hay soporte documental de $54.655.746. Faltan{' '}
            <strong className="text-[#cfe5fa] font-semibold">$8.344.254</strong> por rastrear.
          </p>
          <p>
            Tres explicaciones posibles: que los rubros sueltos del registro manuscrito —«para
            terminar» $4.606.000, «reserva» $281.000 y «pagos» $840.356— sí se hayan desembolsado, lo
            que reduciría la brecha a $2.616.898; que exista una tercera ronda sin registrar; o que
            parte del capital siga disponible sin gastar. Dada la situación de caja, esta última
            sería una buena noticia.
          </p>
        </Flag>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Recuperación del capital</h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-4">
            <thead>
              <tr>
                <th className={TH}>Escenario</th>
                <th className={THR}>Utilidad mensual</th>
                <th className={THR}>Meses restantes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Al ritmo de agosto</td>
                <td className={TDR}>$1.047.241</td>
                <td className={TDR}>53,6</td>
              </tr>
              <tr>
                <td className={TD}>Al promedio de los cuatro períodos</td>
                <td className={TDR}>$1.721.104</td>
                <td className={TDR}>32,6</td>
              </tr>
              <tr>
                <td className={TD}>Si el margen vuelve al 15%</td>
                <td className={TDR}>$2.900.000</td>
                <td className={TDR}>19,4</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={P}>
          Quedan <span className={NUM}>$56.115.584</span> por recuperar. El plazo depende casi por
          completo de si el salto de costos de agosto es puntual o permanente.
        </p>
      </Section>

      {/* 06 ------------------------------------------------------------- */}
      <Section n="06" title="Liquidez">
        <table className="w-full text-[14.5px] font-body border-collapse my-4">
          <tbody>
            <tr>
              <td className={TD}>Efectivo antes de pagar el mes</td>
              <td className={TDR}>$5.610.000</td>
            </tr>
            <tr>
              <td className={TD}>Cuenta bancaria antes de pagar</td>
              <td className={TDR}>$11.691.000</td>
            </tr>
            <tr>
              <td className={TD}>Egresos pagados en agosto</td>
              <td className={TDR}>−$18.524.759</td>
            </tr>
            <tr>
              <td className={TD}>Salidas sin registrar (diferencia)</td>
              <td className={`${TDR} text-[#e08a6f]`}>−$1.623.759</td>
            </tr>
            <tr>
              <td className={TOT}>Saldo en cuenta después</td>
              <td className={TOTR}>$400.000</td>
            </tr>
          </tbody>
        </table>
        <p className={P}>
          Las tres primeras líneas no cuadran con el saldo final: faltan $1.623.759 de salidas que no
          aparecen en el registro de egresos. La explicación más probable son los retiros a socios,
          que hoy no se contabilizan como categoría propia.
        </p>

        <Flag title="Riesgo inmediato">
          <p>
            Tras cubrir las obligaciones del mes quedan $400.000 en cuenta, frente a costos fijos de
            $18.050.259. No hay reserva que absorba una caída de ventas o un pago atrasado, y el
            arriendo de $7.000.000 se paga en un solo desembolso a fin de mes.
          </p>
          <p className="text-[#cfe5fa] font-semibold">
            Recomendación: suspender los retiros a socios hasta constituir un fondo equivalente a un
            mes de costos fijos.
          </p>
        </Flag>
      </Section>

      {/* 07 ------------------------------------------------------------- */}
      <Section n="07" title="De dónde vienen los clientes">
        <p className={P}>
          El datáfono es la única fuente que dice de dónde viene cada cliente. En julio y agosto
          procesó <span className={NUM}>70</span> cobros exitosos por{' '}
          <span className={NUM}>$23.919.000</span>, de tarjetas emitidas en 19 países distintos.
        </p>

        <Figure caption="Participación sobre las ventas con tarjeta de cada mes. Agosto no trae menos clientes estadounidenses —trae 18 contra 17— sino muchos más del resto del mundo: 18 contra 11.">
          <svg
            viewBox="0 0 720 196"
            className="w-full h-auto"
            role="img"
            aria-label="Origen de las tarjetas procesadas en julio y en agosto"
          >
            <rect x="132" y="2" width="11" height="11" fill={STEEL} />
            <text x="149" y="12" style={ax}>
              Julio
            </text>
            <rect x="202" y="2" width="11" height="11" fill={BLUE} />
            <text x="219" y="12" style={ax}>
              Agosto
            </text>

            <text x="120" y="42" textAnchor="end" style={axB}>
              Estados Unidos
            </text>
            <rect x="132" y="24" width="436.6" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="40" width="306.6" height="13" fill={BLUE} rx="1.5" />
            <text x="578.6" y="45" style={{ ...val, fill: OCHRE }}>
              64,5% → 45,3%
            </text>

            <text x="120" y="98" textAnchor="end" style={axB}>
              Resto del mundo
            </text>
            <rect x="132" y="80" width="184.8" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="96" width="328.3" height="13" fill={BLUE} rx="1.5" />
            <text x="470.3" y="101" style={{ ...val, fill: GREEN }}>
              27,3% → 48,5%
            </text>

            <text x="120" y="154" textAnchor="end" style={axB}>
              Colombia
            </text>
            <rect x="132" y="136" width="55.5" height="13" fill={STEEL} rx="1.5" />
            <rect x="132" y="152" width="42" height="13" fill={BLUE} rx="1.5" />
            <text x="197.5" y="157" style={{ ...val, fill: OCHRE }}>
              8,2% → 6,2%
            </text>

            {/* Una sola línea: `<text>` en SVG no ajusta, y a 12 px el ancho útil
                desde x=132 son ~83 caracteres antes de salirse del viewBox. */}
            <text x="132" y="188" style={ax}>
              31 cobros en julio, 39 en agosto. El 93,8% del valor de agosto es extranjero.
            </text>
          </svg>
        </Figure>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-5">
            <thead>
              <tr>
                <th className={TH}>Origen de la tarjeta</th>
                <th className={THR}>Julio</th>
                <th className={THR}>Agosto</th>
                <th className={THR}>Ticket agosto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Estados Unidos</td>
                <td className={TDR}>17 tx · $6.203.600</td>
                <td className={TDR}>18 tx · $6.480.400</td>
                <td className={TDR}>$360.022</td>
              </tr>
              <tr>
                <td className={TD}>Resto del mundo</td>
                <td className={TDR}>11 tx · $2.630.000</td>
                <td className={TDR}>18 tx · $6.927.700</td>
                <td className={TDR}>$384.872</td>
              </tr>
              <tr>
                <td className={TD}>Colombia</td>
                <td className={TDR}>3 tx · $786.500</td>
                <td className={TDR}>3 tx · $890.800</td>
                <td className={TDR}>$296.933</td>
              </tr>
              <tr>
                <td className={TOT}>Total con tarjeta</td>
                <td className={TOTR}>31 tx · $9.620.100</td>
                <td className={TOTR}>39 tx · $14.298.900</td>
                <td className={TOTR}>$366.638</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={P}>
          El negocio depende del turismo hacia Medellín: el 91,8% del valor cobrado en julio y el
          93,8% en agosto salió de tarjetas extranjeras. Eso explica por qué la campaña de Google
          Ads en español gastó <span className={NUM}>$1.783.442</span> para conseguir una sola
          conversión: le habla en español a un mercado que aporta el 6% de los ingresos con tarjeta.
          La campaña en inglés convierte diez veces mejor.
        </p>
        <p className={P}>
          Lo que cambió en agosto no es la dependencia del extranjero, que subió, sino su reparto.
          Estados Unidos dejó de ser la mitad del negocio y el resto del mundo —Alemania, Lituania,
          Países Bajos, Reino Unido, Emiratos, México, Italia, Suiza— pasó a pesar más. La
          diversificación reduce la exposición a un solo mercado emisor, pero no al riesgo de fondo:
          la estacionalidad turística de Medellín, la tasa de cambio y la percepción de seguridad de
          la ciudad siguen moviendo casi todos los ingresos.
        </p>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Qué cuesta el marketing</h3>
        <table className="w-full text-[14.5px] font-body border-collapse my-4">
          <tbody>
            <tr>
              <td className={TD}>Pauta digital (Google + Meta)</td>
              <td className={TDR}>$2.700.000</td>
            </tr>
            <tr>
              <td className={TD}>Fee de la agencia</td>
              <td className={TDR}>$1.500.000</td>
            </tr>
            <tr>
              <td className={TOT}>Total mensual</td>
              <td className={TOTR}>$4.200.000</td>
            </tr>
          </tbody>
        </table>
        <p className={P}>
          Equivale al{' '}
          <strong className="text-[#cfe5fa] font-semibold">21,5% de los ingresos</strong>. El retorno
          incremental medido es de 1,5x: cada peso invertido devuelve $1,50 en ventas. Es positivo,
          pero sin holgura.
        </p>
        <p className={P}>
          Dos hallazgos operativos: la campaña de Meta con mejor costo por conversación (
          <span className={NUM}>$1.012</span>) está apagada mientras corre una a{' '}
          <span className={NUM}>$5.078</span>; y el fee de la agencia representa el 55% de la pauta
          que administra, muy por encima del 10–20% habitual del mercado. Conviene pedir por escrito
          qué incluye ese fee.
        </p>
      </Section>

      {/* 08 ------------------------------------------------------------- */}
      <Section n="08" title="Lo que dice el datáfono">
        <p className={P}>
          Los informes mensuales de Bold traen el detalle transacción por transacción de julio y
          agosto. Es la única parte del informe que no depende de registros manuales.
        </p>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">El costo de cobrar</h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-4">
            <thead>
              <tr>
                <th className={TH}>Concepto</th>
                <th className={THR}>Julio</th>
                <th className={THR}>Agosto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Cobrado con tarjeta</td>
                <td className={TDR}>$9.620.100</td>
                <td className={TDR}>$14.298.900</td>
              </tr>
              <tr>
                <td className={TD}>Comisión Bold (variable)</td>
                <td className={TDR}>−$399.317</td>
                <td className={TDR}>−$593.317</td>
              </tr>
              <tr>
                <td className={TD}>Comisión fija por cobro</td>
                <td className={TDR}>−$9.300</td>
                <td className={TDR}>−$12.300</td>
              </tr>
              <tr>
                <td className={TD}>Retención de ICA</td>
                <td className={TDR}>−$19.240</td>
                <td className={TDR}>−$28.598</td>
              </tr>
              <tr>
                <td className={TD}>Deducción total</td>
                <td className={`${TDR} text-[#e08a6f]`}>−$427.857 · 4,45%</td>
                <td className={`${TDR} text-[#e08a6f]`}>−$634.215 · 4,44%</td>
              </tr>
              <tr>
                <td className={TOT}>Depositado en la cuenta</td>
                <td className={TOTR}>$9.192.243</td>
                <td className={TOTR}>$13.664.685</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={P}>
          Al ritmo de agosto, cobrar con tarjeta cuesta <span className={NUM}>$7,6 millones</span> al
          año. Esa comisión no aparece en la estructura de costos del punto 03 —Bold la descuenta
          antes de depositar—, pero con $634.215 sería la quinta categoría de gasto del mes, por
          encima de los insumos.
        </p>

        <Flag title="Lo primero que hay que verificar">
          <p>
            Las 19 partidas de egresos de agosto suman exactamente $18.524.759 y ninguna es la
            comisión del datáfono. Quedan dos posibilidades.
          </p>
          <p>
            Si la hoja registra como ingreso lo cobrado —$14.298.900 en tarjeta—, entonces los
            $634.215 que Bold descontó son un gasto que falta: la utilidad de agosto sería{' '}
            <strong className="text-[#cfe5fa] font-semibold">$413.026</strong> y el margen 2,1% en
            lugar de 5,4%. Si registra lo depositado —$13.664.685—, la comisión ya está descontada y
            no hay nada que corregir.
          </p>
          <p className="text-[#cfe5fa] font-semibold">
            Se resuelve comparando un solo día de la hoja con el depósito de Bold de ese día.
          </p>
        </Flag>

        <Flag title="Una tarifa que se puede bajar" tone="ok">
          <p>
            Bold liquidó a dos tarifas distintas: <span className={NUM}>4,29%</span> en 60 de los 70
            cobros y <span className={NUM}>3,29%</span> en los otros 10. Los diez baratos son las
            seis tarjetas colombianas y las cuatro transacciones en las que el cliente aceptó pagar
            en su moneda (conversión dinámica).
          </p>
          <p>
            Si las 33 transacciones internacionales de agosto hubieran liquidado al 3,29%, la
            deducción habría sido <strong className="text-[#cfe5fa] font-semibold">$122.883</strong>{' '}
            menor — <span className={NUM}>$1,5 millones</span> al año. Son solo cuatro casos, así que
            antes de cambiar nada conviene confirmar con Bold si ofrecer la conversión de moneda en
            el datáfono baja de verdad la tarifa, y a qué costo para el cliente.
          </p>
        </Flag>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Cobros rechazados</h3>
        <p className={P}>
          Nueve intentos no pasaron en dos meses, pero casi todos se resolvieron en el mostrador. Los
          cinco de julio son la misma Mastercard reintentada entre las 4:51 y las 4:53 p. m. del 31,
          y un minuto después la venta de $296.800 se cobró con otra tarjeta. En agosto, el rechazo
          del 15 se recuperó al minuto siguiente y los dos del 17 vienen después de un cobro exitoso
          por el mismo monto.
        </p>
        <p className={P}>
          Queda uno sin contrapartida:{' '}
          <span className={NUM}>$138.000</span> el 18 de agosto a las 6:52 p. m., sin ningún cobro
          cercano que lo reemplace. Es la única venta con tarjeta que parece haberse perdido en dos
          meses — un 1,0% de lo cobrado en agosto. El datáfono no es un problema.
        </p>

        <h3 className="font-headline text-lg text-[#cfe5fa] mt-8 mb-2">Ritmo de operación</h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-4">
            <thead>
              <tr>
                <th className={TH}>Indicador</th>
                <th className={THR}>Julio</th>
                <th className={THR}>Agosto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Días del mes con al menos un cobro</td>
                <td className={TDR}>15 de 31</td>
                <td className={TDR}>24 de 31</td>
              </tr>
              <tr>
                <td className={TD}>Cobros exitosos</td>
                <td className={TDR}>31</td>
                <td className={TDR}>39</td>
              </tr>
              <tr>
                <td className={TD}>Ticket promedio por cobro</td>
                <td className={TDR}>$310.326</td>
                <td className={TDR}>$366.638</td>
              </tr>
              <tr>
                <td className={TD}>Pagos con débito</td>
                <td className={TDR}>5,9%</td>
                <td className={TDR}>20,5%</td>
              </tr>
              <tr>
                <td className={TD}>Peso del cobro más grande del mes</td>
                <td className={TDR}>8,5%</td>
                <td className={TDR}>10,4%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={P}>
          El salto de 15 a 24 días con venta es el mejor indicador operativo de los dos meses: el spa
          dejó de facturar a ráfagas. La contracara es la concentración —el cobro del 27 de agosto,{' '}
          <span className={NUM}>$1.484.000</span> con una tarjeta de Guyana, es por sí solo el 10,4%
          del mes—, y con un margen de seguridad del 3,5% un solo cliente de ese tamaño decide si el
          mes cierra en positivo.
        </p>

        <Flag title="Matiz sobre «crece por volumen, no por precio»">
          <p>
            El punto 02 concluye que la facturación crece por volumen. Con tarjeta el ticket por
            cobro subió 18% —de $310.326 a $366.638— y el número de cobros solo 26%. No es
            necesariamente una subida de precios: un cobro puede cubrir varios servicios o varias
            personas. Pero el crecimiento no viene únicamente del volumen.
          </p>
          <p>
            Tampoco se sabe cuánto entra en efectivo. En julio la tarjeta fue el{' '}
            <span className={NUM}>60,1%</span> de los ingresos registrados; en agosto no se puede
            calcular igual, porque el informe se cerró el 27 y el datáfono cubre el mes completo.
            Cuanto más pese la tarjeta, menos efectivo entra al cajón y más dinero llega por Bold,
            con su 4,4% de descuento y su demora de depósito. Es relevante para la caja del punto 06.
          </p>
        </Flag>
      </Section>

      {/* 09 ------------------------------------------------------------- */}
      <Section n="09" title="Hacia dónde puede ir">
        <Figure caption="La línea punteada marca el techo de capacidad: con las camillas y turnos actuales, alrededor de $38 millones mensuales.">
          <svg
            viewBox="0 0 720 300"
            className="w-full h-auto"
            role="img"
            aria-label="Proyección de utilidad mensual a doce meses en tres escenarios"
          >
            <line x1="66" y1="256" x2="590" y2="256" stroke={GRID} strokeWidth="1" />
            <text x="56" y="260" textAnchor="end" style={ax}>
              0M
            </text>
            <line x1="66" y1="178.7" x2="590" y2="178.7" stroke={GRID} strokeWidth="1" />
            <text x="56" y="182.7" textAnchor="end" style={ax}>
              14M
            </text>
            <line x1="66" y1="101.3" x2="590" y2="101.3" stroke={GRID} strokeWidth="1" />
            <text x="56" y="105.3" textAnchor="end" style={ax}>
              28M
            </text>
            <line x1="66" y1="24" x2="590" y2="24" stroke={GRID} strokeWidth="1" />
            <text x="56" y="28" textAnchor="end" style={ax}>
              42M
            </text>

            <polyline
              points="66.0,252.6 109.7,242.3 153.3,230.9 197.0,218.4 240.7,204.7 284.3,189.6 328.0,173.0 371.7,154.7 415.3,134.6 459.0,112.5 502.7,88.2 546.3,61.4 590.0,32.0"
              fill="none"
              stroke={GREEN}
              strokeWidth="2.5"
            />
            <text x="598" y="36" style={{ ...val, fill: GREEN }}>
              Optimista +10%
            </text>

            <polyline
              points="66.0,252.6 109.7,247.4 153.3,242.0 197.0,236.3 240.7,230.3 284.3,224.1 328.0,217.5 371.7,210.6 415.3,203.3 459.0,195.7 502.7,187.7 546.3,179.3 590.0,170.5"
              fill="none"
              stroke={OCHRE}
              strokeWidth="2.5"
            />
            <text x="598" y="174.5" style={{ ...val, fill: OCHRE }}>
              Esperado +5%
            </text>

            <polyline
              points="66.0,252.6 590.0,252.6"
              fill="none"
              stroke={STEEL}
              strokeWidth="2.5"
            />
            <text x="598" y="256.6" style={{ ...val, fill: STEEL }}>
              Conservador 0%
            </text>

            <line
              x1="66"
              y1="44.4"
              x2="590"
              y2="44.4"
              stroke={CLAY}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="66" y="276" textAnchor="middle" style={ax}>
              mes 0
            </text>
            <text x="197" y="276" textAnchor="middle" style={ax}>
              mes 3
            </text>
            <text x="328" y="276" textAnchor="middle" style={ax}>
              mes 6
            </text>
            <text x="459" y="276" textAnchor="middle" style={ax}>
              mes 9
            </text>
            <text x="590" y="276" textAnchor="middle" style={ax}>
              mes 12
            </text>
            <text x="66" y="294" style={ax}>
              Utilidad mensual. Los costos fijos se asumen constantes en $18.050.259.
            </text>
          </svg>
        </Figure>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-[14.5px] font-body border-collapse my-5">
            <thead>
              <tr>
                <th className={TH}>Escenario</th>
                <th className={THR}>Crecimiento</th>
                <th className={THR}>Ingresos mes 12</th>
                <th className={THR}>Utilidad mensual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Conservador</td>
                <td className={TDR}>0%</td>
                <td className={TDR}>$19,6M</td>
                <td className={TDR}>$1,05M</td>
              </tr>
              <tr>
                <td className={TD}>Esperado</td>
                <td className={TDR}>+5%/mes</td>
                <td className={TDR}>$35,1M</td>
                <td className={TDR}>$15,48M</td>
              </tr>
              <tr>
                <td className={TD}>Optimista</td>
                <td className={TDR}>+10%/mes</td>
                <td className={TDR}>$61,4M</td>
                <td className={TDR}>$40,55M</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={P}>
          Los tres escenarios asumen costos fijos constantes. Ese es el supuesto que importa: si los
          costos siguen creciendo al ritmo de agosto, ningún nivel de ventas alcanza. El escenario
          optimista además rompe el techo de capacidad hacia el mes 7 y exigiría más camillas o más
          turnos.
        </p>
      </Section>

      {/* 10 ------------------------------------------------------------- */}
      <Section n="10" title="Cómo mejorar la utilidad">
        <p className={P}>
          El camino más corto no pasa por vender más. Pasa por devolver los costos a donde estaban
          hace un mes.
        </p>

        <Figure caption="Cada palanca es independiente. Ninguna requiere vender un servicio adicional.">
          <svg
            viewBox="0 0 720 230"
            className="w-full h-auto"
            role="img"
            aria-label="Palancas de mejora de la utilidad mensual"
          >
            <rect x="214" y="10" width="56.6" height="26" fill={STEEL} rx="2" />
            <text x="202" y="28" textAnchor="end" style={axB}>
              Utilidad de agosto
            </text>
            <text x="280.6" y="28" style={val}>
              $1.047.241
            </text>

            <rect x="270.6" y="56" width="178.7" height="26" fill={CLAY} rx="2" />
            <text x="202" y="74" textAnchor="end" style={axB}>
              Salarios al nivel de julio
            </text>
            <text x="459.3" y="74" style={val}>
              +$3.304.000
            </text>

            <rect x="449.3" y="102" width="91.9" height="26" fill={OCHRE} rx="2" />
            <text x="202" y="120" textAnchor="end" style={axB}>
              Publicidad al nivel de julio
            </text>
            <text x="551.3" y="120" style={val}>
              +$1.700.000
            </text>

            <rect x="541.3" y="148" width="54.1" height="26" fill={BLUE} rx="2" />
            <text x="202" y="166" textAnchor="end" style={axB}>
              Arriendo un millón menos
            </text>
            <text x="605.4" y="166" style={val}>
              +$1.000.000
            </text>

            <line x1="214" y1="192" x2="700" y2="192" stroke={GRID} strokeWidth="1" />
            <text x="202" y="212" textAnchor="end" style={axB}>
              Utilidad potencial
            </text>
            <text x="214" y="212" style={{ ...val, fill: GREEN, fontWeight: 700 }}>
              $7.051.241 al mes · 5,8 veces la actual
            </text>
          </svg>
        </Figure>

        <p className={P}>
          Volver los salarios y la publicidad al nivel de julio llevaría la utilidad mensual de
          $1.047.241 a <strong className="text-[#cfe5fa] font-semibold">$6.051.241</strong>, y el
          plazo de recuperación del capital de 54 meses a menos de 10. Ninguna campaña de marketing
          ofrece un retorno comparable.
        </p>
      </Section>

      {/* 11 ------------------------------------------------------------- */}
      <Section n="11" title="Plan de acción">
        <Horizon>Primeros 30 días</Horizon>
        <Plan
          items={[
            {
              title: 'Verificar si la comisión de Bold ya está contada',
              body: 'Comparar un día de la hoja de ingresos con el depósito de Bold de ese día. Si la hoja registra lo cobrado y no lo depositado, faltan $634.215 de gasto en agosto y la utilidad real es $413.026, no $1.047.241. Es la corrección más grande pendiente y se resuelve en diez minutos.',
            },
            {
              title: 'Explicar el salto de salarios',
              body: 'Determinar si los $5.676.300 de agosto incluyen pagos atrasados o corresponden a dotación nueva. Es el dato que define si el plazo de recuperación es de 33 o de 54 meses.',
            },
            {
              title: 'Suspender los retiros a socios',
              body: 'Hasta acumular un mes de costos fijos en reserva ($18.050.259). Hoy quedan $400.000 en cuenta.',
            },
            {
              title: 'Corregir la pauta',
              body: 'Reactivar la campaña de Meta de $1.012 por conversación y suspender o reorientar la de Google en español.',
            },
            {
              title: 'Registrar junio',
              body: 'Los ingresos del 1 al 25 de junio no están en la hoja; hoy el mes es una estimación reconstruida desde el datáfono.',
            },
          ]}
        />

        <Horizon>Días 30 a 60</Horizon>
        <Plan
          items={[
            {
              title: 'Rastrear los $8.344.254',
              body: 'Conciliar el capital aportado con los desembolsos documentados. Si es capital de trabajo disponible, alivia la situación de caja.',
            },
            {
              title: 'Registrar los retiros a socios',
              body: 'Como categoría propia, separada de los gastos operativos. Sin ese registro no se puede verificar si cada socio recibió lo que le corresponde, ni cuadrar el saldo de caja.',
            },
            {
              title: 'Pedir el alcance del fee de agencia',
              body: 'Por escrito, y contrastarlo con las decisiones de cuenta de los últimos dos meses.',
            },
            {
              title: 'Medir la conversión de WhatsApp',
              body: 'Las 47 conversaciones que generó Meta en agosto son contables a mano. Sin ese dato, el retorno de Meta es una hipótesis.',
            },
            {
              title: 'Confirmar el tratamiento del IVA',
              body: 'Si el spa es responsable de IVA, el 19% pagado en publicidad es descontable y no constituye costo. Son unos $700.000.',
            },
          ]}
        />

        <Horizon>Días 60 a 90</Horizon>
        <Plan
          items={[
            {
              title: 'Revisar el arriendo',
              body: '$7.000.000 son el 37,8% de los costos. Con un margen de seguridad del 3,5% ya no hay holgura para absorberlo cómodamente.',
            },
            {
              title: 'Reducir la dependencia del turismo',
              body: 'Construir demanda local o corporativa que sostenga los meses de temporada baja.',
            },
            {
              title: 'Congelar la ampliación de personal',
              body: 'Con el spa al 44% de capacidad, cualquier costo fijo adicional debe justificarse con demanda comprobada, no proyectada.',
            },
          ]}
        />
      </Section>

      {/* 12 ------------------------------------------------------------- */}
      <Section n="12" title="Qué falta por saber">
        <p className={P}>
          Estas nueve brechas afectan la precisión del informe. Ninguna cambia el diagnóstico
          general, pero conviene cerrarlas antes de decisiones de inversión mayores.
        </p>
        <ul className="list-disc pl-5 my-3 flex flex-col gap-2.5 font-body text-[15px] leading-relaxed text-[#cfe5fa]/80 max-w-[64ch]">
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              Junio 1–25 no está registrado.
            </strong>{' '}
            Se reconstruyó desde el datáfono aplicando la proporción de ventas con tarjeta observada
            en julio y agosto.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              Mayo no registra pagos a terapeutas.
            </strong>{' '}
            O se pagaron desde otra fuente o falta el asiento.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              Los retiros a socios no están registrados
            </strong>
            , lo que impide conciliar la caja con la utilidad acumulada y explica los $1.623.759 sin
            soporte del cierre de agosto.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              Tres rubros del registro manuscrito
            </strong>{' '}
            —«para terminar», «reserva» y «pagos»— no tienen clasificación clara.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              Un pago de $100.000 rotulado «Pago Meta»
            </strong>{' '}
            está clasificado como salario. Es publicidad.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              El panel de ventas marca como anuladas todas las ventas de mayo y junio
            </strong>{' '}
            y reporta cero transacciones. Es un error del lector de correos de Bold con el formato
            anterior a julio; los montos son correctos, el conteo y las anulaciones no.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              El costo variable se modela al 4,6% de las ventas
            </strong>{' '}
            aunque los insumos de agosto fueron el 2,4%. Sumando la comisión del datáfono —3,2% de
            los ingresos del mes— el costo variable real se acerca al 5,6%, y entonces el 4,6% no es
            el supuesto conservador sino el optimista. Depende de la verificación del punto 08.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              El corte de agosto no es el mismo en las dos fuentes.
            </strong>{' '}
            El informe se elaboró el 27 de agosto; el datáfono cubre el mes completo y registró
            $1.731.200 con tarjeta entre el 28 y el 31. Si la hoja se cerró el 27, los ingresos de
            agosto están subestimados en al menos esa cifra y el margen del mes es mejor de lo que
            muestra el punto 02.
          </li>
          <li>
            <strong className="text-[#cfe5fa] font-semibold">
              No se sabe cuánto se cobra en efectivo.
            </strong>{' '}
            En julio la tarjeta fue el 60,1% de los ingresos registrados; el 39,9% restante no tiene
            respaldo documental equivalente. Sin conocer la proporción real de efectivo no se puede
            conciliar la caja del punto 06.
          </li>
        </ul>
      </Section>

      <footer className="pt-8 text-[13px] leading-relaxed text-[#5c656d] font-body max-w-[70ch]">
        <p>
          Elaborado a partir del registro de ingresos y egresos en Google Sheets, los cierres del
          datáfono Bold, las cuentas de Google Ads y Meta Ads, y el registro manuscrito de la segunda
          inversión. Los puntos 07 y 08 se rehicieron el 1 de septiembre de 2026 con los informes
          mensuales de transacciones de Bold de julio y agosto —70 cobros exitosos y 9 rechazados,
          con detalle de origen, franquicia, comisión y depósito—, que reemplazan las estimaciones
          anteriores sobre el origen de los clientes. Las cifras de junio y los egresos marcados como
          estimados siguen siendo reconstrucciones, no datos registrados.
        </p>
      </footer>
    </div>
  )
}
