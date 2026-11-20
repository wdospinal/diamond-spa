# Análisis de keywords, páginas y redes de la competencia — Diamond Spa

**Fecha:** 19 de noviembre de 2026
**Complementa:** `INFORME_COMPETENCIA.md` (tráfico, posiciones, mapa y Google Ads).
**Datos en bruto de este análisis:**
- `paginas_competencia.csv`: cada página rastreada, con título, H1, meta, palabras, datos estructurados y keywords que contiene.
- `keywords_por_competidor.json`: para cada keyword y cada competidor, su mejor página, dónde la usa y la frase exacta.
- `redes_sociales.json`: seguidores, interacción y vistas recientes en Instagram y TikTok.

---

## 1. Resumen ejecutivo

1. **Rastreamos 680 páginas de 10 sitios** (la web de Aqualuna estaba caída, con error 502). Diamond Spa es de los sitios más completos: 114 páginas, unas 1.056 palabras por página, FAQ y datos estructurados en casi todas, y versión en inglés.
2. **Los que nos ganan en hombres usan una fórmula de título que no usamos:** `[Servicio] para Hombres en Medellín | Marca`. DM Spa tiene 16 páginas así y Spa 5 Elementos tiene «para hombres», «para mujeres» y «para parejas» en cada servicio (312 URLs en su sitemap). Nosotros solo tenemos 5 páginas con «hombres» en el título.
3. **Celestino** gana en búsquedas generales con pocas páginas (31), cada una muy enfocada en una keyword: «Masajes en Medellín», «Spa en El Poblado», «Masaje a 4 Manos en Medellín», «Masaje para Parejas en Medellín», «Tarjetas de Regalo y Membresías», «Lista de Precios 2026–2027».
4. **Amatsu y Viva** empujan con volumen de blog (43 y 29 artículos frente a nuestros 14) y títulos tipo «7 razones para ir a un spa relajante en Medellín».
5. **Akzara** monetiza fechas y grupos: despedida de soltera, bienestar corporativo, 2x1, membresías y Día del Padre. Además tiene reels virales (1,7M y 454K vistas).
6. **Nos faltan páginas para:** masajes de cada tipo «para hombres», spa para parejas (landing propia), membresías, tarjetas de regalo como página permanente, despedida de soltera y grupos, empresas, y una lista de precios.
7. **Redes:** tenemos la **mejor tasa de interacción del grupo** (2,78% en Instagram, 62 likes de media). Las cuentas grandes (Aqualuna con 28K, Le Spa Noir con 17,5K y Celestino con 16,7K) tienen alrededor de 0,1%. Ya tuvimos un reel de 180K vistas y un TikTok de 221K. Nos falta volumen de seguidores, no calidad.

---

## 2. Metodología

| Paso | Cómo | Alcance |
|---|---|---|
| Rastreo de sitios | Sitemap + enlaces internos, hasta 120 páginas por sitio | 10 sitios, 680 páginas |
| Análisis de cada página | Título, meta, H1–H3, texto visible, ALT de imágenes, JSON-LD | Todas las páginas rastreadas |
| Keywords | 60 keywords de Search Console, Google Ads y Google, normalizadas sin tildes | Coincidencia exacta de la frase |
| Puntuación de la «mejor página» | Keyword en título ×5, H1 ×4, URL ×3, meta ×2, H2 ×1, más número de menciones | Por sitio y keyword |
| Ranking en Google | Top 10 orgánico de 24 keywords (captura del 19 nov, ver `serp_organico.csv`) | Dominio y posición |
| Redes | Social Blade y perfiles públicos de Instagram (pestaña Reels) y TikTok | 14 cuentas de Instagram y 4 de TikTok |

**Limitaciones:**
- Google bloqueó temporalmente las búsquedas automáticas («tráfico inusual») mientras repetía la captura con URLs exactas. No se forzó. La URL exacta que rankea se infiere de la mejor página del sitio para esa keyword; el dominio y su posición sí son de Google.
- Prestige usa un sitio Wix que casi no se deja rastrear (3 páginas).
- Aqualuna devolvía error 502 el 19 de noviembre, aunque sigue pagando anuncios.
- Algunas cuentas de redes no se pudieron confirmar (marcadas como «posible»).

---

## 3. Universo de keywords de Diamond Spa

Cruce de Search Console (19 ago – 17 nov), Google Ads (20 oct – 18 nov) y Google (19 nov).

| Keyword | Grupo | Clics SC | Imp. SC | Pos. SC | Clics Ads | Conv. Ads | Top 10 orgánico hoy |
|---|---|---|---|---|---|---|---|
| diamond spa / diamond spa medellin | Marca | 158 | 646 | 2,3–2,7 | 34 | 1 | ✅ #1 |
| spa para hombres medellin | Hombres | 12 | 268 | 6,1 | 57 | 2 | ❌ |
| spa for men medellin | Hombres | 15 | 153 | 3,4 | 103 | 1,5 | ❌ |
| masajes para hombres (medellin) | Hombres | 9–13 | 242–259 | 7,5–8,0 | 144 | 6 | ❌ |
| spa para hombres | Hombres | 7 | 157 | 7,7 | 20 | 0 | ❌ |
| spa hombres medellin | Hombres | 6 | 78 | 7,9 | 8 | 0 | ❌ |
| spa medellin | General | 17 | 817 | 12,0 | — | — | ❌ |
| massage medellin / in medellin | General (EN) | 9 | 35+ | 12–19 | 528 | 16,5 | ⚠️ #6–7 |
| massage near me | General (EN) | 10 | 795 | 9,1 | 115 (término) | 3 | — |
| masajes medellin | General | — | — | — | 25 (término) | 2 | ❌ |
| tipos de masajes | Informativa | 4 | 759 | 8,8 | — | — | — |
| spa el poblado / spa poblado | El Poblado | — | — | — | — | — | ⚠️ #8–9 |
| masajes (el) poblado | El Poblado | 8 | 133 | 6,6 | — | — | ⚠️ #4–6 |

*SC = Search Console; Pos. = posición media; «Top 10 orgánico hoy» viene de la captura de Google del 19 nov.*

---

## 4. Cómo usa cada competidor cada keyword

Para cada keyword: la **mejor página** de cada sitio, **dónde** aparece la keyword (título, H1, URL, meta, H2) y la **frase** que usan. Ordenado de más a menos optimizado. La tabla completa está en `keywords_por_competidor.json`.

### 4.1 «spa para hombres (en Medellín)»
| Sitio | Páginas que la usan | Dónde | Mejor página | Frase |
|---|---|---|---|---|
| Om Spa | 7 | título, H1, URL | `/sabias-que-existen-tratamientos-de-spa-para-hombres…` (blog) | «¿Sabías que existen tratamientos de spa para hombres en Medellín?» |
| Spa 5 Elementos | 11 | título, meta, H1 | `/medellin/4-dias-de-para-spa-hombres/` | «Spa para hombres en Medellín: planes \| 5 Elementos» |
| Amatsu | 3 | H1, URL | `/spa-para-hombres-medellin/` | «Spa para hombres: favorece tu bienestar y salud» |
| DM Spa | 1 | título | `/` | «DM Spa Medellín \| Spa para Hombres con Masajes Premium en El Poblado» |
| DoSpa | 1 | título, meta | `/` | — |
| **Diamond Spa** | **1** | título, meta | `/es/masajes-para-hombres` | «Masajes y Spa para Hombres en Medellín ⭐ 4.9 — Desde $120.000 COP» |

**Lectura:** Om tiene un artículo de blog dedicado a la frase exacta; Spa 5 Elementos y Amatsu tienen una URL dedicada. Nosotros solo la tenemos en el título de la landing de masajes.

### 4.2 «masajes para hombres»
| Sitio | Páginas | Dónde | Mejor página | Frase |
|---|---|---|---|---|
| **Diamond Spa** | **59** | H1, H2, URL | `/es/masajes-para-hombres` | «Masajes para Hombres en Medellín» |
| Prestige | 2 | título, meta | `/` | «Spa Massages For Men Medellin \| Masajes para hombres en medellin» |
| Om Spa | 1 | H1 | `/` | «Masajes para hombres en Medellín» |
| DM Spa | 16 títulos | título | `/masajes-terapeuticos/masaje-relajante/` y otras | «Masaje Relajante para Hombres en Medellín \| DM Spa» |

**Lectura:** usamos la frase más que nadie, pero en **una sola URL**. DM Spa la reparte en **una URL por servicio** («Masaje Relajante / Deportivo / con Piedras Volcánicas para Hombres en Medellín»), lo que le da más puertas de entrada.

### 4.3 «spa for men» (inglés)
| Sitio | Páginas | Dónde | Mejor página | Frase |
|---|---|---|---|---|
| Spa 5 Elementos | 11 | título, meta, H1 | `/en/medellin/4-spa-day-for-men/` | «Spa for men in Medellín: plans» |
| Om Spa | 43 | título (marca) | `/` | El nombre de la marca contiene la keyword |
| Prestige | 3 | H1, H2 | `/` | «Prestige Spa For Men Medellín» |
| **Diamond Spa** | 3 | título, meta | `/en/masajes-para-hombres` | «Massages & Spa for Men in Medellín» |

### 4.4 «spa en Medellín / spa medellin»
| Sitio | Páginas | Dónde | Mejor página | Frase |
|---|---|---|---|---|
| Amatsu | 30 | título, meta, H1, URL | `/en/amatsu-spa-tu-mejor-opcion-de-spa-en-medellin` (blog) | «Entre tanto spa en Medellín, contamos por qué elegir Amatsu Spa» |
| Spa 5 Elementos | 13 | título, meta, H1, H2 | `/medellin/` | «Spa en Medellín, El Poblado \| 5 Elementos» |
| Om Spa | 6 | título, H1, URL | `/por-que-ir-a-un-spa-en-medellin-te-hace-mas-fuerte` | «¿Por qué ir a un SPA en Medellín te hace más fuerte?» |
| Akzara | 120 | título en todas | `/` | «Spa en Medellin \| Masajes en pareja \| Relax massage \| Día…» |
| Celestino | 5 | título, meta, H1 | `/es/tratamientos/` | «Tratamientos de Spa en Medellín» |
| **Diamond Spa** | 15 | título, meta, H1 | `/es` y `/es/dia-de-spa` | «Spa en Medellín \| Diamond Spa en El Poblado» |

**Lectura:** Akzara pone «Spa en Medellín» en el título de **todas** sus páginas, y Amatsu y Om tienen artículos con la frase en la URL. Nosotros la tenemos en la portada, que está en la posición 12.

### 4.5 «masajes en Medellín»
| Sitio | Páginas | Dónde | Mejor página | Frase |
|---|---|---|---|---|
| Om Spa | 5 | título, meta, H1, URL | `/masajes-en-medellin-cual-es-el-mejor-para-mi/` | «¿Masajes en Medellín, cuál es el mejor para mí?» |
| Celestino | 5 | título, meta, H1 | `/es/masajes/` | «Masajes en Medellín — Relajantes y Deportivos» |
| **Diamond Spa** | 57 | título, H1 | `/es/masajes` | «Masajes en Medellín — Relajante, Deep Tissue, Deportivo y más» |
| Spa 5 Elementos | 1 | título, H1 | `/medellin/1-masajes/` | «Masajes en Medellín, El Poblado: precios» |

**Lectura:** estamos bien optimizados. Celestino gana por autoridad y reseñas, no por el texto. Spa 5 Elementos añade «precios» al título, que atrae clics.

### 4.6 «masaje relajante» y «masajes relajantes»
| Sitio | Páginas | Mejor página | Frase |
|---|---|---|---|
| **Diamond Spa** | 24 | `/es/blog/beneficios-masaje-relajante` | «Beneficios del Masaje Relajante Según la Ciencia» |
| Amatsu | 27 | `/como-prepararse-antes-de-un-masaje-relajante/` | «Preparación para un masaje relajante: consejos y pasos clave» |
| Spa 5 Elementos | 21 | `/medellin/1-masajes/2-masaje-relajante.htm` | «Masaje relajante en Medellín» |
| DM Spa | 4 | `/masajes-terapeuticos/masaje-relajante/` | «Masaje Relajante **para Hombres** en Medellín» |
| Akzara | 103 | `/masaje-relajante-10-manos…` | «Masaje Relajante a 10 manos» |
| Viva Spa | 21 | `/masaje-relajante.html` | «¿En qué áreas se enfoca el masaje relajante?» |

### 4.7 El Poblado
| Sitio | Mejor página | Dónde | Frase |
|---|---|---|---|
| **Diamond Spa** | `/es/spa-el-poblado` (929 menciones de «el poblado» en 114 páginas) | título, meta, H1, H2, URL | «Spa en El Poblado, Medellín: Masajes y Faciales» |
| Celestino | `/es/spa-en-el-poblado/` | título, meta, H1, URL | «Spa en El Poblado, Medellín — Celestino Spa, Provenza» |
| Viva Spa | `/dia-spa.html` (80 títulos con «Poblado») | título, meta | «Día de Spa en El Poblado, Medellín \| Planes en Viva Spa» |
| Spa 5 Elementos | `/medellin/` | título, meta | «Spa en Medellín, El Poblado» |

**Lectura:** somos los que más trabajamos «El Poblado» en el texto. Viva gana porque lo lleva **en el nombre de la marca y del dominio** (vivaspapoblado), y Celestino por autoridad y reseñas.

### 4.8 Servicios
| Keyword | Líder del texto | Su página y frase | Diamond Spa |
|---|---|---|---|
| deep tissue | Celestino | `/deep-tissue-massage/`: «Deep Tissue Massage in Medellín — Sports Recovery» | ✅ página propia y artículo de blog |
| masaje deportivo | Spa 5 Elementos y DM Spa | «Masaje deportivo en Medellín»; «Masaje Deportivo **para Hombres** en Medellín» | ✅ `/es/masajes/deportivo`, sin versión «para hombres» |
| piedras volcánicas | Viva Spa, Amatsu, DM Spa | «Masaje con Piedras Volcánicas en El Poblado \| Relax Total»; «…**para Hombres** en Medellín» | ✅ `/es/masajes/piedras-volcanicas`, sin versión «para hombres» |
| 4 manos | Celestino | «Masaje a 4 Manos en Medellín — Ritual Insignia» | ✅ `/es/masajes/4-manos` |
| pareja | Celestino, Viva, Spa 5 Elementos, Amatsu, Akzara | «Masaje para Parejas en Medellín — Spa para Dos»; «Spa en Pareja en Medellín \| Planes Románticos en El Poblado»; «Spa para parejas en Medellín: planes» | ⚠️ solo `/es/masajes/duo` («Masaje en Pareja en Medellín»); no hay landing «spa para parejas» |
| depilación | Diamond Spa (407 menciones) | — | ✅ el más fuerte en texto |
| limpieza facial | Viva Spa, Amatsu | «Limpieza Facial Profunda en Medellín \| Viva Spa Poblado» | ✅ página propia |
| hidrafacial | Spa 5 Elementos y Diamond Spa | — | ✅ los dos únicos con página |
| a domicilio | DM Spa (eróticos) y Diamond Spa | — | ✅ página nueva (19 nov) |
| sauna, cold plunge | Celestino y Akzara | «Sauna in Medellín — Cold Plunge & Jacuzzi» | ❌ no tenemos esas instalaciones |
| tarjeta de regalo / gift card | Celestino y Spa 5 Elementos | «Tarjetas de Regalo y Membresías de Spa en Medellín»; «Bonos de regalo para spa: diseños disponibles» | ⚠️ tenemos regalos por fecha especial, no una página permanente de tarjetas de regalo |
| membresía | Celestino, Akzara, Spa 5 Elementos, Om | «Guía de membresías \| Spa 5 Elementos»; «MEMBRESÍA masaje relajante» | ❌ |

---

## 5. Estrategia de cada competidor

| Sitio | Páginas (sitemap) | Palabras/página | Artículos | Inglés | Títulos con «Medellín» | Títulos con «hombre/men» | Datos estructurados |
|---|---|---|---|---|---|---|---|
| **Diamond Spa** | 114 (105) | 1.056 | 14 | 57 | 110 | 7 | FAQPage, DaySpa, Offer, Service |
| Spa 5 Elementos | 120 (312) | 1.038 | 2 | 60 | 104 | 15 | DaySpa, Breadcrumb |
| Akzara | 120 (192) | 1.035 | ~9 | 26 | 33 | 0 | Product, AggregateOffer |
| Amatsu | 120 (235) | 927 | ~43 | 17 | 28 | 2 | LocalBusiness, **AggregateRating**, Breadcrumb |
| Viva Spa | 88 (86) | 890 | ~29 | 0 | 36 (80 con «Poblado») | 0 | Place, WebPage |
| Om Spa | 48 (49) | 433 | ~4 | 0 | 6 | 5 | Organization (WooCommerce) |
| Celestino | 31 (31) | 612 | 0 | sí (sin /en/) | 23 | 0 | DaySpa, Breadcrumb |
| DM Spa | 22 (22) | 565 | 0 | 0 | 20 | **16** | Organization, Place |
| DoSpa | 14 (13) | 401 | 0 | 0 | 0 | 1 | Organization |
| Prestige | 3 | 263 | 0 | 0 | 3 | 3 | WebSite |

### Spa 5 Elementos: una página por servicio y público
- **Fórmula:** `[Servicio] para [hombres/mujeres/parejas] en Medellín | Spa 5 Elementos`.
- Ejemplos: «Chocolaterapia para hombres en Medellín», «Chocolaterapia para mujeres en Medellín», «Chocolaterapia 2 personas para parejas en Medellín».
- 312 URLs en el sitemap, todo en español e inglés, más páginas de membresías, puntos y bonos.
- **Por qué funciona:** cubre cientos de combinaciones de búsqueda con páginas específicas.

### DM Spa: dominio con la keyword y todo «para hombres»
- 16 de sus 22 títulos dicen «para Hombres en Medellín».
- El dominio es `dmspaparahombres.com`.
- Mezcla masajes terapéuticos con tántricos y eróticos; ese contenido no es un modelo para nosotros.

### Om Spa For Men: marca con keyword y antigüedad
- La marca «Spa For Men» repite la keyword en las 43 páginas. Está en línea desde 2016 («desde 2007» según su web).
- Tienda WooCommerce con bonos de regalo, paquetes («5 masajes relajantes paquete hombre») y «Día especial».
- Pocos artículos (4), pero cada uno con la keyword exacta en la URL.
- Su Instagram enlazado (`omspaformen`) ya no existe.

### Celestino: pocas páginas, cada una enfocada en una keyword
- **Fórmula:** `[Keyword] en Medellín — [diferencial] | Celestino Spa`.
- Ejemplos: «Masajes en Medellín — Relajantes y Deportivos», «Masaje a 4 Manos en Medellín — Ritual Insignia», «Sauna in Medellín — Cold Plunge & Jacuzzi».
- Lista de precios con año («2026–2027»), tarjetas de regalo y membresías, parejas y grupos.

### Amatsu y Viva Spa: volumen de blog
- **Amatsu:** unos 43 artículos con títulos de lista («7 razones…», «6 beneficios…») y la marca más «Spa en Medellín».
- **Viva Spa:** unos 29 artículos y páginas de tienda por servicio, con «Poblado» en 80 títulos.

### Akzara: fechas, grupos y promociones
- Páginas para despedida de soltera, bienestar corporativo, 2x1, Día del Padre, membresías y rituales.
- «Spa en Medellín» en el título de todas las páginas.

---

## 6. Qué hacen para subir en Google (patrones)

1. **Keyword + «en Medellín» al inicio del título**, y la marca al final.
2. **Una URL por intención:** servicio × público (hombres, mujeres, parejas), servicio × zona y servicio × ocasión.
3. **Keyword en el dominio o en la marca:** Om Spa **For Men**, DM Spa **para Hombres**, Viva Spa **Poblado**.
4. **Volumen de blog** con preguntas y listas: «¿Cuál es el mejor…?», «7 razones…», «¿Sabías que…?».
5. **Páginas comerciales permanentes:** precios con año, tarjetas de regalo, membresías y paquetes.
6. **Ocasiones:** despedidas, cumpleaños, empresas, Día del Padre, aguinaldos.
7. **Diferencial en el título:** «Sauna y Cold Plunge», «Ritual Insignia», «precios».
8. **Fuera de la web:** antigüedad, reseñas en Maps (300–770 en búsquedas generales) y fichas de Maps con keywords en el nombre.

---

## 7. Qué tenemos y qué nos falta

| Tipo de página | Nosotros | Quién lo tiene |
|---|---|---|
| Landing de audiencia (hombres y mujeres) | ✅ | Todos |
| **Servicio + «para hombres» (relajante, deportivo, piedras, deep tissue, 4 manos)** | ❌ (solo depilación hombres) | DM Spa (16), Spa 5 Elementos (9) |
| Página por tipo de masaje | ✅ 7 | Spa 5 Elementos, Celestino, DM Spa |
| **Landing «spa para parejas en Medellín»** | ⚠️ solo `/masajes/duo` | Celestino, Viva, Spa 5 Elementos, Amatsu, Akzara |
| Regalos por fecha especial | ✅ 8 fechas | Viva, Akzara, Amatsu |
| **Tarjetas de regalo (página permanente)** | ⚠️ | Celestino, Spa 5 Elementos, Om, Viva |
| **Membresías** | ❌ | Celestino, Akzara, Spa 5 Elementos, Om |
| **Lista de precios con año** | ⚠️ precios en cada página | Celestino, Viva, Spa 5 Elementos |
| **Despedida de soltera, cumpleaños y grupos** | ❌ | Akzara, Viva, Amatsu |
| **Bienestar corporativo** | ❌ | Akzara |
| Blog | ✅ 14 | Amatsu (43), Viva (29) |
| A domicilio | ✅ (nuevo) | DM Spa, Om |
| FAQ y estrellas con datos estructurados | ✅ en 94 páginas | Solo Amatsu tiene AggregateRating |
| Versión en inglés | ✅ 57 páginas | Spa 5 Elementos, Akzara |

---

## 8. Plan para competir por cada keyword

| Keyword objetivo | Hoy | Acción concreta | Página |
|---|---|---|---|
| spa para hombres medellin / spa for men medellin | Fuera del top 10 orgánico; #1 en Maps | 1) Artículo «Spa para hombres en Medellín: qué incluye y cómo elegir» con la frase exacta en URL, título y H1. 2) Enlazar desde la portada con ese texto. 3) Mantener «Spa For Men» en la ficha de Maps. | Nuevo `/es/blog/spa-para-hombres-medellin` + `/es/masajes-para-hombres` |
| masaje relajante / deportivo / piedras volcánicas / deep tissue **para hombres** | No existe | Crear 4–5 páginas «[Masaje] para Hombres en Medellín | Diamond Spa» con contenido propio (beneficios para hombres, presión, duración, precio). | `/es/masajes-para-hombres/relajante`, etc. |
| spa medellin / spa en medellin | Portada en la posición 12 | 1) Artículo «¿Cuál es el mejor spa en Medellín? Cómo elegir» (Amatsu y Om rankean así). 2) Más reseñas en Maps. 3) Enlaces externos (Tripadvisor, directorios). | Portada + artículo nuevo |
| masajes medellin | Bien optimizada; pierde por autoridad | Añadir «precios» al título, como Spa 5 Elementos, y una tabla de precios visible. | `/es/masajes` |
| spa para parejas medellin / masaje en pareja | Solo `/masajes/duo` | Landing «Spa para Parejas en Medellín — Plan Romántico en El Poblado» con planes, precios y regalo. | Nueva `/es/spa-para-parejas` |
| tarjeta de regalo spa medellin / bono regalo | Repartido por fechas | Página permanente «Tarjetas de Regalo de Spa en Medellín», enlazada desde todas las fechas especiales. | Nueva `/es/tarjetas-de-regalo` |
| membresía spa medellin | No existe | Si el negocio la ofrece: «Membresía de masajes en Medellín» (por ejemplo, 4 masajes al mes). | Nueva |
| despedida de soltera spa / cumpleaños | No existe | «Despedida de Soltera y Cumpleaños en Spa — Medellín». | Nueva |
| spa el poblado / masajes el poblado | Posición 4–9 | Reducir la competencia con la portada (ver INFORME §3.4), más reseñas y añadir «Parque Lleras» o «Provenza» en el título. | `/es/spa-el-poblado` |
| precios masajes medellin | Precios repartidos | «Lista de Precios 2026–2027: Masajes y Spa en Medellín». | Nueva `/es/precios` |

---

## 9. Redes sociales

### 9.1 Instagram (19 nov 2026)
| Marca | Cuenta | Seguidores | Posts | Interacción* | Likes promedio | Vistas de los últimos reels (mediana / máx.) |
|---|---|---|---|---|---|---|
| Aqualuna Spa | @aqualuna_spa | **28.100** | 483 | 0,07% | 16,8 | ~2.700 / 36.500 |
| Le Spa Noir | @lespanoircolombia | 17.500 | 401 | 0,12% | 19,7 | ~1.600 / 146.000 |
| Celestino | @celestinohotelandspa | 16.700 | 468 | 0,15% | 24,1 | ~1.000 / 3.920 |
| Spa 5 Elementos | @5elementospa | 11.400 | 13 | 0,12% | 13,0 | ~6.200 / 7.876 |
| Amatsu | @amatsu_spa | 7.973 | 1.582 | 0,03% | 2,8 | ~300 / 811 |
| Viva Spa | @vivaspamedellin | 5.419 | 193 | 0,04% | 2,3 | ~660 / 2.633 |
| Akzara | @akzarawellnesscenter | 4.071 | 163 | 0,23% | 9,0 | ~3.300 / **1.700.000** |
| **Diamond Spa** | **@diamondmassagesmed** | **2.290** | 101 | **2,78%** | **61,8** | **~2.000 / 180.000** |
| DoSpa (hombres) | @dospa_formen | 957 | 26 | 2,64% | 24,8 | ~1.950 / 4.608 |
| Des Spa (hombres) | @desspa.masajes | 402 | 32 | — | — | ~4.400 / 22.500 |
| Urban Men Spa | @urbanmenspa | 307 | 19 | — | — | ~1.340 / 2.240 |
| Prestige (posible) | @prestige_spa_massage | 1.213 | 3 | — | — | 10.400 / 13.000 |
| DM Spa (posible) | @dmmcol | 266 | 10 | — | — | — |
| Om Spa For Men | — | — | — | — | — | La cuenta que enlaza su web no existe |

*Interacción = (likes + comentarios) / seguidores, según Social Blade.*

### 9.2 TikTok
| Marca | Cuenta | Seguidores | Likes totales | Vistas de los últimos videos (mediana / máx.) |
|---|---|---|---|---|
| Enigma Spa By EM | @enigmaspabyem | **26.700** | 71.200 | ~720 / 3.092 |
| DoSpa (hombres) | @dospaexclusivemen | 797 | 1.476 | ~750 / 37.900 |
| **Diamond Spa** | **@diamond.spa95** | 233 | 2.660 | **~1.400 / 221.400** |
| Om Spa For Men | @masajesenmedellin | 239 | 534 | ~660 / 778 |

### 9.3 Lectura
- **Somos los de mejor interacción y alcance por publicación.** Nuestra mediana de vistas en Instagram (~2.000) está al nivel de cuentas 5 a 10 veces más grandes, y tenemos un reel de 180K y un TikTok de 221K.
- **Las cuentas grandes tienen interacción muy baja** (0,03–0,15%): muchos seguidores, poca actividad real.
- **Akzara demuestra que un reel viral escala:** 1,7M y 454K vistas con solo 4K seguidores.
- **En TikTok, la competencia de hombres es débil** (Om 239 seguidores, DoSpa 797). Es un canal que podemos dominar.
- **Lo que falta:** convertir el alcance en seguidores (llamado a seguir, series, constancia) y llevar tráfico a la web (enlace a `/es/masajes-para-hombres` y a reservas en la bio y en los reels).

### 9.4 Acciones en redes
1. Publicar 3–4 reels por semana repitiendo los formatos que ya funcionaron (los de 180K y 221K).
2. Serie «Masajes para hombres en Medellín» con la keyword en el texto y en los hashtags, para que también la encuentre Google.
3. Fijar en el perfil los 3 reels con más vistas, con llamado a reservar.
4. Enlace en la bio a una página de enlaces con UTM, para medir en Vercel cuánto tráfico llega de Instagram y TikTok.
5. Pedir reseña de Google a quien llega por redes.

---

## 10. Prioridades (orden recomendado)

1. **Páginas «[masaje] para hombres en Medellín»** (5 páginas). Es la brecha más clara frente a DM Spa y Spa 5 Elementos, en el grupo de búsquedas que más convierte.
2. **Artículo «Spa para hombres en Medellín»** con la frase exacta en URL, título y H1.
3. **Landing «Spa para parejas en Medellín»** y **página permanente de tarjetas de regalo**.
4. **«precios» en los títulos** y una lista de precios con año.
5. **Reseñas** en Maps (meta: 300 o más) y **enlaces externos**.
6. **Constancia en redes** (reels) aprovechando que ya tenemos la mejor interacción.
7. **Membresías, despedidas y empresas**, si el negocio quiere esas líneas.

---

## 11. Sitemaps: qué publica cada competidor frente a nosotros

**Captura:** 20 de noviembre de 2026. Sitemaps completos (índice + subsitemaps) de 13 sitios, 1.267 URLs.
**Datos:** `sitemaps_competencia.csv` (cada URL con su fecha de actualización) y `sitemaps_clasificados.json` (URLs por tipo).
**Sin sitemap o caídos:** Aqualuna (error 502), Le Spa Noir (no responde) y Cima Spa (sitemap vacío).

### 11.1 Tamaño y tipo de páginas
Las URLs se clasificaron por palabras de la dirección. Una URL puede caer en varios tipos, e «inglés» cuenta las versiones /en/.

| Sitio | URLs | En inglés | Masajes | Días de spa / rituales | Hombres | Mujeres | Parejas | Ocasiones | Regalos | Membresías | Promos | Blog | Tienda |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Spa 5 Elementos | **312** | 156 | 64 | **84** | **30** | 48 | **56** | **38** | 16 | 3 | 4 | 0 | — |
| Amatsu | 235 | 74 | 55 | 33 | 6 | 4 | 7 | 9 | 1 | 2 | 2 | **95 posts** | — |
| Akzara | 192 | 96 | 40 | **86** | 2 | 4 | 10 | **24** | 0 | **8** | **8** | 8 | — |
| **Diamond Spa** | **105** | 53 | 32 | 2 | 5 | 6 | 2 | 16 | 0 | 0 | 0 | 14 | — |
| Viva Spa | 86 | 0 | 15 | 3 | 1 | 1 | 4 | 5 | 2 | 0 | 0 | 28 posts | — |
| Ivy Wellness | 84 | 0 | 33 | 0 | 0 | 3 | 2 | 0 | 0 | 0 | 0 | **35** | — |
| Spazio di Vita | 78 | 0 | 7 | 11 | 0 | 1 | 9 | **19** | 6 | 1 | 2 | 17 posts | 26 productos |
| Genesis Massage | 57 | 0 | 11 | 6 | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 14 posts | — |
| Om Spa For Men | 49 | 0 | 16 | 4 | 4 | 0 | 0 | 2 | 3 | 0 | 2 | 6 posts | **26 productos** |
| Celestino | 31 | ~15 | 8 | 2 | 0 | 0 | 2 | 0 | 2 | 2 | 1 | 0 | — |
| DM Spa | 22 | 0 | 18 | 0 | 16 en títulos | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 16 productos |
| DoSpa | 13 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| Prestige | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |

**En español tenemos unas 52 URLs:** 14 de servicios, 8 tipos de masaje, 8 fechas especiales, 7 artículos y unas 15 landings. Spa 5 Elementos tiene ~156 en español, Amatsu ~160 y Akzara ~96.

### 11.2 Qué hace cada uno (según su sitemap)
- **Spa 5 Elementos: un catálogo de planes.** Cada plan es una URL propia (`/medellin/5-dias-de-spa-para-parejas/52-always-together.htm`), separada por público: 30 URLs de hombres, 48 de mujeres y 56 de parejas. Tiene planes para amigas y grupos («spa super amigas», «brunch glow squad», «birthday besties ritual»), 6 fechas especiales, bonos de regalo, membresía y política de puntos.
- **Akzara: rituales, ocasiones y promociones.** 86 URLs de rituales y paquetes; cumpleaños en 3 versiones (2 h, 3 h, luxury), despedida de soltera, bienestar corporativo, spa de amigas, mamá y papá. Además, 8 promociones (2x1, Cyber Week) y 8 membresías (Aqua 1 mes, Plata 3 meses). **Es el más activo:** actualizó 22 URLs en octubre.
- **Amatsu: el blog como motor.** 95 artículos desde 2021, con varios nuevos cada mes. También cubre ocasiones desde el blog: «ideas de spa para despedida de soltera», «spa para amigas Medellín», «promociones del Día del Padre», «spa para hombres Medellín».
- **Ivy Wellness: blog y bienestar.** 35 artículos, incluido «¿Buscas los 10 mejores spa de Medellín?». Amplía con sauna infrarrojo, baño de hielo, fisioterapia y quiropraxia. Actualizó 59 URLs en noviembre.
- **Spazio di Vita: tienda por ocasión.** Productos como «spa para parejas Medellín», «spa para amigas», «spa familiar», «spa niños», «spa de cumpleaños», «despedida de soltera», «ritual navideño» y «bono regalo Día de la Madre».
- **Om Spa For Men: tienda WooCommerce estática.** 26 productos (cada servicio y cada zona de depilación es un producto) y 6 artículos. Solo 3 URLs actualizadas en 2026: gana por antigüedad y por la marca, no por publicar.
- **DM Spa: sitio nuevo, pero rankea.** Sus 22 URLs se publicaron el 1 de julio de 2026 y ya está #2–6 en hombres. **Esto confirma que la fórmula «[masaje] para Hombres en Medellín», junto con un dominio con la keyword, posiciona rápido aunque el sitio sea nuevo.**
- **Celestino:** 31 URLs, todas actualizadas el 13 de noviembre (relanzamiento reciente). Cada página tiene su par en inglés.
- **Viva Spa:** 28 artículos y un sitio desde 2016; su última tanda grande fue en mayo de 2026.
- **Genesis Massage:** contenido tántrico y erótico, con páginas de plantilla olvidadas en el sitemap («sample-page», «portfolio»).

### 11.3 Nuestro sitemap
- Incluye todas nuestras páginas públicas, incluida `/masajes-a-domicilio`. Solo quedan fuera `/book`, `/press`, `/privacy` y `/terms`; de esas, `/press` podría entrar.
- **Problema:** 93 de las 105 URLs llevan como `lastmod` la fecha del último deploy (`DEPLOYED_AT` en `src/app/sitemap.ts`). En cada despliegue le decimos a Google que todas las páginas cambiaron, y cuando eso pasa siempre, Google deja de confiar en la fecha. Lo correcto es poner la fecha real del último cambio del contenido de cada página. Solo los artículos lo hacen bien (usan `publishedAt`).

### 11.4 Qué nos falta según los sitemaps
| Tipo de página | Ellos | Nosotros |
|---|---|---|
| Planes o paquetes con URL propia | Spa 5 Elementos 84, Akzara 86, Spazio 11 | 1 (`/dia-de-spa`) |
| Planes de parejas | Spa 5 Elementos 56, Akzara 10, Spazio 9 | 1 (`/masajes/duo`) |
| Amigas, cumpleaños, despedidas, familia, empresas | Akzara, Spa 5 Elementos, Spazio, Amatsu (blog) | 0 |
| Fechas especiales | Spa 5 Elementos, Akzara, Spazio | ✅ 8 (estamos bien) |
| Membresías y puntos | Akzara 8, Spa 5 Elementos 3, Celestino | 0 |
| Página de bonos o tarjetas de regalo | Spa 5 Elementos, Viva, Celestino, Spazio | 0 (solo por fecha) |
| Promociones con URL (2x1, Cyber Week) | Akzara 8, Spazio | 0 |
| Volumen de blog | Amatsu 95, Ivy 35, Viva 28 | 14 (7 en español) |
| «[masaje] para hombres» | DM Spa 16, Spa 5 Elementos 30 | 5 |
| Ritmo de publicación | Akzara y Ivy publican cada mes | Por tandas |

### 11.5 Acciones que salen de los sitemaps
1. **Corregir el `lastmod`** del sitemap para usar la fecha real de cada página. Es barato y le devuelve a Google una señal fiable.
2. **Un catálogo de planes con URL propia** (parejas, amigas, cumpleaños, hombres), cada uno con su precio. Así compiten Spa 5 Elementos y Akzara, con 84–86 URLs.
3. **Ocasiones permanentes** (no solo fechas del calendario): despedida de soltera, cumpleaños, spa con amigas y empresas.
4. **Bonos de regalo y membresías** con página propia.
5. **Ritmo de blog:** 2–4 artículos al mes (Amatsu lleva 5 años así), empezando por los temas que ya les funcionan a ellos: «spa para hombres en Medellín», «¿cuál es el mejor spa de Medellín?», «ideas de spa para despedida de soltera» y «spa para amigas en Medellín».
