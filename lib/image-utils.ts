export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Automatically detect image dimensions from a URL
 */
export async function detectImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }
    img.src = url
  })
}

/**
 * Extract EXIF data from an image file using browser APIs
 * Note: This is a simplified version. For full EXIF support, consider using exif-js or piexif
 */
export async function extractBasicImageInfo(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
}> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
      })
      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image file: ${file.name}`))
    }

    img.src = url
  })
}

/**
 * Batch detect dimensions for multiple images
 */
export async function batchDetectDimensions(urls: string[]): Promise<Map<string, ImageDimensions>> {
  const results = new Map<string, ImageDimensions>()

  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const dimensions = await detectImageDimensions(url)
        results.set(url, dimensions)
      } catch (error) {
        console.warn(`Failed to detect dimensions for ${url}:`, error)
        // Fallback to default dimensions
        results.set(url, { width: 800, height: 600 })
      }
    }),
  )

  return results
}
