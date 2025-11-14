"use client"

import { useState, useEffect, useRef } from "react"
import { PhotoCard } from "./photo-card"
import type { Photo } from "@/lib/photo-data"
import { detectImageDimensions } from "@/lib/image-utils"
import { useLayoutSettings } from "@/hooks/use-layout-settings"

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  const [columns, setColumns] = useState(4)
  const [photosWithDimensions, setPhotosWithDimensions] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  const { settings } = useLayoutSettings()

  useEffect(() => {
    const loadDimensions = async () => {
      setIsLoading(true)
      const updatedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (photo.width && photo.height) {
            return photo
          }

          try {
            const dimensions = await detectImageDimensions(photo.url)
            return { ...photo, width: dimensions.width, height: dimensions.height }
          } catch (error) {
            console.warn(`Failed to detect dimensions for ${photo.url}, using fallback`)
            return { ...photo, width: 800, height: 600 }
          }
        }),
      )
      setPhotosWithDimensions(updatedPhotos)
      setIsLoading(false)
    }

    loadDimensions()
  }, [photos])

  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      const userColumns = Number(settings.columns) || 4
      let responsiveColumns = Math.max(1, Math.min(userColumns, 10)) // Clamp between 1 and 10

      // Auto-adjust for smaller screens with more precise breakpoints
      if (width < 480) {
        // Extra small mobile: max 1 column
        responsiveColumns = Math.min(responsiveColumns, 1)
      } else if (width < 768) {
        // Mobile/tablet: max 2 columns
        responsiveColumns = Math.min(responsiveColumns, 2)
      } else if (width < 1024) {
        // Tablet: max 3 columns
        responsiveColumns = Math.min(responsiveColumns, 3)
      } else if (width < 1280) {
        // Small desktop: max 4 columns
        responsiveColumns = Math.min(responsiveColumns, 4)
      }
      // Large desktop: use full user setting

      setColumns(responsiveColumns)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [settings.columns])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">正在加载照片...</div>
      </div>
    )
  }

  const validColumns = Math.max(1, Math.min(Math.floor(Number(columns) || 4), 10))

  if (!Number.isFinite(validColumns) || validColumns < 1) {
    console.error("[v0] Invalid columns value:", columns, validColumns)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">布局配置错误，请重置设置</div>
      </div>
    )
  }

  const photoColumns: Photo[][] = Array.from({ length: validColumns }, () => [])
  const columnHeights = Array(validColumns).fill(0)

  photosWithDimensions.forEach((photo, index) => {
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    photoColumns[shortestColumnIndex].push({ ...photo, originalIndex: index })
    columnHeights[shortestColumnIndex] += (photo.height || 600) / (photo.width || 800)
  })

  return (
    <div
      ref={gridRef}
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${validColumns}, minmax(0, 1fr))`,
        gap: `${settings.gap}px`,
      }}
    >
      {photoColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col" style={{ gap: `${settings.gap}px` }}>
          {column.map((photo) => (
            <PhotoCard
              key={photo.originalIndex}
              photo={photo}
              onClick={() => onPhotoClick(photo.originalIndex!)}
              borderRadius={settings.borderRadius}
            />
          ))}
        </div>
      ))}
    </div>
  )
}