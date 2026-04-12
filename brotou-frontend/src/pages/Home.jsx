import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { plantasApi, entradasApi } from '../services/api'

const TIPO_IC = {
  REGA: { cls: 'ic-water', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
  ADUBACAO: { cls: 'ic-fert', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  PODA: { cls: 'ic-prune', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  OBSERVACAO: { cls: 'ic-obs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
}

const TIPO_PT = { REGA: 'Rega', ADUBACAO: 'Adubação', PODA: 'Poda', OBSERVACAO: 'Observação' }

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'ontem' : `há ${d} dias`
}

export default function Home() {
  const { usuario } = useApp()
  const navigate = useNavigate()

  const { data: plantasRes, loading: lPlantas } = useApi(() => plantasApi.listar({ donoId: usuario?.id }), [usuario?.id])
  const { data: disponiveisRes } = useApi(() => plantasApi.listar({ disponivelParaAdocao: true }), [])
  const { data: entradasRes } = useApi(() => entradasApi.listar({ autorId: usuario?.id }), [usuario?.id])

  const plantas = plantasRes?.dados || []
  const disponiveis = disponiveisRes?.dados?.filter(p => p.donoId !== usuario?.id).slice(0, 2) || []
  const entradas = entradasRes?.dados?.slice(0, 4) || []

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <AppShell activePage="home">
      <div className="greeting-banner">
        <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80" alt="" />
        <div className="greeting-text">
          <h2>{saudacao}, {usuario?.nome?.split(' ')[0] || 'Usuário'}</h2>
          <p>Bem-vindo ao seu jardim digital. Cuide bem das suas plantas!</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="sc">
          <div className="sc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div className="sc-num">{lPlantas ? '-' : plantas.length}</div>
          <div className="sc-lbl">Plantas cadastradas</div>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
          <div className="sc-num">{entradasRes?.total ?? '-'}</div>
          <div className="sc-lbl">Entradas no diário</div>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div className="sc-num">{disponiveis.length}</div>
          <div className="sc-lbl">Para adoção</div>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div className="sc-num">5</div>
          <div className="sc-lbl">Conquistas</div>
        </div>
      </div>

      <div className="sec-row">
        <h3>Disponíveis para adoção</h3>
        <a onClick={() => navigate('/adocoes')}>Ver todas</a>
      </div>

      {disponiveis.length === 0 ? (
        <div className="empty-state" style={{ minHeight: 120 }}>
          <p>Nenhuma planta disponível para adoção no momento.</p>
        </div>
      ) : (
        <div className="feed-grid">
          {disponiveis.map(p => (
            <div className="fpc" key={p.id} onClick={() => navigate(`/plantas/${p.id}`)}>
              <div className="fpc-img">
                <img src={p.urlFoto || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80'} alt={p.apelido} />
                <span className="fpc-badge">Adoção aberta</span>
              </div>
              <div className="fpc-body">
                <div className="fpc-name">{p.apelido}</div>
                <div className="fpc-sp">{p.especie?.nomeComum} · {p.especie?.dificuldade}</div>
                <div className="fpc-foot">
                  <div className="fpc-owner">
                    {p.dono?.urlAvatar && <img src={p.dono.urlAvatar} alt={p.dono.nome} />}
                    {p.dono?.nome}
                  </div>
                  <span className="badge bg-green">disponível</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="sec-row" style={{ marginTop: 8 }}>
        <h3>Atividade recente</h3>
        <a onClick={() => navigate('/diario')}>Ver diário</a>
      </div>

      <div className="card" style={{ padding: '0 4px' }}>
        {entradas.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Nenhuma atividade recente. Comece adicionando uma entrada no diário!
          </div>
        ) : (
          <div className="activity-feed">
            {entradas.map(e => {
              const ic = TIPO_IC[e.tipo] || TIPO_IC.OBSERVACAO
              return (
                <div className="act-item" key={e.id}>
                  <div className={`act-ic ${ic.cls}`}>{ic.icon}</div>
                  <div className="act-body">
                    <div className="act-text">
                      <strong>{e.planta?.apelido}</strong> - {TIPO_PT[e.tipo]}{e.observacao ? `: ${e.observacao}` : ''}
                    </div>
                    <div className="act-time">{relativeTime(e.registradoEm)} · por {e.autor?.nome}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
