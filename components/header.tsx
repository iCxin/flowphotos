"use client"

import { Camera, Grid3x3, Clock, SlidersHorizontal, Info } from "lucide-react"
import Link from "next/link"
import { SettingsPanel } from "./settings-panel"

interface HeaderProps {
  viewMode: "grid" | "timeline"
  onViewModeChange: (mode: "grid" | "timeline") => void
  onToggleFilters: () => void
  showFilters: boolean
}

export function Header({ viewMode, onViewModeChange, onToggleFilters, showFilters }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer" onClick={() => onViewModeChange("grid")}>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-11 md:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                FlowPhotos
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">精美照片画廊</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Grid3x3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">瀑布流</span>
            </button>
            <button
              onClick={() => onViewModeChange("timeline")}
              className={`flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                viewMode === "timeline"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">时间轴</span>
            </button>
            <Link
              href="/exif-reader"
              className="flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all hover:scale-105 active:scale-95"
            >
              <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">EXIF</span>
            </Link>
            <div className="hidden sm:block w-px h-4 sm:h-5 md:h-6 bg-border" />
            <button
              onClick={onToggleFilters}
              className={`flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                showFilters
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">筛选</span>
            </button>
            <SettingsPanel />
          </nav>
        </div>
      </div>
    </header>
  )
}