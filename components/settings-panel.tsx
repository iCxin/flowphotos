"use client"

import { Settings } from "lucide-react"
import { useLayoutSettings } from "@/hooks/use-layout-settings"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings, resetSettings } = useLayoutSettings()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all hover:scale-105 active:scale-95"
          aria-label="布局设置"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">布局</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xs sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">布局设置</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">自定义当前设备的照片展示布局，调整后立即生效</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Columns */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-medium">每行照片数量</Label>
              <span className="text-xs text-muted-foreground font-mono">{settings.columns} 列</span>
            </div>
            <Slider
              value={[settings.columns]}
              onValueChange={(value) => updateSettings({ columns: value[0] })}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">移动端会自动调整为更少的列数</p>
          </div>

          {/* Gap */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-medium">图片间距</Label>
              <span className="text-xs text-muted-foreground font-mono">{settings.gap}px</span>
            </div>
            <Slider
              value={[settings.gap]}
              onValueChange={(value) => updateSettings({ gap: value[0] })}
              min={0}
              max={32}
              step={4}
              className="w-full"
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-medium">圆角弧度</Label>
              <span className="text-xs text-muted-foreground font-mono">{settings.borderRadius}px</span>
            </div>
            <Slider
              value={[settings.borderRadius]}
              onValueChange={(value) => updateSettings({ borderRadius: value[0] })}
              min={0}
              max={32}
              step={2}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetSettings()
            }}
            className="w-full text-xs sm:text-sm sm:w-auto"
          >
            恢复默认
          </Button>
          <Button onClick={() => setIsOpen(false)} className="w-full text-xs sm:text-sm sm:w-auto">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}