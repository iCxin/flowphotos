"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/components/header"
import { PhotoGrid } from "@/components/photo-grid"
import { Lightbox } from "@/components/lightbox"
import { SkeletonGrid } from "@/components/skeleton-grid"
import { FilterPanel } from "@/components/filter-panel"
import { TimelineView } from "@/components/timeline-view"
import { fetchRemotePhotos } from "@/lib/remote-photo-loader"
import { ArrowUp } from "lucide-react"
import type { Photo } from "@/lib/photo-data"

type ViewMode = "grid" | "timeline"
type SortMode = "date-desc" | "date-asc"

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>("date-desc")
  const loaderRef = useRef<HTMLDivElement>(null)

  const [searchTitle, setSearchTitle] = useState("")
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string } | null>(null)

  useEffect(() => {
    const loadRemotePhotos = async () => {
      setIsInitialLoading(true)
      const remotePhotos = await fetchRemotePhotos()

      console.log("[v0] Loaded", remotePhotos.length, "photos from remote config")
      setPhotos(remotePhotos)
      setHasMore(false)
      setIsInitialLoading(false)
    }

    loadRemotePhotos()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let result = [...photos]

    if (searchTitle) {
      result = result.filter((photo) => photo.title.toLowerCase().includes(searchTitle.toLowerCase()))
    }

    if (selectedCamera !== null) {
      result = result.filter((photo) => photo.exif?.camera === selectedCamera)
    }

    if (selectedDateRange) {
      result = result.filter((photo) => {
        if (!photo.takenAt) return false
        const photoDate = new Date(photo.takenAt).toISOString().split("T")[0]
        return photoDate >= selectedDateRange.start && photoDate <= selectedDateRange.end
      })
    }

    // Sort
    switch (sortMode) {
      case "date-desc":
        result.sort((a, b) => {
          if (!a.takenAt) return 1
          if (!b.takenAt) return -1
          return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
        })
        break
      case "date-asc":
        result.sort((a, b) => {
          if (!a.takenAt) return 1
          if (!b.takenAt) return -1
          return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
        })
        break
    }

    setFilteredPhotos(result)
  }, [photos, viewMode, sortMode, searchTitle, selectedCamera, selectedDateRange])

  const loadMorePhotos = useCallback(() => {
    if (isLoading || !hasMore) return
    setIsLoading(false)
  }, [isLoading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePhotos()
        }
      },
      { threshold: 0.1 },
    )

    const currentLoader = loaderRef.current
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loadMorePhotos, hasMore, isLoading])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setCurrentIndex(null)
  }

  const goToPrevious = () => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex !== null && currentIndex < filteredPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePhotosUploaded = (
    uploadedPhotos: Array<{
      url: string
      title: string
      width: number
      height: number
      exif?: any
      takenAt?: string
    }>,
  ) => {
    const newPhotos: Photo[] = uploadedPhotos.map((photo, index) => ({
      id: uploadedPhotos.length + photos.length + index,
      ...photo,
      category: "上传照片",
    }))
    setPhotos((prev) => [...newPhotos, ...prev])
    console.log("[v0] Added uploaded photos:", newPhotos)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        {showFilters && (
          <FilterPanel
            sortMode={sortMode}
            onSortChange={setSortMode}
            allPhotos={photos}
            searchTitle={searchTitle}
            onSearchTitleChange={setSearchTitle}
            selectedCamera={selectedCamera}
            onCameraChange={setSelectedCamera}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />
        )}

        {isInitialLoading ? (
          <SkeletonGrid />
        ) : viewMode === "timeline" ? (
          <TimelineView photos={filteredPhotos} onPhotoClick={openLightbox} />
        ) : (
          <PhotoGrid photos={filteredPhotos} onPhotoClick={openLightbox} />
        )}

        {/* Infinite scroll loader */}
        {viewMode === "grid" && (
          <div ref={loaderRef} className="flex justify-center py-8 sm:py-12">
            {isLoading && (
              <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground animate-in fade-in">
                <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-xs sm:text-sm font-medium">加载更多照片...</span>
              </div>
            )}
            {!hasMore && photos.length > 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground font-medium animate-in fade-in">已加载全部照片</p>
            )}
          </div>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-4"
          aria-label="回到顶部"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}

      {currentIndex !== null && (
        <Lightbox
          photo={filteredPhotos[currentIndex]}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < filteredPhotos.length - 1}
          currentIndex={currentIndex + 1}
          totalCount={filteredPhotos.length}
        />
      )}
    </div>
  )
}