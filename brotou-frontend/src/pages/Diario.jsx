import { useState } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { entradasApi } from '../services/api'

const TIPO_IC = {
  REGA:      { cls: 'ic-water', label: 'Rega',       cor: 'var(--blue)' },
  ADUBACAO:  { cls: 'ic-fert',  label: 'Adubação',   cor: 'var(--sage)' },
  PODA:      { cls: 'ic-prune', label: 'Poda',       cor: 'var(--warn-c)' },
  OBSERVACAO:{ cls: 'ic-obs',   label: 'Observação', cor: 'var(--bark)' },
}

export default function Diario() {
  const { usuario } = useApp()
  const [filtro, setFiltro] = useState('TODOS')

  const { data, loading } = useApi(() => entradasApi.listar({ autorId: usuario?.id }), [usuario?.id])
  const entradas = (data?.dados || []).filter(e => filtro === 'TODOS' || e.tipo === filtro)

  return (
    <AppShell activePage="diario">
      <div className="page-hd">
        <div><h1>Diário</h1><p>{data?.total || 0} entradas no total</p></div>
      </div>

      <div className="filter-row">
        {[['TODOS','Todas'], ['REGA','Rega'], ['ADUBACAO','Adubação'], ['PODA','Poda'], ['OBSERVACAO','Observação']].map(([k,l]) => (
          <button key={k} className={`fbtn${filtro === k ? ' active' : ''}`} onClick={() => setFiltro(k)}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ padding: '0 4px' }}>
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : entradas.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <h3>Nenhuma entrada</h3>
            <p>Abra uma planta e registre uma nova entrada no diário.</p>
          </div>
        ) : (
          <div className="activity-feed">
            {entradas.map(e => {
              const ic = TIPO_IC[e.tipo] || TIPO_IC.OBSERVACAO
              return (
                <div className="act-item" key={e.id}>
                  <div className={`act-ic ${ic.cls}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </div>
                  <div className="act-body">
                    <div className="act-text">
                      <strong>{e.planta?.apelido}</strong> — <span style={{ color: ic.cor, fontWeight: 600 }}>{ic.label}</span>
                      {e.observacao ? `: ${e.observacao}` : ''}
                    </div>
                    <div className="act-time">
                      {new Date(e.registradoEm).toLocaleString('pt-BR')} · por {e.autor?.nome}
                    </div>
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
