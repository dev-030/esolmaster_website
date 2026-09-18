'use client';
import { useEffect, useRef, useState } from "react"

export type TabKey = "All" | "Students" | "Teachers"

const TABS: TabKey[] = ["All", "Students", "Teachers"]
export const UserTabs = ({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (t: TabKey) => void
}) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [prevIndex, setPrevIndex] = useState(0)

  useEffect(() => {
    const el = tabRefs.current[active]
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [active])

  const handleClick = (tab: TabKey) => {
    setPrevIndex(TABS.indexOf(active))
    onChange(tab)
  }

  return (
    <div className="relative flex gap-1 -mb-[1px]">
      {TABS.map((tab) => (
        <button
          key={tab}
          ref={(el) => { tabRefs.current[tab] = el }}
          onClick={() => handleClick(tab)}
          className={`px-3.5 py-2.5 text-xs sm:text-[13px] font-medium transition-colors relative z-10 whitespace-nowrap cursor-pointer ${
            active === tab ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {tab}
        </button>
      ))}

      {/* Animated bottom border indicator */}
      <span
        className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-in-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  )
}

