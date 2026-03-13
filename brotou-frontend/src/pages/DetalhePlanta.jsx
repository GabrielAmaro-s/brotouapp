import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { plantasApi, entradasApi } from '../services/api'

const TIPO_CORES = {
  REGA:      { cls: 'ic-water',  label: 'Rega',       de: 'de-tipo', cor: 'var(--blue)' },
  ADUBACAO:  { cls: 'ic-fert',   label: 'Adubação',   cor: 'var(--sage)' },
  PODA:      { cls: 'ic-prune',  label: 'Poda',       cor: 'var(--warn-c)' },
  OBSERVACAO:{ cls: 'ic-obs',    label: 'Observação', cor: 'var(--bark)' },
}

export default function DetalhePlanta() {
  const { id } = useParams()
  const { usuario, toast } = useApp()
  const navigate = useNavigate()
  const [tabTipo, setTabTipo] = useState('TODOS')
  const [formEntrada, setFormEntrada] = useState({ tipo: 'REGA', observacao: '' })
  const [saving, setSaving] = useState(false)

  const { data: plantaRes, loading } = useApi(() => plantasApi.buscar(id), [id])
  const { data: entradasRes, refetch } = useApi(() => entradasApi.listar({ plantaId: id }), [id])

  const planta = plantaRes?.dados
  const entradas = (entradasRes?.dados || []).filter(e => tabTipo === 'TODOS' || e.tipo === tabTipo)

  const handleRegistrar = async () => {
    if (!formEntrada.observacao) { toast('Adicione uma observação'); return }
    setSaving(true)
    try {
      await entradasApi.criar({ ...formEntrada, plantaId: id, autorId: usuario.id })
      toast('Entrada registrada!')
      setFormEntrada(p => ({ ...p, observacao: '' }))
      refetch()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AppShell activePage="plantas"><div className="loading-wrap"><div className="spinner" /></div></AppShell>
  if (!planta) return <AppShell activePage="plantas"><div className="error-msg">Planta não encontrada.</div></AppShell>

  return (
    <AppShell activePage="plantas">
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plantas')}>← Voltar</button>
      </div>

      <div className="det-layout">
        <div className="det-left">
          <div className="det-main-img">
            <img src={planta.urlFoto || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80'} alt={planta.apelido} />
          </div>
          <div className="info-card">
            <h4>Informações</h4>
            <div className="info-r"><span className="l">Espécie</span><span className="v">{planta.especie?.nomeComum}</span></div>
            <div className="info-r"><span className="l">Nome científico</span><span className="v" style={{ fontStyle: 'italic', fontSize: 12 }}>{planta.especie?.nomeCientifico}</span></div>
            <div className="info-r"><span className="l">Dificuldade</span><span className="v">{planta.especie?.dificuldade}</span></div>
            <div className="info-r"><span className="l">Adquirida em</span><span className="v">{new Date(planta.adquiridaEm).toLocaleDateString('pt-BR')}</span></div>
            <div className="info-r"><span className="l">Para adoção</span><span className="v">{planta.disponivelParaAdocao ? 'Sim' : 'Não'}</span></div>
          </div>
          {planta.especie && (
            <div className="tip-card">
              <h4>Dicas de cuidado</h4>
              <div className="tip-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                {planta.especie.dicaRega}
              </div>
              <div className="tip-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>
                {planta.especie.dicaLuz}
              </div>
            </div>
          )}
        </div>

        <div className="det-right">
          <div className="det-plant-name">{planta.apelido}</div>
          <div className="det-sp">{planta.especie?.nomeCientifico}</div>
          <div className="det-badges">
            <span className="badge bg-green">{planta.especie?.nomeComum}</span>
            {planta.disponivelParaAdocao && <span className="badge bg-blue">disponível para adoção</span>}
          </div>

          <div className="diario-hd">
            <h3>Diário</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entradasRes?.total || 0} entradas</span>
          </div>

          <div className="type-tabs">
            {[['TODOS','Todos'], ['REGA','Rega'], ['ADUBACAO','Adubação'], ['PODA','Poda'], ['OBSERVACAO','Observação']].map(([k,l]) => (
              <button key={k} className={`tt${tabTipo === k ? ' sel tt-o' : ''}`} onClick={() => setTabTipo(k)}>{l}</button>
            ))}
          </div>

          <div className="entrada-form">
            <h4>Nova entrada</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field">
                <label>Tipo</label>
                <select value={formEntrada.tipo} onChange={e => setFormEntrada(p => ({ ...p, tipo: e.target.value }))}>
                  <option value="REGA">Rega</option>
                  <option value="ADUBACAO">Adubação</option>
                  <option value="PODA">Poda</option>
                  <option value="OBSERVACAO">Observação</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Observação</label>
              <textarea placeholder="Descreva o que foi feito..." value={formEntrada.observacao} onChange={e => setFormEntrada(p => ({ ...p, observacao: e.target.value }))} style={{ minHeight: 72 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleRegistrar} disabled={saving}>
                {saving ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </div>

          <div className="diary-list">
            {entradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 14 }}>
                Nenhuma entrada encontrada.
              </div>
            ) : entradas.map(e => {
              const tc = TIPO_CORES[e.tipo] || TIPO_CORES.OBSERVACAO
              return (
                <div className="de" key={e.id}>
                  <div className={`de-ic ${tc.cls}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="de-meta">
                      <span className="de-tipo" style={{ color: tc.cor }}>{tc.label}</span>
                      <span className="de-date">{new Date(e.registradoEm).toLocaleDateString('pt-BR')}</span>
                      {e.autor && <span className="de-author">· por {e.autor.nome}</span>}
                    </div>
                    {e.observacao && <div className="de-obs">{e.observacao}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
