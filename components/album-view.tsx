"use client"

import Image from "next/image"
import { Folder, Construction } from "lucide-react"
import type { Album, Photo } from "@/lib/photo-data"

interface AlbumViewProps {
  albums: Album[]
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

export function AlbumView({ albums, photos, onPhotoClick }: AlbumViewProps) {
  const getAlbumPhotos = (albumId: number) => {
    return photos.filter((photo) => photo.albumId === albumId)
  }

  const getCoverPhoto = (albumId: number) => {
    const albumPhotos = getAlbumPhotos(albumId)
    return albumPhotos[0] || null
  }

  if (albums.every((album) => getAlbumPhotos(album.id).length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-4 sm:mb-6">
          <Construction className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">相册功能</h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md">相册功能正在开发中，敬请期待...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {albums.map((album) => {
        const albumPhotos = getAlbumPhotos(album.id)
        const coverPhoto = getCoverPhoto(album.id)

        if (albumPhotos.length === 0) return null

        return (
          <div key={album.id} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{album.name}</h2>
                {album.description && <p className="text-xs sm:text-sm text-muted-foreground">{album.description}</p>}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{albumPhotos.length} 张照片</span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
              {albumPhotos.slice(0, 12).map((photo, index) => {
                const photoIndex = photos.findIndex((p) => p.id === photo.id)
                return (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-muted cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/5 aspect-square"
                    onClick={() => onPhotoClick(photoIndex)}
                  >
                    <Image
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                        <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-1">{photo.title}</h3>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {albumPhotos.length > 12 && (
              <div className="text-center">
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  查看全部 {albumPhotos.length} 张照片
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}