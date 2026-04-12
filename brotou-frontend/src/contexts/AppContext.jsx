import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)

function safeParse(key) {
  try {
    const val = localStorage.getItem(key)
    if (!val || val === 'undefined' || val === 'null') return null
    return JSON.parse(val)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(() => safeParse('brotou_usuario'))
  const [admin, setAdmin] = useState(() => safeParse('brotou_admin'))
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800)
  }, [])

  const loginUsuario = useCallback((u, token) => {
    setUsuario(u)
    localStorage.setItem('brotou_usuario', JSON.stringify(u))
    if (token) {
      localStorage.setItem('brotou_token', token)
    }
  }, [])

  const logoutUsuario = useCallback(() => {
    setUsuario(null)
    localStorage.removeItem('brotou_usuario')
    localStorage.removeItem('brotou_token')
  }, [])

  const loginAdmin = useCallback((a, token) => {
    setAdmin(a)
    localStorage.setItem('brotou_admin', JSON.stringify(a))
    localStorage.setItem('brotou_admin_token', token)
  }, [])

  const logoutAdmin = useCallback(() => {
    setAdmin(null)
    localStorage.removeItem('brotou_admin')
    localStorage.removeItem('brotou_admin_token')
  }, [])

  return (
    <AppContext.Provider value={{
      usuario, loginUsuario, logoutUsuario,
      admin, loginAdmin, logoutAdmin,
      toast
    }}>
      {children}
      <div id="toast" className={toastVisible ? 'show' : ''}>{toastMsg}</div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
