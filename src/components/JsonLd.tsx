/* eslint-disable react/no-danger */
/** JSON-LD data block — type=application/ld+json is a React 19 script data block (no execute warning). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
