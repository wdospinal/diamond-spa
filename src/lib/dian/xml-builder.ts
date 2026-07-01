import { v4 as uuidv4 } from 'uuid'
import { CufeData } from './cufe'

export interface InvoiceData {
  cufeData: CufeData
  client: {
    nit: string
    name: string
    email: string
    address: string
    city: string
  }
  items: Array<{
    description: string
    quantity: number
    price: number
  }>
}

/**
 * Genera el documento XML UBL 2.1 (Invoice) requerido por la DIAN (Anexo 1.9).
 * Incluye los placeholders (ext:ExtensionContent) para la futura firma digital.
 */
export function buildDianInvoiceXml(invoice: InvoiceData): string {
  const documentId = invoice.cufeData.NumFac
  const issueDate = invoice.cufeData.FecFac
  const issueTime = invoice.cufeData.HoraFac
  const uuid = uuidv4() // Unique ID for the document instance

  // Estructura simplificada UBL 2.1
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Invoice xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\"
         xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"
         xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\"
         xmlns:ext=\"urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2\">
  
  <!-- UBL Extensions for Signature and DIAN specifics -->
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- AQUI SE INYECTARA LA FIRMA DIGITAL XAdES-EPES -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>

  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>Documentos electronicos</cbc:CustomizationID>
  <cbc:ProfileExecutionID>1</cbc:ProfileExecutionID> <!-- 1=Produccion, 2=Pruebas -->
  <cbc:ID>${documentId}</cbc:ID>
  <cbc:UUID schemeID=\"1\" schemeName=\"CUFE-SHA384\">PLACEHOLDER_CUFE</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>DIAMOND SPA</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${invoice.client.name}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID=\"COP\">${invoice.cufeData.ValFac}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID=\"COP\">${invoice.cufeData.ValFac}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID=\"COP\">${invoice.cufeData.ValImp}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID=\"COP\">${invoice.cufeData.ValTot}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  ${invoice.items.map((item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode=\"94\">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID=\"COP\">${item.price * item.quantity}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${item.description}</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID=\"COP\">${item.price}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join('\\n')}

</Invoice>`
}
