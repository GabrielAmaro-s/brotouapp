import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)
const USER_STORAGE_KEY = 'brotou_usuario'
const USER_ID_STORAGE_KEY = 'brotou_cliente_id'
const USER_TOKEN_STORAGE_KEY = 'brotou_token'
const ADMIN_STORAGE_KEY = 'brotou_admin'
const ADMIN_TOKEN_STORAGE_KEY = 'brotou_admin_token'

function safeParse(key) {
  try {
    const val = localStorage.getItem(key)
    if (!val || val === 'undefined' || val === 'null') return null
    return JSON.parse(val)
  } catch {
    return null
  }
}

function getUsuarioInicial() {
  const usuario = safeParse(USER_STORAGE_KEY) || safeParseSession(USER_STORAGE_KEY)
  if (usuario?.id) {
    const id = String(usuario.id)
    if (localStorage.getItem(USER_STORAGE_KEY)) {
      localStorage.setItem(USER_ID_STORAGE_KEY, id)
    } else {
      sessionStorage.setItem(USER_ID_STORAGE_KEY, id)
    }
  }
  return usuario
}

function safeParseSession(key) {
  try {
    const val = sessionStorage.getItem(key)
    if (!val || val === 'undefined' || val === 'null') return null
    return JSON.parse(val)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(getUsuarioInicial)
  const [clienteId, setClienteId] = useState(() => (
    localStorage.getItem(USER_ID_STORAGE_KEY) ||
    sessionStorage.getItem(USER_ID_STORAGE_KEY) ||
    ''
  ))
  const [admin, setAdmin] = useState(() => safeParse(ADMIN_STORAGE_KEY))
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800)
  }, [])

  const loginUsuario = useCallback((u, token, options = {}) => {
    const manterConectado = options.manterConectado !== false
    const storage = manterConectado ? localStorage : sessionStorage
    const storageParaLimpar = manterConectado ? sessionStorage : localStorage

    setUsuario(u)
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
    storageParaLimpar.removeItem(USER_STORAGE_KEY)
    storageParaLimpar.removeItem(USER_ID_STORAGE_KEY)
    storageParaLimpar.removeItem(USER_TOKEN_STORAGE_KEY)

    if (u?.id) {
      const id = String(u.id)
      setClienteId(id)
      storage.setItem(USER_ID_STORAGE_KEY, id)
    }
    if (token) {
      storage.setItem(USER_TOKEN_STORAGE_KEY, token)
    }
  }, [])

  const logoutUsuario = useCallback(() => {
    setUsuario(null)
    setClienteId('')
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_ID_STORAGE_KEY)
    localStorage.removeItem(USER_TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(USER_ID_STORAGE_KEY)
    sessionStorage.removeItem(USER_TOKEN_STORAGE_KEY)
  }, [])

  const loginAdmin = useCallback((a, token) => {
    setAdmin(a)
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(a))
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
  }, [])

  const logoutAdmin = useCallback(() => {
    setAdmin(null)
    localStorage.removeItem(ADMIN_STORAGE_KEY)
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
  }, [])

  return (
    <AppContext.Provider value={{
      usuario, clienteId, loginUsuario, logoutUsuario,
      admin, loginAdmin, logoutAdmin,
      toast
    }}>
      {children}
      <div id="toast" className={toastVisible ? 'show' : ''}>{toastMsg}</div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
