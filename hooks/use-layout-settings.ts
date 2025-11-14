"use client"

import { useState, useEffect } from "react"

export interface LayoutSettings {
  columns: number
  gap: number
  borderRadius: number
}

const defaultSettings: LayoutSettings = {
  columns: 4,
  gap: 16,
  borderRadius: 12,
}

const SETTINGS_CHANGE_EVENT = "flowphotos-settings-changed"

export function useLayoutSettings() {
  const [settings, setSettings] = useState<LayoutSettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("flowphotos-layout-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
      } catch (error) {
        console.error("Failed to parse layout settings:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent<LayoutSettings>) => {
      setSettings(event.detail)
    }

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange as EventListener)
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange as EventListener)
    }
  }, [])

  const updateSettings = (newSettings: Partial<LayoutSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("flowphotos-layout-settings", JSON.stringify(updated))

    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: updated }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.setItem("flowphotos-layout-settings", JSON.stringify(defaultSettings))

    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: defaultSettings }))
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
