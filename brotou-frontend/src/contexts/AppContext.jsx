import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('brotou_usuario')
    return saved ? JSON.parse(saved) : null
  })
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('brotou_admin')
    return saved ? JSON.parse(saved) : null
  })
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800)
  }, [])

  const loginUsuario = useCallback((u) => {
    setUsuario(u)
    localStorage.setItem('brotou_usuario', JSON.stringify(u))
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
