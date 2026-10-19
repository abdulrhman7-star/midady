'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    
    // Proactively reload on chunk load errors
    if (error.name === 'ChunkLoadError' || error.message.includes('ChunkLoadError')) {
      window.location.reload();
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4">It looks like a required file failed to load.</p>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  )
}
