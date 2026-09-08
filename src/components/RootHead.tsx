import Script from 'next/script'

/**
 * The <head> contents shared by every root layout.
 *
 * Both the site tree and the admin tree render their own <html>/<head> now, so
 * these tags live in one component rather than being copy-pasted into each root
 * layout and drifting apart. Behaviour is unchanged from when a single root
 * layout owned them: GTM and Clarity load on the admin app exactly as before.
 */
export default function RootHead() {
  return (
    <>
      {/* DNS prefetch for lazy-loaded third-party content */}
      <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      <link rel="dns-prefetch" href="https://api.dicebear.com" />
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#0a1628" />

      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W3WCSFP4');`,
        }}
      />
      {/* End Google Tag Manager */}

      {/* Microsoft Clarity — grabaciones de sesión y mapas de calor, gratis */}
      <Script
        id="clarity-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","y7y5y50orw");`,
        }}
      />
      {/* End Microsoft Clarity */}
    </>
  )
}

/** GTM's <noscript> iframe. First thing inside <body>, as GTM requires. */
export function RootGtmNoScript() {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-W3WCSFP4"
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
