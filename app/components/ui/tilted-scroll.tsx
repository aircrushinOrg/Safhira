"use client"

import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./tooltip"
import { ChevronUp, ChevronDown } from "lucide-react"

interface TiltedScrollItem {
  id: string;
  text: string;
  fact?: string;
}

interface TiltedScrollProps {
  items?: TiltedScrollItem[];
  className?: string;
  onItemClick?: (item: TiltedScrollItem) => void;
}

export function TiltedScroll({ 
  items = defaultItems,
  className,
  onItemClick,
}: TiltedScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
  const [currentScrollOffset, setCurrentScrollOffset] = useState(0)
  const animationRef = useRef<number | null>(null)
  
  // Create duplicated items for infinite scroll (duplicate to ensure seamless loop)
  const infiniteItems = [...items, ...items]

  // Manual scroll functions
  const scrollUp = () => {
    setIsAutoScrollPaused(true)
    setCurrentScrollOffset(prev => prev + 120) // Move up (positive direction)
    
    // Resume auto scroll after 3 seconds
    setTimeout(() => setIsAutoScrollPaused(false), 3000)
  }

  const scrollDown = () => {
    setIsAutoScrollPaused(true)
    setCurrentScrollOffset(prev => prev - 120) // Move down (negative direction)
    
    // Resume auto scroll after 3 seconds
    setTimeout(() => setIsAutoScrollPaused(false), 3000)
  }

  // Auto scroll animation
  useEffect(() => {
    if (isAutoScrollPaused) return

    const animate = () => {
      setCurrentScrollOffset(prev => {
        const newOffset = prev - 0.5 // Continuous downward scroll
        
        // Reset when we've scrolled through one full set
        const itemHeight = 120 // Approximate item height including gap
        const resetPoint = -items.length * itemHeight
        
        if (newOffset <= resetPoint) {
          return 0 // Reset to top
        }
        
        return newOffset
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAutoScrollPaused, items.length])

  // Apply transform styles via useEffect to avoid inline styles
  useEffect(() => {
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current
      element.style.transform = `translateY(${currentScrollOffset}px)`
      element.style.transitionDuration = isAutoScrollPaused ? '0.3s' : '0s'
      element.style.transitionTimingFunction = 'ease-linear'
      element.style.transitionProperty = 'transform'
    }
  }, [currentScrollOffset, isAutoScrollPaused])

  // Add wheel scroll functionality with hover detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current?.parentElement
    if (!scrollContainer) return

    let isHovered = false

    const handleMouseEnter = () => {
      isHovered = true
    }

    const handleMouseLeave = () => {
      isHovered = false
    }

    const handleWheel = (e: WheelEvent) => {
      if (!isHovered) return // Only handle wheel when hovering over the scroll area
      
      e.preventDefault() // Prevent page scroll
      e.stopPropagation()
      
      const scrollDirection = e.deltaY > 0 ? 'down' : 'up'
      const scrollAmount = Math.abs(e.deltaY) * 0.8 // Adjust sensitivity
      
      setIsAutoScrollPaused(true)
      
      setCurrentScrollOffset(prev => {
        let newOffset = prev
        
        if (scrollDirection === 'down') {
          newOffset = prev - scrollAmount
        } else {
          newOffset = prev + scrollAmount
        }
        
        // Handle infinite loop
        const itemHeight = 120
        const resetPoint = -items.length * itemHeight
        const topPoint = itemHeight * 2
        
        if (newOffset <= resetPoint) {
          return 0 // Reset to top when scrolled too far down
        } else if (newOffset >= topPoint) {
          return resetPoint + itemHeight // Jump to bottom when scrolled too far up
        }
        
        return newOffset
      })
      
      // Resume auto scroll after 3 seconds
      setTimeout(() => setIsAutoScrollPaused(false), 3000)
    }

    // Add event listeners
    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      scrollContainer.removeEventListener('wheel', handleWheel)
    }
  }, [items.length])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="relative overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)]">
        <div className="w-[360px] h-[320px] sm:w-[480px] sm:h-[380px] md:w-[560px] md:h-[420px] overflow-hidden scroll-area cursor-grab active:cursor-grabbing">
          <div 
            ref={scrollContainerRef}
            className="grid gap-5 grid-cols-1 tilted-scroll-grid"
          >
          {infiniteItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => onItemClick?.(item)}
              aria-label={`Open myth ${item.text}`}
              className="group relative flex items-center gap-3 cursor-pointer rounded-lg border border-border/40 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 p-5 md:p-6 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:border-blue-300/60 dark:border-gray-700 dark:hover:border-blue-500/40 card-tilt"
            >
              {/* Click indicator with improved styling */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm flex items-center justify-center shadow-lg border border-blue-200/30 dark:border-blue-400/20">
                  <div className="w-4 h-4 text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Enhanced icon with better styling */}
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"></div>
                <CheckCircleIcon className="relative h-8 w-8 md:h-9 md:w-9 stroke-[1.5] text-foreground/50 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110" />
              </div>
              
              {/* Enhanced text with better typography */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground/85 text-base md:text-lg font-medium leading-relaxed transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 line-clamp-3">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Add scrollbar-hide utility and tilted card styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .tilted-scroll-grid {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .card-tilt {
          transform: rotateX(2deg) rotateY(-1deg);
          transform-origin: center center;
          backface-visibility: hidden;
          will-change: transform;
        }
        
        .card-tilt:nth-child(even) {
          transform: rotateX(-1deg) rotateY(1deg);
        }
        
        .card-tilt:nth-child(3n) {
          transform: rotateX(1deg) rotateY(-2deg);
        }
        
        .card-tilt:hover {
          transform: rotateX(0deg) rotateY(0deg) scale(1.02) translateY(-4px) !important;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(59, 130, 246, 0.1);
        }
        
        .dark .card-tilt:hover {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.4),
            0 10px 10px -5px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(59, 130, 246, 0.2);
        }
        
        .card-tilt:active {
          transform: rotateX(1deg) rotateY(-0.5deg) scale(0.98) !important;
        }
        
        .scroll-area {
          position: relative;
        }
        
        .scroll-area:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          z-index: 10;
          animation: scroll-hint 2s ease-in-out infinite;
        }
        
        @keyframes scroll-hint {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.005);
          }
        }
        
        .scroll-area:hover {
          transition: all 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

const defaultItems: TiltedScrollItem[] = [
  { id: "1", text: "Item 1" },
  { id: "2", text: "Item 2" },
  { id: "3", text: "Item 3" },
  { id: "4", text: "Item 4" },
  { id: "5", text: "Item 5" },
  { id: "6", text: "Item 6" },
  { id: "7", text: "Item 7" },
  { id: "8", text: "Item 8" },
]
