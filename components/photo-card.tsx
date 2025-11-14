"use client"

import { useState } from "react"
import Image from "next/image"
import type { Photo } from "@/lib/photo-data"

interface PhotoCardProps {
  photo: Photo
  onClick: () => void
  borderRadius?: number
}

export function PhotoCard({ photo, onClick, borderRadius = 12 }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  return (
    <div
      className="group relative overflow-hidden bg-muted cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/5"
      style={{ aspectRatio: `${photo.width} / ${photo.height}`, borderRadius: `${borderRadius}px` }}
      onClick={onClick}
    >
      {/* Lazy load trigger */}
      <div
        ref={(node) => {
          if (!node) return
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setIsInView(true)
                observer.disconnect()
              }
            },
            { rootMargin: "150px" },
          )
          observer.observe(node)
        }}
      />

      {isInView && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
          )}

          <Image
            src={photo.url || "/placeholder.svg"}
            alt={photo.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className={`object-cover transition-all duration-500 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } group-hover:scale-105`}
            onLoad={() => setIsLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base line-clamp-2 mb-0.5 sm:mb-1 text-balance">
                {photo.title}
              </h3>
              {photo.description && (
                <p className="text-white/90 text-[10px] sm:text-xs md:text-sm line-clamp-2 text-pretty">{photo.description}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}