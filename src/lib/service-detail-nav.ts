export const SERVICE_DETAIL_FROM_MASAJES = 'masajes-para-hombres'
export const SERVICE_DETAIL_FROM_MUJERES = 'masajes-para-mujeres'
export const SERVICE_DETAIL_FROM_HOME = 'home'

export const SERVICE_DETAIL_FROM_KEY = 'sdFrom'

export function setServiceFrom(value: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SERVICE_DETAIL_FROM_KEY, value)
  }
}
