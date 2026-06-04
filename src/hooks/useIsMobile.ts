import { useEffect, useState } from "react"

const MOBILE_QUERY = "(max-width: 768px)"

export function useIsMobile(breakpointQuery = MOBILE_QUERY): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(breakpointQuery).matches
  })

  useEffect(() => {
    const media = window.matchMedia(breakpointQuery)
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [breakpointQuery])

  return isMobile
}
