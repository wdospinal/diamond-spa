/**
 * Landing pages layout — deliberately does NOT include the global Navigation
 * or Footer. Each landing page renders its own LandingHeader and LandingFooter.
 * This avoids the "ghost nav" problem where the global nav renders behind
 * the landing header regardless of .is-ads CSS state.
 */
export default function LandingSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Return children WITHOUT wrapping in the [lang] layout's Navigation/Footer.
  // The <html> and <body> are still provided by the root layout.tsx.
  return <>{children}</>
}
