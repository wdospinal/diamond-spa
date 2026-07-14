import { createHash } from 'crypto'

/**
 * Interface con los datos obligatorios para calcular el CUFE según el Anexo Técnico 1.9
 */
export interface CufeData {
  NumFac: string // Número de factura (ej. SETT1)
  FecFac: string // Fecha de emisión (ej. 2023-11-20)
  HoraFac: string // Hora de emisión con offset (ej. 15:30:00-05:00)
  ValFac: string // Valor total sin impuestos
  CodImp1: string // 01 (IVA)
  ValImp1: string // Total IVA
  CodImp2: string // 04 (INC) - 0.00 si no aplica
  ValImp2: string // Total INC - 0.00 si no aplica
  CodImp3: string // 03 (ICA) - 0.00 si no aplica
  ValImp3: string // Total ICA - 0.00 si no aplica
  ValImp: string // Valor total a pagar con impuestos
  ValTot: string // Valor total a pagar (generalmente igual a ValImp)
  NitOFE: string // NIT del emisor (sin dígito de verificación)
  NumAdq: string // NIT/CC del adquirente (cliente)
  ClaveTec: string // Clave técnica provista por la DIAN
}

/**
 * Genera el Código Único de Facturación Electrónica (CUFE) usando SHA-384
 * @param data Objeto con los datos de la factura y clave técnica
 * @returns Hash SHA-384 en formato hexadecimal
 */
export function generateCUFE(data: CufeData): string {
  // 1. Concatenar exactamente en este orden (sin separadores)
  const cadena = 
    data.NumFac +
    data.FecFac +
    data.HoraFac +
    data.ValFac +
    data.CodImp1 +
    data.ValImp1 +
    data.CodImp2 +
    data.ValImp2 +
    data.CodImp3 +
    data.ValImp3 +
    data.ValImp +
    data.ValTot +
    data.NitOFE +
    data.NumAdq +
    data.ClaveTec

  // 2. Aplicar hash SHA-384
  const hash = createHash('sha384').update(cadena, 'utf-8').digest('hex')
  
  return hash
}
