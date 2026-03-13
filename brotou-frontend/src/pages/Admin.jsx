import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { adminApi, usuariosApi, plantasApi, entradasApi, adocoesApi } from '../services/api'

export default function Admin() {
  const { admin, logoutAdmin, toast } = useApp()
  const navigate = useNavigate()

  const { data: dashRes, loading } = useApi(() => adminApi.dashboard(), [])
  const { data: usuariosRes } = useApi(() => usuariosApi.listar(), [])
  const { data: plantasRes } = useApi(() => plantasApi.listar(), [])
  const { data: adocoesRes } = useApi(() => adocoesApi.listar(), [])
  const { data: entradasRes } = useApi(() => entradasApi.listar(), [])

  const dash = dashRes?.dados || {}
  const usuarios = usuariosRes?.dados?.slice(0, 5) || []

  const handleLogout = () => {
    logoutAdmin()
    navigate('/')
  }

  return (
    <div id="page-admin" className="page-enter">
      <div className="adm-shell">
        <header className="adm-topbar">
          <div className="adm-logo-wrap">
            Brotou <span className="adm-badge">Admin</span>
          </div>
          <div style={{ flex: 1, padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--adm-bg3)', border: '1px solid var(--adm-border)', borderRadius: 6, padding: '7px 12px', maxWidth: 320 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-muted)" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--adm-text)', width: '100%' }} placeholder="Buscar usuários, plantas..." />
            </div>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-icon-btn" onClick={() => toast('Sem novas notificações')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="adm-avatar">{admin?.nome?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div style={{ fontSize: 13, color: 'var(--adm-muted)', paddingRight: 4 }}>Admin</div>
            <div className="adm-exit" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </div>
          </div>
        </header>

        <aside className="adm-sidebar">
          <div className="adm-sb-section">
            <div className="adm-sb-label">Visão Geral</div>
            <div className="adm-nav active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Usuários</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Plantas</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Espécies</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Diários</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Adoções</div>
          </div>
          <div className="adm-sb-section">
            <div className="adm-sb-label">Sistema</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>Logs de Auditoria</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Denúncias</div>
            <div className="adm-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>Configurações</div>
          </div>
          <div className="adm-sb-bottom">
            <div className="adm-user-row">
              <div className="adm-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{admin?.nome?.charAt(0)?.toUpperCase() || 'A'}</div>
              <div><div className="adm-user-name">{admin?.nome || 'Administrador'}</div><div className="adm-user-role">{admin?.email}</div></div>
            </div>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-inner">
            <div className="adm-page-hd">
              <div><h1>Dashboard</h1><p>Visão geral da plataforma Brotou · Dados em tempo real</p></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="adm-btn adm-btn-ghost">Exportar CSV</button>
                <button className="adm-btn adm-btn-primary" onClick={() => toast('Relatório gerado!')}>Gerar Relatório</button>
              </div>
            </div>

            {loading ? (
              <div className="loading-wrap"><div className="spinner" style={{ borderTopColor: 'var(--adm-blue)' }} /></div>
            ) : (
              <>
                <div className="adm-stats">
                  <div className="adm-sc">
                    <div className="adm-sc-top">
                      <span className="adm-sc-label">Usuários Totais</span>
                      <div className="adm-sc-icon" style={{ background: 'rgba(59,130,246,.12)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-blue)" strokeWidth="2" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                    </div>
                    <div className="adm-sc-num">{usuariosRes?.total ?? dash.totalUsuarios ?? '—'}</div>
                    <div className="adm-sc-delta up">Usuários cadastrados</div>
                  </div>
                  <div className="adm-sc">
                    <div className="adm-sc-top">
                      <span className="adm-sc-label">Plantas Ativas</span>
                      <div className="adm-sc-icon" style={{ background: 'rgba(34,197,94,.12)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-green)" strokeWidth="2" width="17" height="17"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    </div>
                    <div className="adm-sc-num">{plantasRes?.total ?? dash.totalPlantas ?? '—'}</div>
                    <div className="adm-sc-delta up">Plantas cadastradas</div>
                  </div>
                  <div className="adm-sc">
                    <div className="adm-sc-top">
                      <span className="adm-sc-label">Adoções</span>
                      <div className="adm-sc-icon" style={{ background: 'rgba(245,158,11,.12)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-amber)" strokeWidth="2" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                    </div>
                    <div className="adm-sc-num">{adocoesRes?.total ?? dash.totalAdocoes ?? '—'}</div>
                    <div className="adm-sc-delta up">Total de adoções</div>
                  </div>
                  <div className="adm-sc">
                    <div className="adm-sc-top">
                      <span className="adm-sc-label">Entradas Diário</span>
                      <div className="adm-sc-icon" style={{ background: 'rgba(239,68,68,.12)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-red)" strokeWidth="2" width="17" height="17"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                    </div>
                    <div className="adm-sc-num">{entradasRes?.total ?? dash.totalEntradas ?? '—'}</div>
                    <div className="adm-sc-delta up">Registros no diário</div>
                  </div>
                </div>

                <div className="adm-grid-2">
                  <div className="adm-chart-box">
                    <div className="adm-chart-title">Entradas no diário — últimos 7 dias</div>
                    <div className="adm-bar-chart">
                      {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d, i) => (
                        <div className="adm-bar-g" key={d}>
                          <div className="adm-bar" style={{ height: `${[55,80,60,90,70,40,30][i]}%` }} />
                          <div className="adm-bar-lbl">{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="adm-chart-box">
                    <div className="adm-chart-title">Distribuição de espécies</div>
                    <div className="adm-donut-wrap">
                      <div className="adm-donut" />
                      <div className="adm-legend">
                        <div className="adm-leg-item"><div className="adm-leg-dot" style={{ background: 'var(--adm-green)' }} />Fácil — 45%</div>
                        <div className="adm-leg-item"><div className="adm-leg-dot" style={{ background: 'var(--adm-blue)' }} />Médio — 27%</div>
                        <div className="adm-leg-item"><div className="adm-leg-dot" style={{ background: 'var(--adm-amber)' }} />Difícil — 13%</div>
                        <div className="adm-leg-item"><div className="adm-leg-dot" style={{ background: 'var(--adm-red)' }} />Outros — 15%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="adm-table-wrap">
                  <div className="adm-table-hd">
                    <h3>Usuários cadastrados</h3>
                    <button className="adm-btn adm-btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Ver todos</button>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr><th>Usuário</th><th>E-mail</th><th>Criado em</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="adm-td-user">
                              {u.urlAvatar
                                ? <img src={u.urlAvatar} alt={u.nome} />
                                : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(59,130,246,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--adm-blue)' }}>{u.nome.charAt(0)}</div>
                              }
                              {u.nome}
                            </div>
                          </td>
                          <td style={{ color: 'var(--adm-muted)' }}>{u.email}</td>
                          <td style={{ color: 'var(--adm-muted)' }}>{new Date(u.criadoEm).toLocaleDateString('pt-BR')}</td>
                          <td><span className="adm-status active">Ativo</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="adm-actions-panel">
                  <h3>Ações rápidas</h3>
                  <div className="adm-action-list">
                    <div className="adm-action-row">
                      <div className="adm-action-left">
                        <div className="adm-action-ic" style={{ background: 'rgba(34,197,94,.1)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-green)" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/></svg></div>
                        <div><div className="adm-action-name">Nova espécie</div><div className="adm-action-desc">Adicionar ao catálogo</div></div>
                      </div>
                      <div className="adm-action-btns">
                        <Link to="/especies" className="adm-btn adm-btn-primary">Adicionar</Link>
                      </div>
                    </div>
                    <div className="adm-action-row">
                      <div className="adm-action-left">
                        <div className="adm-action-ic" style={{ background: 'rgba(59,130,246,.1)' }}><svg viewBox="0 0 24 24" fill="none" stroke="var(--adm-blue)" strokeWidth="2" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                        <div><div className="adm-action-name">Exportar métricas</div><div className="adm-action-desc">Relatório mensal completo</div></div>
                      </div>
                      <div className="adm-action-btns">
                        <button className="adm-btn adm-btn-ghost" onClick={() => toast('Relatório exportado!')}>Exportar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
