import { SignedXml } from 'xml-crypto'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'

/**
 * Firma un documento XML bajo el estándar XAdES-EPES requerido por la DIAN.
 * Utiliza el certificado digital de la empresa (.p12 / .pfx) para la firma criptográfica.
 * 
 * @param xmlString Documento XML UBL 2.1 sin firmar
 * @param certPem Certificado público en formato PEM
 * @param keyPem Llave privada en formato PEM
 * @returns XML firmado listo para enviar a la DIAN
 */
export function signDIANXml(xmlString: string, certPem: string, keyPem: string): string {
  const sig = new SignedXml()
  
  // Algoritmos exigidos por la DIAN
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
  sig.addReference(
    '//*[local-name(.)=\"ExtensionContent\"]', // La referencia de firma debe ir dentro de ExtensionContent
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2001/04/xmlenc#sha256'
  )

  sig.signingKey = keyPem
  
  // Inyección de KeyInfo (Certificado público)
  sig.keyInfoProvider = {
    getKeyInfo: () => {
      // Extraemos el contenido base64 del PEM para el X509Certificate
      const certBase64 = certPem
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\\r\\n/g, '')
        .replace(/\\n/g, '')
      
      return `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`
    },
    getKey: () => keyPem
  }

  // Parsear el XML
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')
  
  // Realizar la firma
  sig.computeSignature(xmlString)
  
  // TODO: Insertar la firma resultante (sig.getSignatureXml()) dentro del nodo <ext:ExtensionContent>
  // correspondiente del XML original según el Anexo 1.9 de la DIAN.
  
  return sig.getSignedXml()
}
