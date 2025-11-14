"use client"

import type React from "react"

import { useImageUpload } from "@/hooks/use-image-upload"
import { Upload, X, ImageIcon, Check } from "lucide-react"
import Image from "next/image"

export function ImageUploadDemo() {
  const { uploading, uploadedImages, error, uploadImages, removeImage, clearAll } = useImageUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImages(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadImages(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">点击上传或拖拽图片到此处</p>
              <p className="text-xs text-muted-foreground mt-1">自动识别尺寸和 EXIF 信息</p>
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">正在处理图片...</span>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">已上传 {uploadedImages.length} 张图片</h3>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              清除全部
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedImages.map((img, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={img.preview || "/placeholder.svg"}
                      alt={img.photo.title || "预览"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{img.photo.title}</p>
                    <div className="text-xs text-muted-foreground space-y-1 mt-1">
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>
                          尺寸: {img.photo.width} × {img.photo.height}
                        </span>
                      </div>
                      {img.photo.exif?.dateTime && (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>拍摄时间: {new Date(img.photo.exif.dateTime).toLocaleDateString("zh-CN")}</span>
                        </div>
                      )}
                      <div className="text-muted-foreground/60">大小: {(img.file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="rounded-full p-1.5 hover:bg-muted transition-colors"
                    aria-label="移除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedImages.length === 0 && !uploading && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">还没有上传任何图片</p>
        </div>
      )}
    </div>
  )
}
