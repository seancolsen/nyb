import { useParams } from 'react-router-dom'

function NamePage() {
  const { name } = useParams<{ name: string }>()
  
  if (!name || !/^[a-zA-Z]+$/.test(name)) {
    return null
  }
  
  return <div>{name}</div>
}

export default NamePage

