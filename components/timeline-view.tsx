"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { Photo } from "@/lib/photo-data"

interface TimelineViewProps {
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

export function TimelineView({ photos, onPhotoClick }: TimelineViewProps) {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const photosByDate = photos.reduce(
    (acc, photo, index) => {
      if (!photo.takenAt) return acc

      const date = new Date(photo.takenAt)
      const year = date.getFullYear().toString()
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const day = `${month}-${String(date.getDate()).padStart(2, "0")}`

      if (!acc[year]) acc[year] = {}
      if (!acc[year][month]) acc[year][month] = {}
      if (!acc[year][month][day]) acc[year][month][day] = []

      acc[year][month][day].push({ ...photo, originalIndex: index })
      return acc
    },
    {} as Record<string, Record<string, Record<string, (Photo & { originalIndex: number })[]>>>,
  )

  const years = Object.keys(photosByDate).sort((a, b) => Number(b) - Number(a))

  const toggleYear = (year: string) => {
    const newSet = new Set(expandedYears)
    if (newSet.has(year)) {
      newSet.delete(year)
    } else {
      newSet.add(year)
    }
    setExpandedYears(newSet)
  }

  const toggleMonth = (month: string) => {
    const newSet = new Set(expandedMonths)
    if (newSet.has(month)) {
      newSet.delete(month)
    } else {
      newSet.add(month)
    }
    setExpandedMonths(newSet)
  }

  const toggleDay = (day: string) => {
    const newSet = new Set(expandedDays)
    if (newSet.has(day)) {
      newSet.delete(day)
    } else {
      newSet.add(day)
    }
    setExpandedDays(newSet)
  }

  const getMonthName = (month: string) => {
    const [, m] = month.split("-")
    return `${Number(m)}月`
  }

  const getDayName = (day: string) => {
    const [, , d] = day.split("-")
    return `${Number(d)}日`
  }

  const countPhotosInYear = (year: string) => {
    return Object.values(photosByDate[year]).reduce(
      (sum, months) => sum + Object.values(months).reduce((s, days) => s + days.length, 0),
      0,
    )
  }

  const countPhotosInMonth = (year: string, month: string) => {
    return Object.values(photosByDate[year][month]).reduce((sum, days) => sum + days.length, 0)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-3 sm:space-y-4">
          {/* Year Header */}
          <button
            onClick={() => toggleYear(year)}
            className="flex items-center gap-2 sm:gap-3 w-full hover:bg-accent/50 p-2 rounded-lg transition-colors"
          >
            {expandedYears.has(year) ? (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{year}年</h2>
            <div className="flex-1 h-px bg-border ml-3 sm:ml-4" />
            <span className="text-xs sm:text-sm text-muted-foreground">{countPhotosInYear(year)} 张</span>
          </button>

          {/* Months */}
          {expandedYears.has(year) && (
            <div className="ml-4 sm:ml-8 space-y-4 sm:space-y-6">
              {Object.keys(photosByDate[year])
                .sort((a, b) => b.localeCompare(a))
                .map((month) => (
                  <div key={month} className="space-y-2 sm:space-y-3">
                    {/* Month Header */}
                    <button
                      onClick={() => toggleMonth(month)}
                      className="flex items-center gap-2 sm:gap-3 w-full hover:bg-accent/50 p-1.5 sm:p-2 rounded-lg transition-colors"
                    >
                      {expandedMonths.has(month) ? (
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      )}
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">{getMonthName(month)}</h3>
                      <div className="flex-1 h-px bg-border ml-2 sm:ml-3" />
                      <span className="text-xs text-muted-foreground">{countPhotosInMonth(year, month)} 张</span>
                    </button>

                    {/* Days */}
                    {expandedMonths.has(month) && (
                      <div className="ml-4 sm:ml-6 space-y-3 sm:space-y-4">
                        {Object.keys(photosByDate[year][month])
                          .sort((a, b) => b.localeCompare(a))
                          .map((day) => (
                            <div key={day} className="space-y-2">
                              {/* Day Header */}
                              <button
                                onClick={() => toggleDay(day)}
                                className="flex items-center gap-1.5 sm:gap-2 w-full hover:bg-accent/50 p-1 rounded-lg transition-colors"
                              >
                                {expandedDays.has(day) ? (
                                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                )}
                                <h4 className="text-base sm:text-lg font-medium text-foreground">{getDayName(day)}</h4>
                                <div className="flex-1 h-px bg-border ml-1.5 sm:ml-2" />
                                <span className="text-xs text-muted-foreground">
                                  {photosByDate[year][month][day].length} 张
                                </span>
                              </button>

                              {/* Photos Grid */}
                              {expandedDays.has(day) && (
                                <div className="ml-3 sm:ml-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                                  {photosByDate[year][month][day].map((photo) => (
                                    <div
                                      key={photo.originalIndex}
                                      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
                                      onClick={() => onPhotoClick(photo.originalIndex)}
                                    >
                                      <Image
                                        src={photo.url || "/placeholder.svg"}
                                        alt={photo.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                                        unoptimized
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
                                          <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {years.length === 0 && <div className="text-center py-12 text-muted-foreground">没有找到符合条件的照片</div>}
    </div>
  )
}