"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, Camera, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Grid3X3 } from "lucide-react"
import Image from "next/image"
import type { Photo } from "@/lib/photo-data"

interface TimelineViewProps {
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

type TimelineMode = "vertical" | "horizontal"
type TimelineScale = "year" | "month" | "week" | "day"

interface TimelineEvent {
  id: string
  date: Date
  photos: Photo[]
  dateLabel: string
  photoCount: number
  originalIndexes: number[]
}

export function TimelineView({ photos, onPhotoClick }: TimelineViewProps) {
  const [mode, setMode] = useState<TimelineMode>("vertical")
  const [scale, setScale] = useState<TimelineScale>("month")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  // 生成时间轴事件
  useEffect(() => {
    if (!photos.length) {
      setTimelineEvents([])
      return
    }

    const eventsMap = new Map<string, TimelineEvent>()
    
    photos.forEach((photo, index) => {
      if (!photo.takenAt) return
      
      const photoDate = new Date(photo.takenAt)
      let eventKey: string
      let dateLabel: string

      switch (scale) {
        case "year":
          eventKey = `${photoDate.getFullYear()}`
          dateLabel = `${photoDate.getFullYear()}年`
          break
        case "month":
          eventKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}`
          dateLabel = `${photoDate.getFullYear()}年${photoDate.getMonth() + 1}月`
          break
        case "week":
          const weekStart = new Date(photoDate)
          weekStart.setDate(photoDate.getDate() - photoDate.getDay())
          eventKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
          dateLabel = `${photoDate.getFullYear()}年${photoDate.getMonth() + 1}月 第${Math.ceil((photoDate.getDate() + 6 - photoDate.getDay()) / 7)}周`
          break
        case "day":
          eventKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(2, '0')}-${String(photoDate.getDate()).padStart(2, '0')}`
          dateLabel = `${photoDate.getFullYear()}年${photoDate.getMonth() + 1}月${photoDate.getDate()}日`
          break
      }

      if (!eventsMap.has(eventKey)) {
        eventsMap.set(eventKey, {
          id: eventKey,
          date: photoDate,
          photos: [],
          dateLabel,
          photoCount: 0,
          originalIndexes: []
        })
      }

      const event = eventsMap.get(eventKey)!
      event.photos.push(photo)
      event.photoCount = event.photos.length
      event.originalIndexes.push(index)
    })

    const events = Array.from(eventsMap.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    setTimelineEvents(events)
    
    // 设置当前日期为最近的事件日期
    if (events.length > 0) {
      setCurrentDate(events[0].date)
    }
  }, [photos, scale])

  // 时间轴导航
  const navigateTimeline = (direction: "prev" | "next") => {
    if (timelineEvents.length === 0) return
    
    const currentIndex = timelineEvents.findIndex(event => 
      event.date.getTime() === currentDate.getTime()
    )
    
    if (direction === "prev" && currentIndex > 0) {
      setCurrentDate(timelineEvents[currentIndex - 1].date)
    } else if (direction === "next" && currentIndex < timelineEvents.length - 1) {
      setCurrentDate(timelineEvents[currentIndex + 1].date)
    }
  }

  // 键盘快捷键和鼠标滚轮支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "+":
          case "=":
            event.preventDefault()
            zoomIn()
            break
          case "-":
          case "_":
            event.preventDefault()
            zoomOut()
            break
          case "0":
            event.preventDefault()
            setScale("month") // 重置到默认缩放级别
            break
        }
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        if (event.deltaY < 0) {
          zoomIn()
        } else {
          zoomOut()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("wheel", handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [scale])

  // 缩放时间轴
  const zoomIn = () => {
    const scales: TimelineScale[] = ["year", "month", "week", "day"]
    const currentIndex = scales.indexOf(scale)
    if (currentIndex < scales.length - 1) {
      setScale(scales[currentIndex + 1])
      // 在缩放后，调整当前日期以保持用户视角
      const newScale = scales[currentIndex + 1]
      if (timelineEvents.length > 0) {
        const currentEvent = timelineEvents.find(event => 
          event.date.getTime() === currentDate.getTime()
        )
        if (currentEvent) {
          // 保持当前选中事件的时间点
          setCurrentDate(currentEvent.date)
        }
      }
    }
  }

  const zoomOut = () => {
    const scales: TimelineScale[] = ["year", "month", "week", "day"]
    const currentIndex = scales.indexOf(scale)
    if (currentIndex > 0) {
      setScale(scales[currentIndex - 1])
      // 在缩放后，调整当前日期以保持用户视角
      const newScale = scales[currentIndex - 1]
      if (timelineEvents.length > 0) {
        const currentEvent = timelineEvents.find(event => 
          event.date.getTime() === currentDate.getTime()
        )
        if (currentEvent) {
          // 保持当前选中事件的时间点
          setCurrentDate(currentEvent.date)
        }
      }
    }
  }

  // 直接设置缩放级别
  const setZoomLevel = (newScale: TimelineScale) => {
    setScale(newScale)
    if (timelineEvents.length > 0) {
      const currentEvent = timelineEvents.find(event => 
        event.date.getTime() === currentDate.getTime()
      )
      if (currentEvent) {
        setCurrentDate(currentEvent.date)
      }
    }
  }

  // 获取当前可见的事件
  const getVisibleEvents = () => {
    const currentIndex = timelineEvents.findIndex(event => 
      event.date.getTime() === currentDate.getTime()
    )
    
    if (mode === "horizontal") {
      // 水平模式下显示当前事件及其前后各2个事件
      const start = Math.max(0, currentIndex - 2)
      const end = Math.min(timelineEvents.length, currentIndex + 3)
      return timelineEvents.slice(start, end)
    } else {
      // 垂直模式下显示所有事件
      return timelineEvents
    }
  }

  const visibleEvents = getVisibleEvents()

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Calendar className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">没有照片可显示在时间轴上</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 时间轴控制栏 */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === "vertical" ? "horizontal" : "vertical")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
            title={mode === "vertical" ? "切换到水平时间轴" : "切换到垂直时间轴"}
          >
            {mode === "vertical" ? <Grid3X3 className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
            {mode === "vertical" ? "时间轴" : "缩略图"}
          </button>
          
          {/* 缩放控制 - 增强版 */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 border border-border rounded-md">
              <button
                onClick={zoomOut}
                disabled={scale === "year"}
                className="p-1.5 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="缩小 (Ctrl+-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              {/* 缩放级别指示器 */}
              <div className="flex items-center gap-1 px-2 border-x border-border">
                <span className="text-sm font-medium min-w-[40px] text-center">
                  {scale === "year" ? "年" : scale === "month" ? "月" : scale === "week" ? "周" : "日"}
                </span>
                <div className="flex items-center gap-0.5">
                  {["year", "month", "week", "day"].map((level, index) => (
                    <div
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        scale === level 
                          ? "bg-primary" 
                          : index < ["year", "month", "week", "day"].indexOf(scale) 
                            ? "bg-primary/50" 
                            : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={zoomIn}
                disabled={scale === "day"}
                className="p-1.5 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="放大 (Ctrl++)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            {/* 快速缩放按钮 */}
            <div className="flex items-center gap-1 border border-border rounded-md">
              <button
                onClick={() => setZoomLevel("year")}
                className={`px-2 py-1 text-xs transition-colors ${
                  scale === "year" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
                title="年视图"
              >
                年
              </button>
              <button
                onClick={() => setZoomLevel("month")}
                className={`px-2 py-1 text-xs border-x border-border transition-colors ${
                  scale === "month" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
                title="月视图 (Ctrl+0)"
              >
                月
              </button>
              <button
                onClick={() => setZoomLevel("week")}
                className={`px-2 py-1 text-xs border-r border-border transition-colors ${
                  scale === "week" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
                title="周视图"
              >
                周
              </button>
              <button
                onClick={() => setZoomLevel("day")}
                className={`px-2 py-1 text-xs transition-colors ${
                  scale === "day" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
                title="日视图"
              >
                日
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTimeline("prev")}
            disabled={timelineEvents.length === 0 || timelineEvents.findIndex(event => event.date.getTime() === currentDate.getTime()) === 0}
            className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-medium min-w-[120px] text-center">
            {timelineEvents.length > 0 ? `${timelineEvents.length} 个时间点` : "无数据"}
          </span>
          
          <button
            onClick={() => navigateTimeline("next")}
            disabled={timelineEvents.length === 0 || timelineEvents.findIndex(event => event.date.getTime() === currentDate.getTime()) === timelineEvents.length - 1}
            className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 overflow-auto">
        {mode === "vertical" ? (
          <VerticalTimeline 
            events={visibleEvents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
            onPhotoClick={onPhotoClick}
          />
        ) : (
          <HorizontalTimeline 
            events={visibleEvents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
            onPhotoClick={onPhotoClick}
            currentDate={currentDate}
          />
        )}
      </div>
    </div>
  )
}

// 垂直时间轴组件
function VerticalTimeline({ 
  events, 
  selectedEvent, 
  onEventSelect, 
  onPhotoClick 
}: { 
  events: TimelineEvent[]
  selectedEvent: string | null
  onEventSelect: (id: string | null) => void
  onPhotoClick: (index: number) => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* 时间轴线 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30" />
        
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* 时间轴节点 */}
              <div className="absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
              
              {/* 连接线（除了最后一个） */}
              {index < events.length - 1 && (
                <div className="absolute left-6 -translate-x-1/2 top-4 bottom-0 w-0.5 bg-border z-0" />
              )}
              
              {/* 事件卡片 */}
              <div 
                className={`ml-12 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  selectedEvent === event.id 
                    ? "border-primary bg-primary/5 shadow-lg" 
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                }`}
                onClick={() => onEventSelect(selectedEvent === event.id ? null : event.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {event.dateLabel}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded-full">
                    {event.photoCount} 张照片
                  </span>
                </div>
                
                {selectedEvent === event.id && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {event.photos.map((photo, photoIndex) => (
                      <div
                        key={photoIndex}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPhotoClick(event.originalIndexes[photoIndex])
                        }}
                      >
                        <Image
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 水平时间轴组件
function HorizontalTimeline({ 
  events, 
  selectedEvent, 
  onEventSelect, 
  onPhotoClick,
  currentDate 
}: { 
  events: TimelineEvent[]
  selectedEvent: string | null
  onEventSelect: (id: string | null) => void
  onPhotoClick: (index: number) => void
  currentDate: Date
}) {
  const currentIndex = events.findIndex(event => event.date.getTime() === currentDate.getTime())
  
  return (
    <div className="h-full flex flex-col">
      {/* 时间轴轨道 */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border transform -translate-y-1/2" />
        
        <div className="relative h-full flex items-center justify-center">
          {events.map((event, index) => {
            const distanceFromCenter = index - currentIndex
            const isCenter = distanceFromCenter === 0
            const isVisible = Math.abs(distanceFromCenter) <= 2
            
            if (!isVisible) return null
            
            return (
              <div
                key={event.id}
                className={`absolute transition-all duration-500 ${
                  isCenter ? "z-20 scale-100" : "z-10 scale-75 opacity-70"
                }`}
                style={{
                  left: `calc(50% + ${distanceFromCenter * 120}px)`,
                  transform: `translateX(-50%) ${isCenter ? "scale(1)" : "scale(0.8)"}`
                }}
              >
                {/* 时间轴节点 */}
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className={`w-16 h-16 rounded-full border-4 cursor-pointer transition-all duration-300 ${
                      selectedEvent === event.id 
                        ? "border-primary bg-primary/20 shadow-lg" 
                        : "border-border hover:border-primary/70"
                    } ${isCenter ? "scale-100" : "scale-75"}`}
                    onClick={() => onEventSelect(selectedEvent === event.id ? null : event.id)}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {event.photos[0] && (
                        <Image
                          src={event.photos[0].url || "/placeholder.svg"}
                          alt={event.photos[0].title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium whitespace-nowrap">{event.dateLabel}</div>
                    <div className="text-xs text-muted-foreground">{event.photoCount} 张</div>
                  </div>
                </div>
                
                {/* 照片预览 */}
                {selectedEvent === event.id && isCenter && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 p-4 bg-background border border-border rounded-lg shadow-lg z-30">
                    <div className="grid grid-cols-3 gap-2">
                      {event.photos.slice(0, 6).map((photo, photoIndex) => (
                        <div
                          key={photoIndex}
                          className="relative aspect-square rounded overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                          onClick={() => onPhotoClick(event.originalIndexes[photoIndex])}
                        >
                          <Image
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                    {event.photoCount > 6 && (
                      <div className="text-center mt-2 text-sm text-muted-foreground">
                        还有 {event.photoCount - 6} 张照片...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}