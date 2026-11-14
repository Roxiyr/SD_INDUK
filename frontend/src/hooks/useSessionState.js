import { useEffect, useState } from 'react'

function useSessionState(key, initialValue, allowedValues) {
  const [value, setValue] = useState(() => {
    const savedValue = sessionStorage.getItem(key)
    return allowedValues.includes(savedValue) ? savedValue : initialValue
  })

  useEffect(() => {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key)
      return
    }

    sessionStorage.setItem(key, value)
  }, [key, value])

  return [value, setValue]
}

export default useSessionState
