"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Info, MapPin, Calendar, Camera } from "lucide-react"
import type { Photo, ExifData } from "@/lib/photo-data"
import { extractExifFromUrl } from "@/lib/exif-extractor"

interface LightboxProps {
  photo: Photo
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
  currentIndex: number
  totalCount: number
}

export function Lightbox({
  photo,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}: LightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [exifData, setExifData] = useState<Partial<ExifData> | undefined>(photo.exif)
  const [loadingExif, setLoadingExif] = useState(false)
  const [currentPhotoId, setCurrentPhotoId] = useState(photo.id)
  const [imageKey, setImageKey] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft" && hasPrevious) {
        onPrevious()
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext()
      } else if (e.key === "i" || e.key === "I") {
        setShowInfo((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext])

  useEffect(() => {
    if (photo.id !== currentPhotoId) {
      console.log("[v0] Photo changed from", currentPhotoId, "to", photo.id)
      console.log("[v0] New photo URL:", photo.url)
      setCurrentPhotoId(photo.id)
      setImageLoaded(false)
      setExifData(photo.exif)
      setLoadingExif(false)
      setImageKey((prev) => prev + 1) // Force remount
    }
  }, [photo.id, currentPhotoId, photo.exif, photo.url])

  useEffect(() => {
    if (showInfo && !exifData && !loadingExif) {
      setLoadingExif(true)
      console.log("[v0] Loading EXIF data for photo:", photo.url)
      extractExifFromUrl(photo.url)
        .then((data) => {
          console.log("[v0] EXIF data loaded:", data)
          setExifData(data)
        })
        .catch((error) => {
          console.error("[v0] Failed to load EXIF:", error)
        })
        .finally(() => {
          setLoadingExif(false)
        })
    }
  }, [showInfo, exifData, loadingExif, photo.url])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3 transition-opacity ${showInfo ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-white/90 text-xs sm:text-sm font-medium">
              {currentIndex} / {totalCount}
            </div>
            {photo.takenAt && (
              <div className="hidden sm:flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{new Date(photo.takenAt).toLocaleDateString("zh-CN")}</span>
              </div>
            )}
            {photo.width && photo.height && (
              <div className="hidden md:flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
                <span>
                  {photo.width} × {photo.height} ({(photo.width / photo.height).toFixed(2)})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowInfo(!showInfo)
              }}
              className={`rounded-lg p-1.5 sm:p-2 text-white transition-all hover:scale-105 active:scale-95 ${
                showInfo ? "bg-white/20" : "bg-white/10 hover:scale-105"
              }`}
              aria-label="信息"
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="w-px h-4 sm:h-6 bg-white/20" />
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 p-1.5 sm:p-2 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
              aria-label="关闭"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className={`absolute left-2 sm:left-4 z-20 rounded-full bg-white/10 p-2 sm:p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-110 active:scale-95 ${showInfo ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          aria-label="上一张"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className={`absolute z-20 rounded-full bg-white/10 p-2 sm:p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-110 active:scale-95 ${
            showInfo
              ? "right-[calc(100%-0.5rem)] sm:right-[calc(24rem+1rem)] md:right-[calc(30rem+1rem)] opacity-0 pointer-events-none"
              : "right-2 sm:right-4 opacity-100"
          }`}
          aria-label="下一张"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
      )}

      <div className="flex h-full w-full items-center" onClick={(e) => e.stopPropagation()}>
        {/* Image container */}
        <div
          className={`flex-1 h-full flex items-center justify-center p-2 sm:p-4 md:p-8 transition-all duration-300 ${showInfo ? "hidden sm:flex sm:mr-2 md:mr-4" : "flex"}`}
        >
          <div className="relative max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] max-w-full flex items-center justify-center">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            )}
            <Image
              key={imageKey}
              src={photo.url || "/placeholder.svg"}
              alt={photo.title}
              width={photo.width || 800}
              height={photo.height || 600}
              className={`max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-8rem)] w-auto h-auto object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => {
                console.log("[v0] Image loaded:", photo.url)
                setImageLoaded(true)
              }}
              onError={(e) => {
                console.error("[v0] Image load error:", photo.url, e)
                setImageLoaded(true) // Show image anyway to prevent infinite loading
              }}
              unoptimized
              priority
            />
          </div>
        </div>

        {showInfo && (
          <div
            className="fixed sm:relative right-0 top-0 h-full w-full sm:w-80 md:w-96 lg:w-[30rem] bg-black/95 sm:bg-black/90 backdrop-blur-md border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex-shrink-0 flex items-center justify-between p-3 border-b border-white/10 bg-black/95 sticky top-0 z-30">
              <span className="text-white font-semibold text-sm">照片信息</span>
              <button
                onClick={() => setShowInfo(false)}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight text-balance">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed text-pretty">
                      {photo.description}
                    </p>
                  )}
                </div>

                {(exifData || loadingExif) && (
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>相机信息</span>
                      {loadingExif && <span className="text-xs text-white/50">加载中...</span>}
                    </div>
                    {exifData && Object.keys(exifData).length > 0 ? (
                      <div className="space-y-0 bg-white/5 rounded-lg p-3 sm:p-4">
                        {exifData.camera && (
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">相机</span>
                            <span className="text-white text-xs sm:text-sm font-medium text-right break-words">
                              {exifData.camera}
                            </span>
                          </div>
                        )}
                        {exifData.lens && (
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">镜头</span>
                            <span className="text-white text-xs sm:text-sm font-medium text-right break-words">
                              {exifData.lens}
                            </span>
                          </div>
                        )}
                        {exifData.focalLength && (
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">焦距</span>
                            <span className="text-white text-xs sm:text-sm font-medium">{exifData.focalLength}</span>
                          </div>
                        )}
                        {exifData.aperture && (
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">光圈</span>
                            <span className="text-white text-xs sm:text-sm font-medium">{exifData.aperture}</span>
                          </div>
                        )}
                        {exifData.shutterSpeed && (
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">快门速度</span>
                            <span className="text-white text-xs sm:text-sm font-medium">{exifData.shutterSpeed}</span>
                          </div>
                        )}
                        {exifData.iso && (
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                            <span className="text-white/50 text-xs sm:text-sm">ISO</span>
                            <span className="text-white text-xs sm:text-sm font-medium">{exifData.iso}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      !loadingExif && (
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-white/50 text-xs sm:text-sm text-center">
                          该照片无EXIF信息
                        </div>
                      )
                    )}
                  </div>
                )}

                {photo.location && (
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>拍摄地点</span>
                    </div>
                    <div className="space-y-0 bg-white/5 rounded-lg p-3 sm:p-4">
                      {photo.location.city && (
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                          <span className="text-white/50 text-xs sm:text-sm">城市</span>
                          <span className="text-white text-xs sm:text-sm font-medium">{photo.location.city}</span>
                        </div>
                      )}
                      {photo.location.country && (
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-white/10 last:border-0">
                          <span className="text-white/50 text-xs sm:text-sm">国家</span>
                          <span className="text-white text-xs sm:text-sm font-medium">{photo.location.country}</span>
                        </div>
                      )}
                      {photo.location.address && (
                        <div className="flex flex-col gap-2 py-2 sm:py-3 border-b border-white/10 last:border-0">
                          <span className="text-white/50 text-xs sm:text-sm">地址</span>
                          <span className="text-white text-xs sm:text-sm font-medium break-words leading-relaxed">
                            {photo.location.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {photo.takenAt && (
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>拍摄时间</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-white/90 font-medium">
                        {new Date(photo.takenAt).toLocaleString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center transition-opacity ${showInfo ? "opacity-0" : "opacity-100"}`}
      >
        使用 ← → 切换照片 • 按 I 显示/隐藏信息 • 按 ESC 关闭
      </div>
    </div>
  )
}