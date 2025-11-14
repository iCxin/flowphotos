"use client"

import { useState } from "react"
import { extractCompleteImageInfo } from "@/lib/exif-extractor"
import type { Photo } from "@/lib/photo-data"

interface UploadedImage {
  file: File
  preview: string
  photo: Partial<Photo>
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState<string | null>(null)

  const uploadImages = async (files: FileList | File[]) => {
    setUploading(true)
    setError(null)

    try {
      const fileArray = Array.from(files)
      const results: UploadedImage[] = []

      for (const file of fileArray) {
        console.log("[v0] Processing image:", file.name)

        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.warn("[v0] Skipping non-image file:", file.name)
          continue
        }

        const imageInfo = await extractCompleteImageInfo(file)
        console.log("[v0] Extracted image info:", {
          name: file.name,
          width: imageInfo.width,
          height: imageInfo.height,
          exif: imageInfo.exif,
        })

        // Create photo object with auto-detected data
        const photo: Partial<Photo> = {
          url: imageInfo.url,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          width: imageInfo.width,
          height: imageInfo.height,
          exif: imageInfo.exif.dateTime
            ? {
                dateTime: imageInfo.exif.dateTime,
              }
            : undefined,
          takenAt: imageInfo.exif.dateTime || new Date().toISOString(),
        }

        results.push({
          file,
          preview: imageInfo.url,
          photo,
        })
      }

      setUploadedImages((prev) => [...prev, ...results])
      console.log("[v0] Successfully uploaded", results.length, "images")
    } catch (err) {
      const message = err instanceof Error ? err.message : "上传失败"
      setError(message)
      console.error("[v0] Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev]
      // Clean up object URL
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const clearAll = () => {
    // Clean up all object URLs
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview))
    setUploadedImages([])
    setError(null)
  }

  return {
    uploading,
    uploadedImages,
    error,
    uploadImages,
    removeImage,
    clearAll,
  }
}
