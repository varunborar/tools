import * as React from "react"

function getSecureRandomInt(maxExclusive) {
  const uint32 = new Uint32Array(1)
  window.crypto.getRandomValues(uint32)
  return uint32[0] % maxExclusive
}

function shuffleArraySecure(items) {
  const array = items.slice()
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomInt(i + 1)
    const tmp = array[i]
    array[i] = array[j]
    array[j] = tmp
  }
  return array
}

function generatePassword({ length, includeUppercase, includeLowercase, includeNumbers, includeSymbols }) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>?/"

  const enabledSets = []
  if (includeUppercase) enabledSets.push(uppercase)
  if (includeLowercase) enabledSets.push(lowercase)
  if (includeNumbers) enabledSets.push(numbers)
  if (includeSymbols) enabledSets.push(symbols)

  if (enabledSets.length === 0 || length <= 0) return ""

  const allChars = enabledSets.join("")

  const ensured = []
  for (const set of enabledSets) {
    ensured.push(set[getSecureRandomInt(set.length)])
  }

  const remainingLength = Math.max(0, length - ensured.length)
  const rest = []
  for (let i = 0; i < remainingLength; i += 1) {
    rest.push(allChars[getSecureRandomInt(allChars.length)])
  }

  const combined = shuffleArraySecure([...ensured, ...rest])
  return combined.join("")
}

export function usePasswordGenerator(initial = {}) {
  const [length, setLength] = React.useState(initial.length ?? 16)
  const [includeUppercase, setIncludeUppercase] = React.useState(initial.includeUppercase ?? true)
  const [includeLowercase, setIncludeLowercase] = React.useState(initial.includeLowercase ?? true)
  const [includeNumbers, setIncludeNumbers] = React.useState(initial.includeNumbers ?? true)
  const [includeSymbols, setIncludeSymbols] = React.useState(initial.includeSymbols ?? false)
  const [password, setPassword] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [history, setHistory] = React.useState([])

  const STORAGE_KEY = "tools.passwordGenerator.history"

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 5))
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 5)))
    } catch {
      // ignore
    }
  }, [history])

  const regenerate = React.useCallback(() => {
    const next = generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    })
    setPassword(next)
    setCopied(false)
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols])

  React.useEffect(() => {
    regenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    regenerate()
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols])


  const handleCopy = React.useCallback(async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      // Add to history on successful copy
      setHistory((prev) => {
        const next = [password, ...prev.filter((p) => p !== password)]
        return next.slice(0, 5)
      })
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }, [password])

  const clearHistory = React.useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const nothingSelected = !includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols

  return {
    // state
    password,
    copied,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    nothingSelected,
    history,
    // actions
    setLength,
    setIncludeUppercase,
    setIncludeLowercase,
    setIncludeNumbers,
    setIncludeSymbols,
    regenerate,
    handleCopy,
    clearHistory,
    copyFromHistory: async (value) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      } catch {
        // ignore
      }
    },
  }
}


