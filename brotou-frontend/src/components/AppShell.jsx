import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { adocoesApi, amizadesApi } from '../services/api'

const FOTO_LOGO = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=60&q=80'
const MAX_NOTIFICACOES = 7

function NavItem({ to, active, children }) {
  return (
    <Link to={to} className={`nav-item${active ? ' active' : ''}`}>
      {children}
    </Link>
  )
}

function formatarTempoRelativo(data) {
  if (!data) return 'Agora'

  const ts = new Date(data).getTime()
  if (Number.isNaN(ts)) return 'Agora'

  const diff = Date.now() - ts
  const minutos = Math.floor(diff / 60000)
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `Há ${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas}h`

  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'Ontem' : `Há ${dias} dias`
}

function cortarTexto(texto, limite = 96) {
  const base = String(texto || '').trim()
  if (!base) return ''
  return base.length <= limite ? base : `${base.slice(0, limite - 1)}…`
}

export default function AppShell({ children, activePage }) {
  const { usuario, logoutUsuario } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const initials = usuario?.nome?.charAt(0)?.toUpperCase() || 'U'
  const [notifAberta, setNotifAberta] = useState(false)
  const [notifCarregando, setNotifCarregando] = useState(false)
  const [notificacoes, setNotificacoes] = useState([])
  const notifRef = useRef(null)

  const handleLogout = () => {
    logoutUsuario()
    navigate('/')
  }

  const carregarNotificacoes = useCallback(async () => {
    if (!usuario?.id) {
      setNotificacoes([])
      return
    }

    setNotifCarregando(true)
    try {
      const [amizadesRes, recebidasRes, respostasRes] = await Promise.all([
        amizadesApi.listar({ tipo: 'recebidas', status: 'PENDENTE' }),
        adocoesApi.listar({ donoId: usuario.id, status: 'PENDENTE' }),
        adocoesApi.listar({ cuidadorId: usuario.id, comResposta: true }),
      ])

      const notifAmizades = (amizadesRes?.dados || []).map((amizade) => ({
        id: `amizade-${amizade.id}`,
        destino: '/amigos',
        data: amizade.criadoEm,
        titulo: 'Nova solicitação de amizade',
        detalhe: `${amizade.solicitante?.nome || 'Usuário'} quer se conectar com você.`,
      }))

      const notifRecebidas = (recebidasRes?.dados || []).map((interacao) => ({
        id: `adocao-recebida-${interacao.id}`,
        destino: '/adocoes',
        data: interacao.dataInicio,
        titulo: 'Nova interação pendente',
        detalhe: `${interacao.cuidador?.nome || 'Cliente'} enviou uma solicitação para ${interacao.planta?.apelido || 'seu item'}.`,
      }))

      const notifRespostas = (respostasRes?.dados || []).map((interacao) => ({
        id: `adocao-resposta-${interacao.id}`,
        destino: '/adocoes',
        data: interacao.emailEnviadoEm || interacao.confirmadaEm || interacao.dataInicio,
        titulo: 'Resposta em interação',
        detalhe: interacao.respostaAdmin
          ? `Mensagem da equipe: ${cortarTexto(interacao.respostaAdmin)}`
          : `Sua interação em ${interacao.planta?.apelido || 'um item'} recebeu atualização.`,
      }))

      const lista = [...notifAmizades, ...notifRecebidas, ...notifRespostas]
        .sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime())
        .slice(0, MAX_NOTIFICACOES)

      setNotificacoes(lista)
    } catch {
      setNotificacoes([])
    } finally {
      setNotifCarregando(false)
    }
  }, [usuario?.id])

  useEffect(() => {
    carregarNotificacoes()
  }, [carregarNotificacoes])

  useEffect(() => {
    if (!usuario?.id) return undefined

    const interval = setInterval(() => {
      carregarNotificacoes()
    }, 60000)

    return () => clearInterval(interval)
  }, [carregarNotificacoes, usuario?.id])

  useEffect(() => {
    setNotifAberta(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickFora = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifAberta(false)
      }
    }

    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  const totalNotificacoes = notificacoes.length
  const resumoNotificacoes = useMemo(() => {
    if (notifCarregando) return 'Carregando...'
    if (!totalNotificacoes) return 'Sem novidades por enquanto.'
    return `${totalNotificacoes} notificação${totalNotificacoes > 1 ? 'es' : ''}`
  }, [notifCarregando, totalNotificacoes])

  return (
    <div className="app-shell page-enter">
      <header className="app-topbar">
        <Link to="/home" className="topbar-logo">
          <img src={FOTO_LOGO} alt="Brotou" />
          Brotou
        </Link>
        <div className="topbar-center" />
        <div className="topbar-right">
          <div className="topbar-notif" ref={notifRef}>
            <button
              type="button"
              className={`icon-btn${notifAberta ? ' active' : ''}`}
              onClick={() => setNotifAberta((prev) => !prev)}
              aria-label="Abrir notificações"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {totalNotificacoes > 0 && <span className="notif-dot" />}
              {totalNotificacoes > 0 && (
                <span className="notif-count">
                  {totalNotificacoes > 9 ? '9+' : totalNotificacoes}
                </span>
              )}
            </button>

            <div className={`notif-popover${notifAberta ? ' open' : ''}`}>
              <div className="notif-head">
                <div>
                  <strong>Notificações</strong>
                  <span>{resumoNotificacoes}</span>
                </div>
                <button type="button" onClick={carregarNotificacoes}>Atualizar</button>
              </div>

              <div className="notif-list">
                {notifCarregando ? (
                  <div className="notif-empty">Carregando notificações...</div>
                ) : notificacoes.length === 0 ? (
                  <div className="notif-empty">Você está em dia. Nenhuma notificação nova.</div>
                ) : (
                  notificacoes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="notif-item"
                      onClick={() => {
                        setNotifAberta(false)
                        navigate(item.destino)
                      }}
                    >
                      <div className="notif-item-title">{item.titulo}</div>
                      <div className="notif-item-desc">{item.detalhe}</div>
                      <div className="notif-item-time">{formatarTempoRelativo(item.data)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="tb-avatar" onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>
            {usuario?.urlAvatar
              ? <img src={usuario.urlAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
        </div>
      </header>

      <aside className="app-sidebar">
        <div className="sb-section">
          <div className="sb-label">Menu</div>
          <NavItem to="/home" active={activePage === 'home'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Início
          </NavItem>
          <NavItem to="/plantas" active={activePage === 'plantas'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Minhas Plantas
          </NavItem>
          <NavItem to="/diario" active={activePage === 'diario'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Diário
          </NavItem>
          <NavItem to="/adocoes" active={activePage === 'adocoes'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Adoções
          </NavItem>
          <NavItem to="/amigos" active={activePage === 'amigos'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Amigos
          </NavItem>
          <NavItem to="/especies" active={activePage === 'especies'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Espécies
          </NavItem>
        </div>
        <div className="sb-section">
          <div className="sb-label">Conta</div>
          <NavItem to="/perfil" active={activePage === 'perfil'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Perfil
          </NavItem>
          <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </div>
        </div>
        <div className="sb-bottom">
          <div className="sb-user" onClick={() => navigate('/perfil')}>
            {usuario?.urlAvatar
              ? <img src={usuario.urlAvatar} alt={usuario.nome} />
              : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-d)', fontWeight: 700, color: 'var(--moss)' }}>{initials}</div>
            }
            <div>
              <div className="sb-user-name">{usuario?.nome || 'Usuário'}</div>
              <div className="sb-user-info">@{usuario?.username || 'sem-username'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  )
}
