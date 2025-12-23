import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { api } from './api'

// Shared across all component instances to prevent duplicate requests from StrictMode
const pendingRequests = new Set<string>()

function NamePage() {
  const { name } = useParams<{ name: string }>()
  const [maxCountBoth, setMaxCountBoth] = useState<number | null>(null)
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    if (!name || !/^[a-zA-Z]+$/.test(name)) {
      return
    }
    
    // Skip if there's already a pending request for this name
    // (This prevents duplicate requests from StrictMode double-invoke)
    if (pendingRequests.has(name)) {
      return
    }
    
    // Mark this name as pending
    pendingRequests.add(name)
    const currentRequestId = ++requestIdRef.current
    
    const fetchNameHistory = async () => {
      try {
        const result = await api.get_name_history.query({ name })
        // Only update state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          if ('Ok' in result) {
            const maxCount = Math.max(...result.Ok.count_both.map((count: bigint) => Number(count)))
            setMaxCountBoth(maxCount)
          } else {
            console.error('Error fetching name history:', result.Err)
          }
        }
      } catch (error) {
        // Only log error if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          console.error('Failed to fetch name history:', error)
        }
      } finally {
        // Remove from pending set
        pendingRequests.delete(name)
      }
    }

    fetchNameHistory()
    
    // Note: We don't clear pendingRequests in cleanup because:
    // 1. The finally block will clear it when the request completes
    // 2. If we clear it in cleanup, StrictMode's second run will see it as available again
    // 3. This ensures only one request is in flight at a time
  }, [name])
  
  if (!name || !/^[a-zA-Z]+$/.test(name)) {
    return null
  }
  
  return <div>{maxCountBoth !== null ? `Maximum count_both: ${maxCountBoth}` : 'Loading...'}</div>
}

export default NamePage

