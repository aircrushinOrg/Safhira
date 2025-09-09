"use client"

import { useEffect, useState } from "react"
import MythListClient from "./MythListClient"

type Item = { id: string; text: string; fact?: string }

export function TiltedScrollDemo() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let active = true
    fetch("/api/myths")
      .then((res) => res.json())
      .then((data: { id: string; myth: string; fact: string }[]) => {
        if (!active) return
        const mapped = data.map((d) => ({ id: d.id, text: d.myth, fact: d.fact }))
        setItems(mapped)
      })
      .catch(() => setItems([]))
    return () => {
      active = false
    }
  }, [])

  return <MythListClient items={items} />
}
