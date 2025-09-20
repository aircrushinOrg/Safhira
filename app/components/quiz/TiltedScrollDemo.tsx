"use client"

import MythListClient from "./MythListClient"

type Item = { id: string; text: string; fact?: string }

type TiltedScrollDemoProps = {
  featuredItems: Item[]
  allItems: Item[]
}

export function TiltedScrollDemo({ featuredItems, allItems }: TiltedScrollDemoProps) {
  const hasFeatured = featuredItems.length > 0
  const displayItems = hasFeatured ? featuredItems : allItems

  return <MythListClient items={displayItems} allItems={allItems} />
}
