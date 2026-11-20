"""Base de datos de competencia SEO/SEM de Diamond Spa.

Captura del 2026-11-19 desde el Chrome del dueño (Google Colombia, hl=es, pws=0):
- serp: top 10 orgánico por keyword ("DS" = diamondspa.com.co).
- local: paquete de mapas (vista Lugares) de 4 keywords clave.
- ads_keywords / ads_search_terms / auction_insights: Google Ads, últimos 30 días
  (20 oct – 18 nov 2026). Costos en COP.
- gsc: Search Console, 19 ago – 17 nov 2026 (clics, impresiones, posición media).

Ejecuta `python3 data/competencia/build.py` para regenerar los JSON y CSV.
"""
import csv, json, pathlib, collections

HERE = pathlib.Path(__file__).parent
FECHA = "2026-11-19"

# Grupo: marca | hombres | general | poblado | servicio
SERP = {
    "diamond spa": ("marca", "DS/es,instagram:diamondmassagesmed,tripadvisor.co,DS/en/location,DS/en/massage-medellin,DS/en/masajes-para-hombres,DS/en/masajes/sports"),
    "diamond spa medellin": ("marca", "DS/es,instagram:diamondmassagesmed,DS/en/massage-medellin,tripadvisor.co,DS/en/masajes,DS/en/masajes/sports"),
    "spa para hombres medellin": ("hombres", "omspaformen.net,dmspaparahombres.com,instagram:baronsignature.spa,prestigespamedellin.com,agendapro.com,spa5elementos.com.co,dospa.co,luxuryblackspamedellin.com,tripadvisor.co"),
    "spa for men medellin": ("hombres", "omspaformen.net,prestigespamedellin.com,instagram,luxuryblackspamedellin.com,tripadvisor.co,spasixthsense.com,tripadvisor.co,dospa.co"),
    "masajes para hombres medellin": ("hombres", "omspaformen.net,prestigespamedellin.com,luxuryblackspamedellin.com,dmspaparahombres.com,instagram,spa5elementos.com.co,dospa.co,celestinospa.com,listado.mercadolibre.com.co"),
    "masajes medellin para hombres": ("hombres", "omspaformen.net,prestigespamedellin.com,luxuryblackspamedellin.com,instagram,listado.mercadolibre.com.co,dmspaparahombres.com,x.com,tutiendaspa.com,agendapro.com"),
    "spa para hombres": ("hombres", "omspaformen.net,dmspaparahombres.com,instagram,spa5elementos.com.co,dospa.co,luxuryblackspamedellin.com,prestigespamedellin.com,tripadvisor.co"),
    "spa hombres medellin": ("hombres", "omspaformen.net,prestigespamedellin.com,instagram,dmspaparahombres.com,spa5elementos.com.co,dospa.co,tripadvisor.co,enigmaspabyem.com,instagram,tripadvisor.co"),
    "sala de masajes para hombres medellin": ("hombres", "omspaformen.net,luxuryblackspamedellin.com,prestigespamedellin.com,dmspaparahombres.com,instagram,spasixthsense.com,spa5elementos.com.co,dospa.co,agendapro.com,clinica-antienvejecimiento.com"),
    "spa medellin": ("general", "tripadvisor.co,celestinospa.com,spaziodivita.co,instagram:brunata_experiencias_spa,spa.landmarkmedellin.com,amatsuspa.com,theplacetobe.lat,clinica-antienvejecimiento.com"),
    "massage medellin": ("general", "akzaraspa.com,tripadvisor.co,instagram,celestinospa.com,amatsuspa.com,hefy.co,fresha.com,tripadvisor.co"),
    "massage in medellin": ("general", "tripadvisor.co,celestinospa.com,reddit.com,mahaiwellness-spa.com,fresha.com,DS/en/massage-medellin,tripadvisor.es,spa.landmarkmedellin.com"),
    "medellin massage": ("general", "tripadvisor.co,akzaraspa.com,celestinospa.com,mahaiwellness-spa.com,instagram,hefy.co,DS/en/massage-medellin,tripadvisor.co,fresha.com"),
    "masajes medellin": ("general", "celestinospa.com,tripadvisor.co,amatsuspa.com,hefy.co,instagram,doctoralia.co,vivaspapoblado.com,scapewellness.com"),
    "dia de spa medellin": ("general", "akzaraspa.com,instagram,celestinospa.com,tripadvisor.co,spaziodivita.co,amatsuspa.com,clinica-antienvejecimiento.com,casacandela.co,theplacetobe.lat"),
    "masajes relajantes medellin": ("general", "vivaspapoblado.com,celestinospa.com,amatsuspa.com,tripadvisor.co,instagram,hefy.co,doctoralia.co,akzaraspa.com,fresha.com"),
    "spa near me medellin": ("general", "tripadvisor.co,celestinospa.com,fresha.com,amatsuspa.com,instagram,spaziodivita.co,viator.com,vivaspapoblado.com"),
    "masajistas medellin": ("general", "celestinospa.com,omspaformen.net,vivaspapoblado.com,akzaraspa.com,doctoralia.co,hefy.co,amatsuspa.com,paginasamarillas.com.co"),
    "spa el poblado": ("poblado", "vivaspapoblado.com,clinica-antienvejecimiento.com,celestinospa.com,tripadvisor.co,spa.landmarkmedellin.com,theplacetobe.lat,fresha.com,instagram,DS/es"),
    "spa poblado": ("poblado", "vivaspapoblado.com,clinica-antienvejecimiento.com,celestinospa.com,tripadvisor.co,theplacetobe.lat,spa.landmarkmedellin.com,instagram,DS/es"),
    "masajes poblado": ("poblado", "celestinospa.com,clinica-antienvejecimiento.com,vivaspapoblado.com,tripadvisor.co,instagram,DS/es/spa-el-poblado,fresha.com,theplacetobe.lat"),
    "masajes el poblado": ("poblado", "celestinospa.com,vivaspapoblado.com,clinica-antienvejecimiento.com,DS/es/spa-el-poblado,tripadvisor.co,instagram,fresha.com,theplacetobe.lat,tripadvisor.co"),
    "depilacion hombres medellin": ("servicio", "terapiasderelajacionmedellin.com,agendapro.com,miadermatologia.com,instagram,luegopago.com,vivaspapoblado.com,hefy.co,clinicameryalvarez.com,omspaformen.net"),
    "limpieza facial medellin": ("servicio", "medipiel.com.co,naturalness.co,vivaspapoblado.com,dermatologica.com.co,doctoralia.co,spaziodivita.co,hefy.co,draskin.co,akzaraspa.com,esteticabrassia.com"),
}

# Paquete de mapas (orden visible; "AD" = ficha patrocinada)
LOCAL = {
    "spa para hombres medellin": ["AD:Eclat massage", "Diamond Spa For Men", "Spa For Men Prestige", "Des Spa (Provenza)", "Black Spa", "Des Spa", "Enigma Spa By EM", "Om Spa For Men", "Sixth Sense Spa For Men", "DM Spa Medellin", "Blue Rose Spa"],
    "spa medellin": ["AD:Eclat massage", "Landmark Hotel", "Celestino Spa", "Aqualuna Spa Provenza", "Le Spa Noir", "Landmark Spa", "Joya Spa", "Aqualuna Spa Laureles", "Massage poblado S&H", "The Spa By Wellcomm"],
    "masajes el poblado": ["Celestino Spa", "AD:Eclat massage", "Massage poblado S&H", "Blue Rose Spa (El Poblado)", "Blue Rose Spa", "Spa For Men Prestige", "Soul Spa", "Okuma Massage", "Enigma Spa By EM", "Viva Spa Poblado"],
    "massage medellin": ["Massage poblado S&H", "AD:Eclat massage", "Blue Rose Spa", "Spa For Men Prestige", "Haruka Massage Spa", "Blue Rose Spa (El Poblado)", "Mobile Massage Medellin", "Bendito Masaje", "Enigma Spa By EM", "Okuma Massage"],
}

# Reseñas en Google Maps (calificación, número) visibles en el paquete local
RESENAS = {
    "Diamond Spa For Men": (4.9, 147), "Eclat massage": (4.9, 117), "Spa For Men Prestige": (4.9, 229),
    "Des Spa (Provenza)": (5.0, 108), "Black Spa": (4.9, 329), "Des Spa": (4.9, 102), "Enigma Spa By EM": (4.8, 366),
    "Om Spa For Men": (4.3, 138), "Sixth Sense Spa For Men": (4.9, 70), "DM Spa Medellin": (4.6, 55),
    "Blue Rose Spa": (5.0, 45), "Blue Rose Spa (El Poblado)": (4.7, 118), "Cima Spa & Wellness": (4.9, 42),
    "Celestino Spa": (4.9, 522), "Aqualuna Spa Provenza": (5.0, 556), "Le Spa Noir": (4.9, 569),
    "Landmark Spa": (5.0, 190), "Joya Spa": (4.8, 307), "Aqualuna Spa Laureles": (4.9, 774),
    "Massage poblado S&H": (5.0, 359), "The Spa By Wellcomm": (4.9, 372), "Amatsu Spa": (4.7, 361),
    "Soul Spa": (4.7, 122), "Okuma Massage": (4.9, 459), "Viva Spa Poblado": (4.6, 379),
}

# Análisis on-page de la portada de cada sitio (2026-11-19)
ONPAGE = [
    {"sitio": "omspaformen.net", "desde_wayback": 2016, "palabras": 3109, "h2": 22, "imagenes": 122, "schema": "Organization, WebSite, Breadcrumb", "rating_schema": False,
     "diferencial": "15 años; galería 'escoge tu masajista'; masajes a domicilio; membresía; blog de turismo en Medellín"},
    {"sitio": "prestigespamedellin.com", "desde_wayback": None, "palabras": 499, "h2": 2, "imagenes": 13, "schema": "WebSite", "rating_schema": False,
     "diferencial": "sitio mínimo; rankea por el nombre de la ficha de Maps con keywords y 229 reseñas"},
    {"sitio": "dmspaparahombres.com", "desde_wayback": None, "palabras": 1227, "h2": 7, "imagenes": 8, "schema": "Organization, Place, Article", "rating_schema": False,
     "diferencial": "dominio con la keyword exacta 'spa para hombres'; experiencias 'reservadas'; FAQ"},
    {"sitio": "celestinospa.com", "desde_wayback": 2023, "palabras": 1178, "h2": 9, "imagenes": 14, "schema": "DaySpa, FAQPage, Breadcrumb", "rating_schema": False,
     "diferencial": "sauna, jacuzzi y cold plunge en rooftop; tarjetas de regalo; precios visibles; 522 reseñas"},
    {"sitio": "vivaspapoblado.com", "desde_wayback": 2016, "palabras": 1322, "h2": 23, "imagenes": 79, "schema": "DaySpa, Organization", "rating_schema": False,
     "diferencial": "10 años de antigüedad; 134 enlaces internos por categorías; 379 reseñas"},
    {"sitio": "diamondspa.com.co (/es/masajes-para-hombres)", "desde_wayback": 2026, "palabras": 2782, "h2": 5, "imagenes": 7, "schema": "DaySpa, FAQPage, AggregateRating, OfferCatalog", "rating_schema": True,
     "diferencial": "mejor on-page del grupo; sitio de ~7 meses; 147 reseñas"},
]

# Auction insights, 30 días: impr. share, overlap, position above, top of page, abs. top, outranking
AUCTION = """aqualunaspa.com.co|30.97|26.86|47.98|84.41|37.84|18.49
spa5elementos.com.co|30.53|20.85|56.51|89.68|31.50|18.72
Diamond Spa (nosotros)|21.22|||77.81|30.10|
ivywellnesscenter.co|15.05|11.26|60.24|82.32|33.85|19.78
vivaspapoblado.com|13.62|13.24|39.82|81.10|13.19|20.10
genesismassagemedellin.com|13.33|17.29|51.46|78.74|19.90|19.33
vivaspamedellin.com|10.85|5.79|44.82|74.35|12.35|20.67
altospa.com.co|<10|7.62|34.86|53.35|8.57|20.66
imperiospamde.com|<10|5.14|57.36|82.62|33.77|20.60
cimaspa.health|<10|5.31|45.99|75.43|22.86|20.70
spaeden.pro|<10|9.44|45.59|67.89|13.79|20.31
nirvanaspacolombia.com|<10|3.72|51.04|77.63|20.01|20.82
google.com (fichas locales)|<10|6.53|35.01|63.99|7.31|20.74
celestinospa.com|<10|6.10|39.05|74.03|16.12|20.72
cleopatraluxuryspa.com|<10|8.22|44.10|70.94|12.32|20.45
relaxathomemasajes.com|<10|10.10|62.57|89.85|53.65|19.88
spamanosdesedamm.com|<10|2.15|43.24|67.18|10.94|21.02"""

# Ads keywords, 30 días: clics, impr, ctr%, cpc, costo, conv%, conversiones
ADS_KW = """massage medellin|EN|528|5307|9.95|3060|1615587|3.13|16.5
masajes para hombres|ES|144|1328|10.84|1350|194411|4.17|6
spa hombres|ES|103|1088|9.47|1032|106278|0.97|1
spa for men medellin|EN|103|1070|9.63|2700|278089|1.46|1.5
spa para hombres medellin|ES|57|708|8.05|1885|107447|3.51|2
masajes para hombres cerca de mi|ES|34|442|7.69|1444|49101|2.94|1
massage medellín|EN|31|517|6.00|1767|54786|0|0
masajes medellin para hombres|ES|29|290|10.00|2064|59853|3.45|1
massage therapy medellin|EN|27|512|5.27|2178|58800|3.70|1
spa para hombres|ES|20|300|6.67|1598|31954|0|0
massage el poblado medellin|EN|17|303|5.61|2212|37599|0|0
masajes relajantes para hombres|ES|13|189|6.88|1221|15878|0|0
masajes medellin hombres|ES|10|192|5.21|2077|20772|0|0
massage medellin poblado|EN|9|227|3.96|4357|39211|0|0
masajes hombres|ES|8|154|5.19|928|7420|0|0
spa hombres medellin|ES|8|202|3.96|1684|13470|0|0
"massage therapy medellin"|EN|8|42|19.05|4244|33949|12.50|1
massages medellin|EN|4|234|1.71|1368|5473|0|0
"masajes en medellin para hombre"|ES|3|35|8.57|1935|5805|0|0
"massages medellin"|EN|3|83|3.61|6333|18999|0|0
"spa hombres medellin"|ES|2|57|3.51|1245|2490|0|0
"masajes para hombres"|ES|1|6|16.67|2594|2594|0|0"""

# Términos de búsqueda reales (Ads, 30 días, top por clics)
ADS_TERMS = """massage near me|115|973|11.82|2079|239136|2.61|3
massage medellin|43|432|9.95|3620|155673|2.33|1
diamond spa|23|50|46.00|1403|32260|4.35|1
spa near me|21|289|7.27|2739|57510|0|0
masaje near me|14|88|15.91|764|10700|0|0
masajes medellin|14|126|11.11|2068|28956|14.29|2
spa near me (2)|14|71|19.72|1925|26956|0|0
daily full body massage|13|21|61.90|788|10248|0|0
diamond spa medellin|11|23|47.83|1559|17151|0|0
masajes medellin (2)|11|160|6.88|2657|29228|0|0
masajes cerca de mi|10|116|8.62|932|9319|0|0
massage|9|134|6.72|3513|31613|0|0
spa para hombres medellin|8|62|12.90|1351|10811|0|0
masaje near me (2)|8|60|13.33|601|4809|0|0
despedida soltera spa|8|10|80.00|1634|13075|0|0
massage near me near me|8|42|19.05|1699|13589|0|0
wellness massage services|8|11|72.73|1068|8544|0|0"""

# Search Console, 19 ago – 17 nov: clics, impresiones, ctr%, posición
GSC = """diamond spa|82|480|17.1|2.7
diamond spa medellin|76|166|45.8|2.3
diamante spa medellin|30|163|18.4|1.9
spa medellin|17|817|2.1|12.0
spa for men medellin|15|153|9.8|3.4
masajes medellín para hombres|13|259|5.0|8.0
spa para hombres medellin|12|268|4.5|6.1
massage near me|10|795|1.3|9.1
masajes para hombres medellin|9|242|3.7|7.5
massage in medellin|9|35|25.7|18.7
masajes poblado|8|133|6.0|6.6
spa para hombres|7|157|4.5|7.7
medellin massage|7|84|8.3|11.2
diamante spa|7|58|12.1|6.3
spa hombres medellin|6|78|7.7|7.9
tipos de masajes|4|759|0.5|8.8
masajes en el poblado|4|107|3.7|14.4"""


def num(x):
    x = x.strip()
    if x in ("", "<10"):
        return None if x == "" else "<10"
    return float(x)


def rows(block, cols):
    return [dict(zip(cols, [c if i == 0 else num(c) if c.replace('.', '', 1).replace('<', '').isdigit() or c in ("", "<10") else c for i, c in enumerate(line.split("|"))])) for line in block.strip().splitlines()]


serp = []
for kw, (grupo, lista) in SERP.items():
    for pos, item in enumerate(lista.split(","), 1):
        dominio, _, extra = item.partition("/") if item.startswith("DS") else item.partition(":")
        if item.startswith("DS"):
            dominio, extra = "diamondspa.com.co", "/" + extra
        serp.append({"fecha": FECHA, "keyword": kw, "grupo": grupo, "posicion": pos, "dominio": dominio, "detalle": extra})

db = {
    "fecha": FECHA,
    "serp_organico": serp,
    "paquete_local": [{"keyword": k, "posicion": i + 1, "negocio": n.removeprefix("AD:"), "anuncio": n.startswith("AD:"),
                       "calificacion": RESENAS.get(n.removeprefix("AD:"), (None, None))[0], "resenas": RESENAS.get(n.removeprefix("AD:"), (None, None))[1]}
                      for k, v in LOCAL.items() for i, n in enumerate(v)],
    "onpage": ONPAGE,
    "ads_auction_insights": rows(AUCTION, ["dominio", "cuota_impr", "superposicion", "pos_superior", "parte_superior", "abs_superior", "cuota_superacion"]),
    "ads_keywords": rows(ADS_KW, ["keyword", "campana", "clics", "impr", "ctr", "cpc", "costo", "tasa_conv", "conversiones"]),
    "ads_terminos": rows(ADS_TERMS, ["termino", "clics", "impr", "ctr", "cpc", "costo", "tasa_conv", "conversiones"]),
    "gsc_keywords": rows(GSC, ["keyword", "clics", "impr", "ctr", "posicion"]),
}

# Resumen por competidor: en cuántas SERP aparece, posición media, por grupo
agg = collections.defaultdict(lambda: {"apariciones": 0, "suma_pos": 0, "grupos": collections.Counter(), "top3": 0})
for r in serp:
    if r["dominio"] in ("instagram", "tripadvisor.co", "tripadvisor.es"):
        key = r["dominio"]
    else:
        key = r["dominio"]
    a = agg[key]
    a["apariciones"] += 1
    a["suma_pos"] += r["posicion"]
    a["grupos"][r["grupo"]] += 1
    a["top3"] += r["posicion"] <= 3
ads_dom = {r["dominio"]: r for r in db["ads_auction_insights"]}
resumen = []
for d, a in agg.items():
    resumen.append({
        "dominio": d,
        "apariciones_top10": a["apariciones"],
        "veces_top3": a["top3"],
        "posicion_media": round(a["suma_pos"] / a["apariciones"], 1),
        "hombres": a["grupos"]["hombres"], "general": a["grupos"]["general"],
        "poblado": a["grupos"]["poblado"], "servicio": a["grupos"]["servicio"], "marca": a["grupos"]["marca"],
        "cuota_impr_ads": (ads_dom.get(d) or {}).get("cuota_impr"),
    })
resumen.sort(key=lambda r: (-r["apariciones_top10"], r["posicion_media"]))
db["resumen_competidores"] = resumen

(HERE / "competencia.json").write_text(json.dumps(db, ensure_ascii=False, indent=1))
for name, data in (("serp_organico", serp), ("resumen_competidores", resumen), ("paquete_local", db["paquete_local"]), ("ads_auction_insights", db["ads_auction_insights"])):
    with open(HERE / f"{name}.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(data[0].keys()))
        w.writeheader(); w.writerows(data)

# Dónde perdemos: keywords sin Diamond Spa en el top 10 orgánico
ours = {r["keyword"]: r["posicion"] for r in serp if r["dominio"] == "diamondspa.com.co"}
print("Sin nosotros en top10:", [k for k in SERP if k not in ours])
print("Nuestra mejor posición:", {k: min(p for kk, p in ((r["keyword"], r["posicion"]) for r in serp if r["dominio"] == "diamondspa.com.co") if kk == k) for k in ours})
print()
for r in resumen[:16]:
    print(r)
