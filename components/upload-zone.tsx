"use client"

import type React from "react"

import { useCallback } from "react"
import { Upload, X } from "lucide-react"
import { useImageUpload } from "@/hooks/use-image-upload"
import { Button } from "@/components/ui/button"

interface UploadZoneProps {
  onPhotosUploaded: (
    photos: Array<{
      url: string
      title: string
      width: number
      height: number
      exif?: any
      takenAt?: string
    }>,
  ) => void
}

export function UploadZone({ onPhotosUploaded }: UploadZoneProps) {
  const { uploading, uploadedImages, error, uploadImages, removeImage, clearAll } = useImageUpload()

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files.length > 0) {
        uploadImages(files)
      }
    },
    [uploadImages],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        uploadImages(files)
      }
    },
    [uploadImages],
  )

  const handleAddPhotos = () => {
    if (uploadedImages.length > 0) {
      const photos = uploadedImages.map((img) => ({
        url: img.preview,
        title: img.photo.title || "Untitled",
        width: img.photo.width || 1200,
        height: img.photo.height || 800,
        exif: img.photo.exif,
        takenAt: img.photo.takenAt,
      }))
      onPhotosUploaded(photos)
      clearAll()
    }
  }

  return (
    <div className="mb-8 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Upload className="h-5 w-5" />
          测试EXIF自动识别
        </div>
        <p className="text-center text-sm text-muted-foreground max-w-md">
          上传你自己的照片来测试EXIF自动识别功能。系统会自动提取相机型号、镜头、光圈、快门、ISO等信息。
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full max-w-md rounded-lg border-2 border-dashed border-muted-foreground/25 bg-background p-8 text-center hover:border-primary/50 hover:bg-accent/50 transition-colors"
        >
          <input type="file" id="file-upload" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">点击选择或拖拽照片到这里</p>
              <p className="text-xs text-muted-foreground">支持 JPG, PNG 等格式</p>
            </div>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {uploadedImages.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">已上传 {uploadedImages.length} 张照片</p>
              <Button variant="outline" size="sm" onClick={clearAll}>
                清空
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview || "/placeholder.svg"}
                    alt={img.photo.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                    <p className="truncate">
                      {img.photo.width}×{img.photo.height}
                    </p>
                    {img.photo.exif?.dateTime && (
                      <p className="text-xs opacity-75">{new Date(img.photo.exif.dateTime).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleAddPhotos} className="w-full" disabled={uploading}>
              {uploading ? "处理中..." : "添加到相册"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
