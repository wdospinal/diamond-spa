/**
 * Cliente SOAP genérico para comunicarse con los Web Services de la DIAN
 * (Soporta Entorno de Pruebas y Producción)
 */

const DIAN_WSDL_TEST = 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc?wsdl'
const DIAN_WSDL_PROD = 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc?wsdl'

export interface DianResponse {
  isValid: boolean
  statusCode: string
  errorMessage?: string
  dianResponseXml?: string
}

/**
 * Envía un documento electrónico (Factura, Nota) a la DIAN mediante SendTestSetAsync o SendBillAsync
 * @param signedXml XML firmado en estándar UBL 2.1
 * @param testSetId TestSetID proporcionado por la DIAN (si está en pruebas)
 * @param isProduction True para usar el endpoint de producción
 */
export async function sendInvoiceToDian(signedXml: string, testSetId?: string, isProduction = false): Promise<DianResponse> {
  const url = isProduction ? DIAN_WSDL_PROD : DIAN_WSDL_TEST
  
  // TODO: Construir el sobre SOAP con cabeceras WSSecurity (Timestamp, UsernameToken)
  // El UsernameToken requiere un Nonce y un PasswordDigest en Base64 según el estándar OASIS.
  const soapEnvelope = `
    <soap:Envelope xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:wcf=\"http://wcf.dian.colombia\">
      <soap:Header>
        <!-- WSSecurity Header Placeholder -->
      </soap:Header>
      <soap:Body>
        <wcf:SendTestSetAsync>
          <!-- Base64 ZIP containing the signed XML -->
          <wcf:fileName>Factura.zip</wcf:fileName>
          <wcf:contentFile>BASE64_ZIP_CONTENT_HERE</wcf:contentFile>
          <wcf:testSetId>${testSetId}</wcf:testSetId>
        </wcf:SendTestSetAsync>
      </soap:Body>
    </soap:Envelope>
  `

  try {
    const response = await fetch(url.replace('?wsdl', ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8;action=\"http://wcf.dian.colombia/IWcfDianCustomerServices/SendTestSetAsync\"'
      },
      body: soapEnvelope
    })

    const responseText = await response.text()
    
    // TODO: Parsear la respuesta SOAP para leer el <b:StatusCode> y <b:StatusMessage>
    
    return {
      isValid: response.ok,
      statusCode: response.status.toString(),
      dianResponseXml: responseText
    }
  } catch (error: any) {
    return {
      isValid: false,
      statusCode: '500',
      errorMessage: error.message
    }
  }
}
