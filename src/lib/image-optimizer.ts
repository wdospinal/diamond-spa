export async function compressImageToWebP(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Escalar si excede el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas no soportado'))

        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a WebP con la calidad especificada
        const dataUrl = canvas.toDataURL('image/webp', quality)
        resolve(dataUrl)
      }
    }
  })
}
