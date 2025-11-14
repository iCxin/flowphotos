export interface ExifData {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number
  dateTime?: string
  flash?: string
  exposureMode?: string
  whiteBalance?: string
}

export interface GeoLocation {
  latitude: number
  longitude: number
  city?: string
  country?: string
  address?: string
}

export interface Photo {
  id: number
  url: string
  title: string
  description?: string
  width?: number
  height?: number
  originalIndex?: number
  exif?: ExifData
  location?: GeoLocation
  takenAt?: string
  albumId?: number
}

export interface Album {
  id: number
  name: string
  description?: string
  coverPhotoId: number
  photoCount: number
  createdAt: string
}

export const photos: Photo[] = []

export const albums: Album[] = [
  {
    id: 1,
    name: "自然风光",
    description: "大自然的壮丽景色",
    coverPhotoId: 1,
    photoCount: 15,
    createdAt: "2024-09-01",
  },
  {
    id: 2,
    name: "海洋之美",
    description: "海洋和海滩摄影作品",
    coverPhotoId: 2,
    photoCount: 8,
    createdAt: "2024-08-15",
  },
  {
    id: 3,
    name: "城市印象",
    description: "现代城市建筑与夜景",
    coverPhotoId: 4,
    photoCount: 12,
    createdAt: "2024-07-10",
  },
  {
    id: 4,
    name: "花卉世界",
    description: "各种美丽的花卉特写",
    coverPhotoId: 5,
    photoCount: 10,
    createdAt: "2024-05-01",
  },
]
