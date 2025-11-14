"use client"

import { X } from "lucide-react"

interface FilterPanelProps {
  sortMode: string
  onSortChange: (mode: any) => void
  allPhotos: any[]
  searchTitle: string
  onSearchTitleChange: (value: string) => void
  selectedCamera: string | null
  onCameraChange: (camera: string | null) => void
  selectedDateRange: { start: string; end: string } | null
  onDateRangeChange: (range: { start: string; end: string } | null) => void
}

export function FilterPanel({
  sortMode,
  onSortChange,
  allPhotos,
  searchTitle,
  onSearchTitleChange,
  selectedCamera,
  onCameraChange,
  selectedDateRange,
  onDateRangeChange,
}: FilterPanelProps) {
  const uniqueCameras = Array.from(
    new Set(allPhotos.map((photo) => photo.exif?.camera).filter((camera): camera is string => !!camera)),
  )

  const clearFilters = () => {
    onSearchTitleChange("")
    onCameraChange(null)
    onDateRangeChange(null)
  }

  const hasActiveFilters =
    searchTitle !== "" || selectedCamera !== null || selectedDateRange !== null

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-xl border border-border/50 animate-in slide-in-from-top duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">筛选和排序</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-background transition-colors self-start sm:self-auto"
          >
            <X className="h-3 w-3" />
            <span className="hidden xs:inline">清除筛选</span>
          </button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">按标题搜索</label>
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => onSearchTitleChange(e.target.value)}
            placeholder="输入照片标题..."
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">按时间筛选</label>
          <div className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-center">
            <input
              type="date"
              value={selectedDateRange?.start || ""}
              onChange={(e) => {
                const newStart = e.target.value
                if (newStart) {
                  onDateRangeChange({
                    start: newStart,
                    end: selectedDateRange?.end || newStart,
                  })
                } else if (!selectedDateRange?.end) {
                  onDateRangeChange(null)
                }
              }}
              className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-xs sm:text-sm text-muted-foreground text-center xs:text-left">至</span>
            <input
              type="date"
              value={selectedDateRange?.end || ""}
              onChange={(e) => {
                const newEnd = e.target.value
                if (newEnd) {
                  onDateRangeChange({
                    start: selectedDateRange?.start || newEnd,
                    end: newEnd,
                  })
                } else if (!selectedDateRange?.start) {
                  onDateRangeChange(null)
                }
              }}
              className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {uniqueCameras.length > 0 && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">
              按拍照设备筛选
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => onCameraChange(null)}
                className={`px-2 sm:px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                  selectedCamera === null
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                全部设备
              </button>
              {uniqueCameras.map((camera) => (
                <button
                  key={camera}
                  onClick={() => onCameraChange(camera)}
                  className={`px-2 sm:px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                    selectedCamera === camera
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {camera}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">排序方式</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => onSortChange("date-desc")}
              className={`px-2 sm:px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                sortMode === "date-desc"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              最新优先
            </button>
            <button
              onClick={() => onSortChange("date-asc")}
              className={`px-2 sm:px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                sortMode === "date-asc"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              最早优先
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}