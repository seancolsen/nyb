import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './api'

function NamePage() {
  const { name } = useParams<{ name: string }>()
  const [maxCountBoth, setMaxCountBoth] = useState<number | null>(null)
  
  useEffect(() => {
    if (!name || !/^[a-zA-Z]+$/.test(name)) {
      return
    }
    
    const fetchNameHistory = async () => {
      try {
        const result = await api.get_name_history.query({ name })
        if ('Ok' in result) {
          const maxCount = Math.max(...result.Ok.count_both.map((count: bigint) => Number(count)))
          setMaxCountBoth(maxCount)
        } else {
          console.error('Error fetching name history:', result.Err)
        }
      } catch (error) {
        console.error('Failed to fetch name history:', error)
      }
    }

    fetchNameHistory()
  }, [name])
  
  if (!name || !/^[a-zA-Z]+$/.test(name)) {
    return null
  }
  
  return <div>{maxCountBoth !== null ? `Maximum count_both: ${maxCountBoth}` : 'Loading...'}</div>
}

export default NamePage

