"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Camera, Upload, X, FileImage, LinkIcon } from "lucide-react"
import { extractCompleteImageInfo } from "@/lib/exif-extractor"
import type { ExifData } from "@/lib/photo-data"
import Link from "next/link"

interface ImageInfo {
  url: string
  width: number
  height: number
  size: number
  type: string
  exif: Partial<ExifData>
  fileName: string
}

export default function ExifReaderPage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true)
    try {
      const info = await extractCompleteImageInfo(file)
      setImageInfo({
        ...info,
        fileName: file.name,
      })
    } catch (error) {
      console.error("[v0] Error processing image:", error)
      alert("无法读取图片信息，请确保文件是有效的图片格式")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const processImageUrl = useCallback(
    async (url: string) => {
      if (!url.trim()) return

      setIsLoadingUrl(true)
      setIsProcessing(true)
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("无法加载图片")
        }

        const blob = await response.blob()
        const fileName = url.split("/").pop() || "image"
        const file = new File([blob], fileName, { type: blob.type })

        await processImage(file)
        setImageUrl("")
      } catch (error) {
        console.error("[v0] Error loading image from URL:", error)
        alert("无法从链接加载图片，请检查链接是否有效")
      } finally {
        setIsLoadingUrl(false)
        setIsProcessing(false)
      }
    },
    [processImage],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        processImage(file)
      }
    },
    [processImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        processImage(file)
      }
    },
    [processImage],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const clearImage = useCallback(() => {
    if (imageInfo?.url) {
      URL.revokeObjectURL(imageInfo.url)
    }
    setImageInfo(null)
  }, [imageInfo])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-11 md:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  FlowPhotos
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">EXIF 信息读取</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              返回照片画廊
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">EXIF 信息读取器</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            选择或拖放照片，或输入图片链接，自动提取完整的 EXIF 信息和元数据
          </p>
        </div>

        {/* URL input section */}
        <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">从图片链接读取</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="输入图片链接（支持 https:// 或 http://）"
              className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              disabled={isLoadingUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  processImageUrl(imageUrl)
                }
              }}
            />
            <button
              onClick={() => processImageUrl(imageUrl)}
              disabled={!imageUrl.trim() || isLoadingUrl}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-medium text-sm sm:text-base hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoadingUrl ? "加载中..." : "读取"}
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-none">
            {isProcessing ? (
              <>
                <div className="h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-base sm:text-lg font-medium">正在读取图片信息...</p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-base sm:text-lg font-medium mb-1">点击或拖放照片到此处</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">支持 JPG、PNG、HEIC 等常见格式</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image Info Display */}
        {imageInfo && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Image Preview */}
            <div className="relative rounded-xl sm:rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={clearImage}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg transition-all hover:scale-110"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <img
                src={imageInfo.url || "/placeholder.svg"}
                alt="预览"
                className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain bg-muted"
              />
            </div>

            {/* File Info */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <FileImage className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold">文件信息</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">文件名</p>
                  <p className="font-medium text-sm sm:text-base break-all">{imageInfo.fileName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">文件大小</p>
                  <p className="font-medium text-sm sm:text-base">{formatFileSize(imageInfo.size)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">图片尺寸</p>
                  <p className="font-medium text-sm sm:text-base">
                    {imageInfo.width} × {imageInfo.height}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">宽高比</p>
                  <p className="font-medium text-sm sm:text-base">{(imageInfo.width / imageInfo.height).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* EXIF Data */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold">EXIF 信息</h3>
              </div>

              {Object.keys(imageInfo.exif).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {imageInfo.exif.camera && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">相机</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.camera}</p>
                    </div>
                  )}
                  {imageInfo.exif.lens && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">镜头</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.lens}</p>
                    </div>
                  )}
                  {imageInfo.exif.focalLength && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">焦距</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.focalLength}</p>
                    </div>
                  )}
                  {imageInfo.exif.aperture && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">光圈</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.aperture}</p>
                    </div>
                  )}
                  {imageInfo.exif.shutterSpeed && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">快门速度</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.shutterSpeed}</p>
                    </div>
                  )}
                  {imageInfo.exif.iso && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">ISO</p>
                      <p className="font-medium text-sm sm:text-base">ISO {imageInfo.exif.iso}</p>
                    </div>
                  )}
                  {imageInfo.exif.dateTime && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">拍摄时间</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.dateTime}</p>
                    </div>
                  )}
                  {imageInfo.exif.flash && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">闪光灯</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.flash}</p>
                    </div>
                  )}
                  {imageInfo.exif.exposureMode && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">曝光模式</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.exposureMode}</p>
                    </div>
                  )}
                  {imageInfo.exif.whiteBalance && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">白平衡</p>
                      <p className="font-medium text-sm sm:text-base">{imageInfo.exif.whiteBalance}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm sm:text-base">此图片不包含 EXIF 信息</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}