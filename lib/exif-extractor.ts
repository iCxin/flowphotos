import type { ExifData } from "./photo-data"

let exifrParser: any = null

async function loadExifr() {
  if (!exifrParser) {
    try {
      // Dynamic import of exifr for client-side EXIF parsing
      const exifr = await import("exifr")
      exifrParser = exifr
    } catch (error) {
      console.warn("[v0] exifr library not available, using fallback")
    }
  }
  return exifrParser
}

/**
 * Extract comprehensive EXIF data from image file
 */
export async function extractExifData(file: File): Promise<Partial<ExifData>> {
  try {
    const exifr = await loadExifr()

    if (!exifr) {
      // Fallback to basic metadata
      return {
        dateTime: new Date(file.lastModified).toLocaleString(),
      }
    }

    // Parse EXIF data using exifr
    const exifData = await exifr.parse(file, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
        "Flash",
        "ExposureMode",
        "WhiteBalance",
      ],
    })

    if (!exifData) {
      return {
        dateTime: new Date(file.lastModified).toLocaleString(),
      }
    }

    // Format EXIF data into our structure
    const formattedExif: Partial<ExifData> = {}

    if (exifData.Make && exifData.Model) {
      formattedExif.camera = `${exifData.Make} ${exifData.Model}`
    } else if (exifData.Model) {
      formattedExif.camera = exifData.Model
    }

    if (exifData.LensModel) {
      formattedExif.lens = exifData.LensModel
    }

    if (exifData.FocalLength) {
      formattedExif.focalLength = `${exifData.FocalLength}mm`
    }

    if (exifData.FNumber) {
      formattedExif.aperture = `f/${exifData.FNumber}`
    }

    if (exifData.ExposureTime) {
      if (exifData.ExposureTime < 1) {
        formattedExif.shutterSpeed = `1/${Math.round(1 / exifData.ExposureTime)}s`
      } else {
        formattedExif.shutterSpeed = `${exifData.ExposureTime}s`
      }
    }

    if (exifData.ISO) {
      formattedExif.iso = exifData.ISO
    }

    if (exifData.DateTimeOriginal) {
      formattedExif.dateTime = new Date(exifData.DateTimeOriginal).toLocaleString()
    }

    if (exifData.Flash !== undefined) {
      formattedExif.flash = exifData.Flash === 0 ? "关闭" : "开启"
    }

    if (exifData.ExposureMode !== undefined) {
      const modes = ["自动", "手动", "自动包围"]
      formattedExif.exposureMode = modes[exifData.ExposureMode] || "未知"
    }

    if (exifData.WhiteBalance !== undefined) {
      formattedExif.whiteBalance = exifData.WhiteBalance === 0 ? "自动" : "手动"
    }

    return formattedExif
  } catch (error) {
    console.warn("[v0] Failed to extract EXIF data:", error)
    return {
      dateTime: new Date(file.lastModified).toLocaleString(),
    }
  }
}

/**
 * Comprehensive image info extraction: dimensions + EXIF + metadata
 */
export async function extractCompleteImageInfo(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
  exif: Partial<ExifData>
  url: string
}> {
  const url = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = async () => {
      try {
        const exif = await extractExifData(file)

        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          type: file.type,
          exif,
          url,
        })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image: ${file.name}`))
    }

    img.src = url
  })
}

/**
 * Parse EXIF orientation and get CSS transform
 */
export function getOrientationTransform(orientation?: number): string {
  if (!orientation) return ""

  switch (orientation) {
    case 2:
      return "scaleX(-1)"
    case 3:
      return "rotate(180deg)"
    case 4:
      return "scaleY(-1)"
    case 5:
      return "rotate(90deg) scaleX(-1)"
    case 6:
      return "rotate(90deg)"
    case 7:
      return "rotate(-90deg) scaleX(-1)"
    case 8:
      return "rotate(-90deg)"
    default:
      return ""
  }
}

/**
 * Extract EXIF data from remote image URL (browser-side)
 */
export async function extractExifFromUrl(url: string): Promise<Partial<ExifData>> {
  try {
    console.log("[v0] Extracting EXIF from URL:", url)

    const exifr = await loadExifr()

    if (!exifr) {
      console.warn("[v0] exifr library not available")
      return {}
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const blob = await response.blob()

    // Parse EXIF data using exifr
    const exifData = await exifr.parse(blob, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
        "Flash",
        "ExposureMode",
        "WhiteBalance",
      ],
    })

    if (!exifData) {
      console.log("[v0] No EXIF data found in image")
      return {}
    }

    console.log("[v0] Extracted EXIF data:", exifData)

    // Format EXIF data into our structure
    const formattedExif: Partial<ExifData> = {}

    if (exifData.Make && exifData.Model) {
      formattedExif.camera = `${exifData.Make} ${exifData.Model}`
    } else if (exifData.Model) {
      formattedExif.camera = exifData.Model
    }

    if (exifData.LensModel) {
      formattedExif.lens = exifData.LensModel
    }

    if (exifData.FocalLength) {
      formattedExif.focalLength = `${exifData.FocalLength}mm`
    }

    if (exifData.FNumber) {
      formattedExif.aperture = `f/${exifData.FNumber}`
    }

    if (exifData.ExposureTime) {
      if (exifData.ExposureTime < 1) {
        formattedExif.shutterSpeed = `1/${Math.round(1 / exifData.ExposureTime)}s`
      } else {
        formattedExif.shutterSpeed = `${exifData.ExposureTime}s`
      }
    }

    if (exifData.ISO) {
      formattedExif.iso = exifData.ISO
    }

    if (exifData.DateTimeOriginal) {
      formattedExif.dateTime = new Date(exifData.DateTimeOriginal).toLocaleString()
    }

    if (exifData.Flash !== undefined) {
      formattedExif.flash = exifData.Flash === 0 ? "关闭" : "开启"
    }

    if (exifData.ExposureMode !== undefined) {
      const modes = ["自动", "手动", "自动包围"]
      formattedExif.exposureMode = modes[exifData.ExposureMode] || "未知"
    }

    if (exifData.WhiteBalance !== undefined) {
      formattedExif.whiteBalance = exifData.WhiteBalance === 0 ? "自动" : "手动"
    }

    return formattedExif
  } catch (error) {
    console.warn("[v0] Failed to extract EXIF from URL:", error)
    return {}
  }
}
