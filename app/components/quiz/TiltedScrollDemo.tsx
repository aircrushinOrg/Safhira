/**
 * Tilted scroll demo wrapper component for the interactive quiz interface.
 * This component manages the display of featured vs. all quiz items and integrates with the MythListClient for interactive learning.
 * Provides a tilted scroll animation effect for engaging user interaction with STI myths and facts.
 */
"use client"

import MythListClient from "./MythListClient"

type Item = { id: string; text: string; fact?: string; isTrue?: boolean }

type TiltedScrollDemoProps = {
  featuredItems: Item[]
  allItems: Item[]
}

export function TiltedScrollDemo({ featuredItems, allItems }: TiltedScrollDemoProps) {
  const hasFeatured = featuredItems.length > 0
  const displayItems = hasFeatured ? featuredItems : allItems

  return <MythListClient items={displayItems} allItems={allItems} />
}
