import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

const FOTO_LOGO = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=60&q=80'

function NavItem({ to, active, children }) {
  return (
    <Link to={to} className={`nav-item${active ? ' active' : ''}`}>
      {children}
    </Link>
  )
}

export default function AppShell({ children, activePage }) {
  const { usuario, logoutUsuario } = useApp()
  const navigate = useNavigate()
  const initials = usuario?.nome?.charAt(0)?.toUpperCase() || 'U'

  const handleLogout = () => {
    logoutUsuario()
    navigate('/')
  }

  return (
    <div className="app-shell page-enter">
      {/* Topbar */}
      <header className="app-topbar">
        <Link to="/home" className="topbar-logo">
          <img src={FOTO_LOGO} alt="Brotou" />
          Brotou
        </Link>
        <div className="topbar-center">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Buscar plantas, espécies..." />
          </div>
        </div>
        <div className="topbar-right">
          <div className="icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notif-dot" />
          </div>
          <div className="tb-avatar" onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>
            {usuario?.urlAvatar
              ? <img src={usuario.urlAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
        </div>
      </header>

      {/* Sidebar */}
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
              <div className="sb-user-info">{usuario?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="app-main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  )
}
