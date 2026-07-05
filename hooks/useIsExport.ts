'use client'

import { useEffect, useState } from 'react'

export function useIsExport() {
  const [isExport, setIsExport] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsExport(params.get('export') === 'true' || params.get('figma') === 'true')
    }
  }, [])

  return isExport
}
