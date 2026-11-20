# Informe de competencia — Diamond Spa (diamondspa.com.co)

**Fecha de la captura:** 19 de noviembre de 2026
**Datos en bruto:** `competencia.json` y los CSV de esta carpeta (se regeneran con `python3 data/competencia/build.py`).

---

## 1. Resumen ejecutivo

- **Nuestras páginas no son el problema.** La landing de hombres es la más completa del grupo en texto y datos estructurados, y aun así no entra en el top 10 orgánico de ninguna búsqueda de hombres.
- **Perdemos por factores externos al sitio:** antigüedad del dominio (unos 7 meses frente a hasta 10 años), enlaces externos y número de reseñas en Google Maps.
- **Dependemos de la marca y del mapa.** La marca da el 42% de los clics orgánicos visibles. En «spa para hombres medellin» salimos #1 en el mapa, pero en las búsquedas generales («spa medellin», «masajes el poblado», «massage medellin») no aparecemos ni en el orgánico ni en el mapa.
- **Clics orgánicos estancados:** desde agosto se mantienen en unos 220 cada 17 días, aunque las impresiones se duplicaron. El CTR bajó de 5,4% a 3,1% y la posición media pasó de 7,3 a 9,6.
- **En Google Ads** tenemos el 21% de cuota de impresiones, por detrás de Aqualuna (31%) y Spa 5 Elementos (31%). Pagamos por nuestra propia marca y por términos que no tienen que ver con el negocio.

---

## 2. Metodología y fuentes

| Fuente | Periodo | Qué se tomó |
|---|---|---|
| Búsqueda en Google (Colombia, `hl=es`, `pws=0`) | 19 nov 2026 | Top 10 orgánico de 24 keywords |
| Vista «Lugares» de Google (mapa) | 19 nov 2026 | Top 10 del mapa y reseñas para 4 keywords |
| Google Search Console | 19 ago – 17 nov 2026 | Clics, impresiones, CTR y posición por keyword y por página |
| Google Ads | 20 oct – 18 nov 2026 | Keywords, términos de búsqueda y subastas (Auction insights) |
| Vercel Web Analytics | abr – nov 2026 | Visitantes, páginas vistas y fuentes de tráfico |
| Webs de la competencia (HTML de la portada) | 19 nov 2026 | Contenido de página, datos estructurados e imágenes |
| web.archive.org | — | Primera copia archivada de cada dominio, como aproximación a su antigüedad |

**Limitaciones:**
- Las búsquedas se hicieron desde el Chrome del dueño del negocio, así que los resultados pueden estar algo personalizados por ubicación y sesión. Es una foto de un solo día.
- Search Console solo muestra la consulta en una parte de los clics (506 de unos 1.170 en 3 meses). El resto está anonimizado.
- No se midieron los enlaces externos de cada sitio: hace falta una herramienta de pago (Ahrefs o Semrush).

---

## 3. Cómo estamos hoy

### 3.1 Tráfico (Vercel Web Analytics)

| Mes | Visitantes | Páginas vistas | Rebote | Visitantes desde Google | Visitantes desde Instagram |
|---|---|---|---|---|---|
| Abril (desde el 9) | 238 | 983 | 46% | 47 | 1 |
| Mayo | 966 | 3.060 | 39% | 203 | 421 |
| Junio | 1.543 | 4.603 | 46% | 228 | 952 |
| Julio | 1.437 | 4.137 | 50% | 656 | 197 |
| Agosto | 1.815 | 4.732 | 54% | 987 | 108 |
| Septiembre | 1.888 | 6.094 | 47% | 913 | 115 |
| Octubre | 2.428 | 7.178 | 50% | 1.055 | 171 |
| Noviembre (1–19) | 1.546 | 4.369 | 50% | 662 | 126 |

Noviembre va al mismo ritmo que octubre (unos 81 visitantes al día) y un 63% por encima del promedio de mayo a septiembre.

### 3.2 Search Console por mes (días 1–17 de cada mes)

| Mes | Clics | Impresiones | CTR (mes completo) | Posición media (mes completo) |
|---|---|---|---|---|
| Mayo | 99 | 1.037 | — | 7,2 |
| Junio | 119 | 1.815 | — | 8,1 |
| Julio | 172 | 3.024 | — | 8,3 |
| Agosto | 220 | 3.538 | 5,4% | 8,4 |
| Septiembre | 228 | 4.386 | 4,5% | 7,3 |
| Octubre | 218 | 5.684 | 3,5% | 9,1 |
| Noviembre | 215 | 7.034 | 3,1% | 9,6 |

### 3.3 Keywords con más clics (19 ago – 17 nov)

| Keyword | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| diamond spa | 82 | 480 | 17,1% | 2,7 |
| diamond spa medellin | 76 | 166 | 45,8% | 2,3 |
| diamante spa medellin | 30 | 163 | 18,4% | 1,9 |
| spa medellin | 17 | 817 | 2,1% | 12,0 |
| spa for men medellin | 15 | 153 | 9,8% | 3,4 |
| masajes medellín para hombres | 13 | 259 | 5,0% | 8,0 |
| spa para hombres medellin | 12 | 268 | 4,5% | 6,1 |
| massage near me | 10 | 795 | 1,3% | 9,1 |
| masajes para hombres medellin | 9 | 242 | 3,7% | 7,5 |
| massage in medellin | 9 | 35 | 25,7% | 18,7 |
| masajes poblado | 8 | 133 | 6,0% | 6,6 |
| tipos de masajes | 4 | 759 | 0,5% | 8,8 |

- **Por grupos:** la marca da 215 clics (42% de lo visible) y las búsquedas de hombres, 110 (22%).
- **Hay tráfico de intención erótica** («spa eroticos medellin», «masajes eroticos medellin», «spa erotico para hombres»). No es un público al que valga la pena apuntar.

### 3.4 Canibalización: varias URLs nuestras compiten por las mismas búsquedas

**Búsquedas de hombres** (posición media / clics, 3 meses):

| Keyword | `/` (raíz) | `/es` | `/es/masajes-para-hombres` |
|---|---|---|---|
| spa para hombres medellin | **3,5 / 7** | 8,9 / 3 | 10,3 / 2 |
| masajes medellín para hombres | **5,4 / 4** | 8,8 / 5 | 11,6 / 3 |
| masajes para hombres medellin | **6,2 / 2** | 7,1 / 4 | 11,1 / 3 |
| spa para hombres | **5,0 / 3** | 9,1 / 4 | — |

La raíz `/` redirige a `/es`. Su buena posición sale del enlace «Sitio web» de la ficha de Google Maps (el paquete de mapas), no del resultado orgánico.

**Búsquedas con «poblado»** (último mes): la portada `/es` está en la posición 8,0 con 326 impresiones, por delante de `/es/spa-el-poblado` (17,5 con 145 impresiones).

---

## 4. Posiciones en Google (24 keywords)

`DS` = diamondspa.com.co. Si no aparece, no estamos en el top 10.

### 4.1 Marca
| Keyword | Nuestra posición | Otros en el top 10 |
|---|---|---|
| diamond spa | **1** (además 4, 5, 6 y 7 con otras páginas) | Instagram (nuestro), Tripadvisor |
| diamond spa medellin | **1** (además 3, 5 y 6) | Instagram (nuestro), Tripadvisor |

En «diamond spa» aparece **nuestro propio anuncio** por encima del resultado orgánico. Muestra «111 reseñas» y «130 reseñas»; el número real es 147.

### 4.2 Hombres (no aparecemos en ninguna)
| Keyword | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| spa para hombres medellin | omspaformen | dmspaparahombres | Instagram (Baron Signature) | prestigespamedellin | agendapro |
| spa for men medellin | omspaformen | prestigespamedellin | Instagram | luxuryblackspamedellin | Tripadvisor |
| masajes para hombres medellin | omspaformen | prestigespamedellin | luxuryblackspamedellin | dmspaparahombres | Instagram |
| masajes medellin para hombres | omspaformen | prestigespamedellin | luxuryblackspamedellin | Instagram | MercadoLibre |
| spa para hombres | omspaformen | dmspaparahombres | Instagram | spa5elementos | dospa |
| spa hombres medellin | omspaformen | prestigespamedellin | Instagram | dmspaparahombres | spa5elementos |
| sala de masajes para hombres medellin | omspaformen | luxuryblackspamedellin | prestigespamedellin | dmspaparahombres | Instagram |

### 4.3 Spa y masajes en general
| Keyword | Nuestra posición | Top 3 |
|---|---|---|
| spa medellin | — | Tripadvisor, celestinospa, spaziodivita |
| massage medellin | — | akzaraspa, Tripadvisor, Instagram |
| massage in medellin | 6 (`/en/massage-medellin`) | Tripadvisor, celestinospa, Reddit |
| medellin massage | 7 (`/en/massage-medellin`) | Tripadvisor, akzaraspa, celestinospa |
| masajes medellin | — | celestinospa, Tripadvisor, amatsuspa |
| dia de spa medellin | — | akzaraspa, Instagram, celestinospa |
| masajes relajantes medellin | — | vivaspapoblado, celestinospa, amatsuspa |
| spa near me medellin | — | Tripadvisor, celestinospa, Fresha |
| masajistas medellin | — | celestinospa, omspaformen, vivaspapoblado |

### 4.4 El Poblado
| Keyword | Nuestra posición | Top 3 |
|---|---|---|
| spa el poblado | 9 (`/es`) | vivaspapoblado, clinica-antienvejecimiento, celestinospa |
| spa poblado | 8 (`/es`) | vivaspapoblado, clinica-antienvejecimiento, celestinospa |
| masajes poblado | 6 (`/es/spa-el-poblado`) | celestinospa, clinica-antienvejecimiento, vivaspapoblado |
| masajes el poblado | 4 (`/es/spa-el-poblado`) | celestinospa, vivaspapoblado, clinica-antienvejecimiento |

### 4.5 Servicios
| Keyword | Nuestra posición | Top 3 |
|---|---|---|
| depilacion hombres medellin | — | terapiasderelajacionmedellin, agendapro, miadermatologia |
| limpieza facial medellin | — | medipiel, naturalness, vivaspapoblado |

### 4.6 Quién aparece más (en las 24 búsquedas)
| Dominio | Veces en el top 10 | Veces en el top 3 | Posición media | Donde es fuerte |
|---|---|---|---|---|
| tripadvisor.co | 23 | 7 | 4,8 | General, El Poblado |
| instagram.com | 22 | 8 | 4,5 | Todo |
| **diamondspa.com.co** | 15 | 3 | 5,2 | Marca, El Poblado |
| **celestinospa.com** | 14 | **12** | **2,6** | General, El Poblado |
| vivaspapoblado.com | 10 | 7 | 3,5 | El Poblado, general |
| **omspaformen.net** | 9 | 8 | **2,0** | **Hombres (7/7)** |
| fresha.com | 8 | 1 | 6,8 | General |
| prestigespamedellin.com | 7 | 5 | 3,1 | Hombres |
| clinica-antienvejecimiento.com | 7 | 4 | 4,9 | El Poblado |
| amatsuspa.com | 7 | 2 | 4,9 | General |
| hefy.co | 7 | 0 | 6,0 | General |
| dmspaparahombres.com | 6 | 2 | 3,7 | Hombres |
| akzaraspa.com | 6 | 3 | 4,2 | General |
| luxuryblackspamedellin.com | 6 | 3 | 4,3 | Hombres |
| dospa.co | 6 | 0 | 6,8 | Hombres |

---

## 5. Google Maps (paquete de mapas)

| Keyword | Nuestra posición en el mapa | Top del mapa (reseñas) |
|---|---|---|
| spa para hombres medellin | **#1** (tras el anuncio de Eclat) · 4,9 (147) | Prestige 4,9 (229), Des Spa 5,0 (108), Black Spa 4,9 (329), Enigma 4,8 (366), Om Spa 4,3 (138), Sixth Sense 4,9 (70), DM Spa 4,6 (55) |
| spa medellin | **No aparecemos** | Cima 4,9 (42), Celestino 4,9 (522), Aqualuna Provenza 5,0 (556), Le Spa Noir 4,9 (569), Landmark 5,0 (190), Joya 4,8 (307), Aqualuna Laureles 4,9 (774), S&H 5,0 (359), Wellcomm 4,9 (372) |
| masajes el poblado | **No aparecemos** | Celestino 4,9 (522), S&H 5,0 (359), Blue Rose 4,7 (118), Prestige 4,9 (229), Soul Spa 4,7 (122), Okuma 4,9 (459), Enigma 4,8 (366), Viva Spa 4,6 (379) |
| massage medellin | **No aparecemos** | S&H 5,0 (359), Blue Rose 5,0 (45), Prestige 4,9 (229), Haruka, Mobile Massage, Bendito Masaje, Enigma 4,8 (366), Okuma 4,9 (459) |

- **En hombres,** 147 reseñas alcanzan para salir primeros.
- **En búsquedas generales,** el top del mapa tiene **entre 190 y 774 reseñas**.
- **Eclat massage** paga un anuncio en el mapa en casi todas estas búsquedas.

---

## 6. Google Ads (últimos 30 días)

### 6.1 Subastas: contra quién compiten nuestros anuncios
| Dominio | Cuota de impresiones | Superposición | Sale por encima de nosotros | Arriba de la página | Primera posición absoluta |
|---|---|---|---|---|---|
| aqualunaspa.com.co | **30,97%** | 26,86% | 47,98% | 84,41% | 37,84% |
| spa5elementos.com.co | **30,53%** | 20,85% | 56,51% | 89,68% | 31,50% |
| **Diamond Spa (nosotros)** | **21,22%** | — | — | 77,81% | 30,10% |
| ivywellnesscenter.co | 15,05% | 11,26% | 60,24% | 82,32% | 33,85% |
| vivaspapoblado.com | 13,62% | 13,24% | 39,82% | 81,10% | 13,19% |
| genesismassagemedellin.com | 13,33% | 17,29% | 51,46% | 78,74% | 19,90% |
| vivaspamedellin.com | 10,85% | 5,79% | 44,82% | 74,35% | 12,35% |
| altospa.com.co | <10% | 7,62% | 34,86% | 53,35% | 8,57% |
| imperiospamde.com | <10% | 5,14% | 57,36% | 82,62% | 33,77% |
| cimaspa.health | <10% | 5,31% | 45,99% | 75,43% | 22,86% |
| spaeden.pro | <10% | 9,44% | 45,59% | 67,89% | 13,79% |
| nirvanaspacolombia.com | <10% | 3,72% | 51,04% | 77,63% | 20,01% |
| celestinospa.com | <10% | 6,10% | 39,05% | 74,03% | 16,12% |
| cleopatraluxuryspa.com | <10% | 8,22% | 44,10% | 70,94% | 12,32% |
| relaxathomemasajes.com | <10% | 10,10% | 62,57% | 89,85% | 53,65% |
| spamanosdesedamm.com | <10% | 2,15% | 43,24% | 67,18% | 10,94% |

### 6.2 Keywords de Ads
| Keyword | Campaña | Clics | Impresiones | CPC (COP) | Costo (COP) | Conversiones | Costo por conversión |
|---|---|---|---|---|---|---|---|
| massage medellin | EN | 528 | 5.307 | 3.060 | 1.615.587 | 16,5 | ~97.900 |
| masajes para hombres | ES | 144 | 1.328 | 1.350 | 194.411 | 6 | **~32.400** |
| spa hombres | ES | 103 | 1.088 | 1.032 | 106.278 | 1 | 106.278 |
| spa for men medellin | EN | 103 | 1.070 | 2.700 | 278.089 | 1,5 | ~185.400 |
| spa para hombres medellin | ES | 57 | 708 | 1.885 | 107.447 | 2 | ~53.700 |
| masajes para hombres cerca de mi | ES | 34 | 442 | 1.444 | 49.101 | 1 | 49.101 |
| massage medellín | EN | 31 | 517 | 1.767 | 54.786 | 0 | — |
| masajes medellin para hombres | ES | 29 | 290 | 2.064 | 59.853 | 1 | 59.853 |
| massage therapy medellin | EN | 27 | 512 | 2.178 | 58.800 | 1 | 58.800 |
| spa para hombres | ES | 20 | 300 | 1.598 | 31.954 | 0 | — |
| massage el poblado medellin | EN | 17 | 303 | 2.212 | 37.599 | 0 | — |

**Total de las 22 keywords:** unos COP 2,76M y unas 31 conversiones (≈ COP 89.000 por conversión).

### 6.3 Términos de búsqueda que vale la pena revisar
- **Marca pagada:** «diamond spa» (23 clics, COP 32.260) y «diamond spa medellin» (11 clics, COP 17.151). Esas búsquedas ya las ganamos en orgánico.
- **Sin relación con el negocio:** «despedida soltera spa» (COP 13.075), «daily full body massage» (COP 10.248), «wellness massage services» (COP 8.544).
- **«massage near me»:** 115 clics, COP 239.136 y 3 conversiones. Es el término con más volumen.

---

## 7. Fichas de los competidores principales

### Om Spa For Men — omspaformen.net
- **Dónde gana:** #1 orgánico en las 7 búsquedas de hombres y #2 en «masajistas medellin». En el mapa: 4,3 (138 reseñas).
- **Antigüedad:** archivado desde 2016 (unos 10 años).
- **Portada:** 3.109 palabras, 22 H2, **122 imágenes**. Título: «Spa para hombres en Medellín - Om Spa For Men».
- **Diferenciales:** «15 años de experiencia», galería **«escoge tu masajista»**, masajes a domicilio, membresía, «Día especial», blog de turismo en Medellín.
- **Datos estructurados:** básicos (Organization, WebSite, Breadcrumb); no muestra estrellas en Google.

### Prestige Spa For Men — prestigespamedellin.com
- **Dónde gana:** #2–3 orgánico en hombres y en el mapa con 4,9 (229).
- **Portada:** solo **499 palabras**, 2 H2 y casi sin datos estructurados.
- **Por qué rankea:** el nombre de la ficha de Maps lleva keywords («Spa For Men Prestige / Massage Medellin»), tiene 229 reseñas y el título usa la keyword exacta en español e inglés.

### DM Spa para Hombres — dmspaparahombres.com
- **Dónde gana:** #2–6 orgánico en hombres. En el mapa: 4,6 (55).
- **Portada:** 1.227 palabras, preguntas frecuentes y experiencias «reservadas».
- **Diferencial:** el dominio contiene la keyword exacta «spa para hombres».
- **Ojo:** su sección «a domicilio» ofrece masajes eróticos y tántricos. No es un modelo de contenido para nosotros.

### Luxury Black Spa — luxuryblackspamedellin.com
- Aparece #2–8 en hombres, pero **el dominio redirige a un sitio de apuestas**. Seguramente lo hackearon o caducó, y Google lo terminará bajando. Ese lugar va a quedar libre.
- Su ficha de Maps («Black Spa - Masajes para hombres Medellin») tiene 4,9 (329).

### Celestino Spa — celestinospa.com
- **Dónde gana:** está en 14 de las 24 búsquedas, 12 veces en el top 3. Es el líder en búsquedas generales y de El Poblado, y en el mapa tiene 4,9 (522).
- **Antigüedad:** archivado desde 2023.
- **Portada:** 1.178 palabras. Título: «Spa de Masajes en Medellín — Sauna y Cold Plunge».
- **Diferenciales:** **sauna, jacuzzi y cold plunge en el rooftop**, tarjetas de regalo, precios visibles, opiniones y preguntas frecuentes.
- **Datos estructurados:** DaySpa, FAQPage y Breadcrumb. También compite en Ads, con menos del 10% de cuota.

### Viva Spa Poblado — vivaspapoblado.com
- **Dónde gana:** #1 en «spa el poblado» y «spa poblado», y en el top 3 de varias búsquedas generales. En el mapa: 4,6 (379).
- **Antigüedad:** archivado desde 2016.
- **Portada:** 1.322 palabras, 79 imágenes y **134 enlaces internos** organizados por categorías.
- **En Ads:** 13,6% de cuota.

### Aqualuna Spa — aqualunaspa.com.co
- **Líder en Ads,** con 31% de cuota y 48% de las veces por encima de nosotros.
- En el mapa: Provenza 5,0 (556) y Laureles 4,9 (774). Vende «días de spa».

### Spa 5 Elementos — spa5elementos.com.co
- **Co-líder en Ads,** con 30,5% de cuota y 56,5% de las veces por encima de nosotros. Su anuncio dice «Spa Para Hombres En Medellín».
- **En orgánico:** #4–7 en hombres.

### Otros a vigilar
- **akzaraspa.com:** #1 en «massage medellin» y «dia de spa medellin».
- **amatsuspa.com:** presente en 7 búsquedas generales; en el mapa, 4,7 (361).
- **Massage poblado S&H:** #1 del mapa en «massage medellin», con 5,0 (359).
- **Eclat massage:** paga anuncios en el mapa en todas las búsquedas clave.
- **Ivy Wellness Center:** 15% de cuota en Ads.

---

## 8. Comparación de contenido de página

| Sitio | Datos desde | Palabras | H2 | Imágenes | Datos estructurados | Estrellas en Google |
|---|---|---|---|---|---|---|
| omspaformen.net | 2016 | 3.109 | 22 | 122 | Organization, WebSite | No |
| prestigespamedellin.com | ? | 499 | 2 | 13 | WebSite | No |
| dmspaparahombres.com | ? | 1.227 | 7 | 8 | Organization, Place | No |
| celestinospa.com | 2023 | 1.178 | 9 | 14 | DaySpa, FAQPage | No |
| vivaspapoblado.com | 2016 | 1.322 | 23 | 79 | DaySpa, Organization | No |
| **diamondspa `/es/masajes-para-hombres`** | **2026** | **2.782** | 5 | **7** | **DaySpa, FAQPage, AggregateRating, OfferCatalog** | **Sí (4,9 · 147)** |
| **diamondspa `/es`** | 2026 | 1.726 | 11 | 20 | Igual que arriba | Sí |
| **diamondspa `/es/spa-el-poblado`** | 2026 | 1.842 | 11 | 17 | Igual + Breadcrumb | Sí |

**Lo que tenemos y ellos no:** estrellas en Google gracias a los datos estructurados, contenido en dos idiomas bien enlazado (8 enlaces hreflang por página), una página para cada servicio y un sitio técnicamente limpio (redirecciones, canónicos y sitemap correctos).

**Lo que ellos tienen y nosotros no:**
1. **Antigüedad y enlaces externos acumulados:** Om y Viva llevan unos 10 años; nosotros, unos 7 meses.
2. **Más reseñas en Maps** en las búsquedas generales (300–770 frente a 147).
3. **Fotos de las terapeutas** («escoge tu masajista»): Om tiene 122 imágenes y nuestra landing de hombres, 7.
4. **Instalaciones diferenciales** (sauna, jacuzzi y cold plunge en Celestino).
5. **Tarjetas de regalo y membresías** visibles en la web (Celestino y Om).
6. **Dominio con la keyword exacta** (DM Spa).
7. **Mayor inversión en Ads** (Aqualuna y Spa 5 Elementos).

---

## 9. Dónde perdemos y contra quién

| Grupo de búsquedas | Orgánico | Mapa | Ads | Competidores principales |
|---|---|---|---|---|
| Marca | ✅ #1 | ✅ | Pagamos por nuestra propia marca | — |
| Hombres | ❌ fuera del top 10 | ✅ #1 | 2ª–3ª posición en las subastas | Om Spa, Prestige, DM Spa, Black Spa, Spa 5 Elementos |
| Spa y masajes en general | ⚠️ solo 2 de 9 (en inglés, posición 6–7) | ❌ | Por detrás de Aqualuna | Celestino, Akzara, Amatsu, Tripadvisor, Aqualuna |
| El Poblado | ⚠️ posición 4–9 | ❌ | — | Viva Spa Poblado, Celestino, Clínica Antienvejecimiento |
| Servicios (depilación, faciales) | ❌ | — | — | Medipiel, Naturalness, Viva Spa |

---

## 10. Plan de acción recomendado

### Inmediato (esta semana)
1. **Anuncios de Ads:** corregir el número de reseñas (111 y 130 → 147).
2. **Ads, marca y términos sin relación:** decidir si mantener la campaña de marca y excluir como negativas «despedida soltera», «daily full body massage» y «wellness massage services».
3. **Ads, presupuesto:** subir puja o presupuesto en «masajes para hombres» (unos COP 32.000 por conversión) y revisar «spa for men medellin» (unos COP 185.000 por conversión) y «spa hombres» (1 conversión en 103 clics).

### Corto plazo (1–2 meses)
4. **Reseñas:** pedir reseña a cada cliente con el enlace y el QR del perfil de Google. Meta: 300 o más para competir en el mapa de búsquedas generales.
5. **Categorías del perfil de Google:** agregar «Spa de masajes» o «Masajista» como secundarias si hoy solo está «Spa».
6. **Landing de hombres:** añadir una sección de terapeutas con fotos («escoge tu masajista») y más fotos reales del lugar.
7. **Canibalización:** reforzar los enlaces internos con el texto exacto hacia `/es/masajes-para-hombres` y `/es/spa-el-poblado`.

### Mediano plazo (3–6 meses)
8. **Enlaces externos:** Tripadvisor (aparece en 23 de 24 búsquedas), Fresha, Doctoralia, Páginas Amarillas, alianzas con hoteles y hostales de El Poblado, y prensa o blogs de turismo.
9. **Tarjetas de regalo y membresía** visibles en la web, como hacen Celestino y Om.
10. **Masajes a domicilio:** ya publicado en `/masajes-a-domicilio` (19 nov 2026). Hacer seguimiento de cómo rankea.
11. **Vigilar a Luxury Black Spa:** su dominio redirige a apuestas, y la posición que deje libre en hombres es una oportunidad.

---

## 11. Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `competencia.json` | Todo en un solo archivo |
| `serp_organico.csv` | Top 10 orgánico por keyword |
| `resumen_competidores.csv` | Agregado por dominio |
| `paquete_local.csv` | Mapa de Google con reseñas |
| `ads_auction_insights.csv` | Subastas de Google Ads |
| `build.py` | Datos capturados y script que regenera los archivos |
| `INFORME_COMPETENCIA.md` | Este informe |
