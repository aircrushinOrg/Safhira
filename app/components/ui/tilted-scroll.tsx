"use client"

import { cn } from "@/lib/utils"

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
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)]">
        <div className="grid w-[360px] h-[320px] sm:w-[480px] sm:h-[380px] md:w-[560px] md:h-[420px] gap-5 animate-skew-scroll grid-cols-1">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="group flex items-center gap-3 cursor-pointer rounded-md border border-border/40 bg-card p-5 md:p-6 shadow-sm transition-all duration-200 ease-in-out hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-md dark:border-border"
            >
              <CheckCircleIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 stroke-foreground/40 transition-colors group-hover:stroke-foreground" />
              <p className="text-foreground/80 text-base md:text-lg">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
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
