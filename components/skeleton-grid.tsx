"use client"

import { useEffect, useState } from "react"

export function SkeletonGrid() {
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      if (width < 480) {
        setColumns(1)
      } else if (width < 640) {
        setColumns(2)
      } else if (width < 768) {
        setColumns(2)
      } else if (width < 1024) {
        setColumns(3)
      } else if (width < 1280) {
        setColumns(4)
      } else {
        setColumns(5)
      }
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  const skeletonItems = Array.from({ length: 12 })

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-2 sm:gap-3">
          {skeletonItems.slice(columnIndex * 3, (columnIndex + 1) * 3).map((_, itemIndex) => (
            <div
              key={itemIndex}
              className="rounded-md sm:rounded-lg bg-muted animate-pulse"
              style={{
                aspectRatio: "4/3",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}