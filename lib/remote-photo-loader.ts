import type { Photo } from "./photo-data"

const REMOTE_CONFIG_URL = "https://www.cxin.net/cdn/photos.js"

/**
 * Extract DateTimeOriginal from image EXIF data
 */
async function extractDateFromImage(url: string): Promise<string | undefined> {
  try {
    // Dynamic import of exifr for EXIF parsing
    const exifr = await import("exifr")

    const response = await fetch(url)
    if (!response.ok) return undefined

    const blob = await response.blob()

    // Parse only DateTimeOriginal for efficiency
    const exifData = await exifr.parse(blob, {
      pick: ["DateTimeOriginal"],
    })

    if (exifData?.DateTimeOriginal) {
      return new Date(exifData.DateTimeOriginal).toISOString()
    }
  } catch (error) {
    console.warn("[v1] Failed to extract date from image:", error)
  }

  return undefined
}

/**
 * Parse remote photo configuration
 * Format: [title,description](url)
 * Example: [示例,这是一个示例](https://example.com/image.jpg)
 */
export async function parseRemotePhotos(content: string): Promise<Photo[]> {
  const photos: Photo[] = []

  // 修正正则表达式：匹配正确的 [title,description](url) 格式
  const regex = /\[([^\]]+),([^\]]+)\]\(([^)]+)\)/g

  console.log("[v1] Parsing remote content, length:", content.length)
  console.log("[v1] First 200 chars:", content.substring(0, 200))

  let match
  let matchCount = 0
  while ((match = regex.exec(content)) !== null) {
    matchCount++
    const [, title, description, url] = match

    console.log("[v1] Match", matchCount, ":", { title, description, url })

    if (title && description && url) {
      photos.push({
        id: Date.now() + matchCount,
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        // 设置默认日期，后续从 EXIF 异步提取
        takenAt: new Date().toISOString(), // 默认值，避免undefined
        tags: ["remote"],
      })
    }
  }

  console.log("[v1] Found", matchCount, "matches, created", photos.length, "photos")

  // 从 EXIF 异步提取日期（可选，不阻塞主流程）
  if (photos.length > 0) {
    // 使用 Promise.allSettled 避免单个图片失败影响其他图片
    const dateExtractionPromises = photos.map(async (photo, index) => {
      try {
        const exifDate = await extractDateFromImage(photo.url)
        if (exifDate) {
          photo.takenAt = exifDate
          console.log("[v1] Extracted date for", photo.title, ":", exifDate)
        }
      } catch (error) {
        console.warn(`[v1] Failed to extract date for photo ${index}:`, error)
      }
    })

    // 不等待所有提取完成，避免阻塞
    Promise.allSettled(dateExtractionPromises)
      .then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length
        console.log(`[v1] Date extraction completed: ${successful}/${photos.length} successful`)
      })
  }

  return photos
}

/**
 * Fetch and parse remote photo configuration
 */
export async function fetchRemotePhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(`${REMOTE_CONFIG_URL}?t=${Date.now()}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.status}`)
    }

    const content = await response.text()
    const photos = await parseRemotePhotos(content)

    console.log(`[v1] Loaded ${photos.length} photos from remote config`)
    return photos
  } catch (error) {
    console.error("[v1] Failed to load remote photos:", error)
    return []
  }
}
