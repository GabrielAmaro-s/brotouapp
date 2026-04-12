import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { adocoesApi, entradasApi, plantasApi } from '../services/api'

const TIPO_CORES = {
  REGA: { cls: 'ic-water', label: 'Rega', cor: 'var(--blue)' },
  ADUBACAO: { cls: 'ic-fert', label: 'Adubação', cor: 'var(--sage)' },
  PODA: { cls: 'ic-prune', label: 'Poda', cor: 'var(--warn-c)' },
  OBSERVACAO: { cls: 'ic-obs', label: 'Observação', cor: 'var(--bark)' },
}

const FOTO_FALLBACK = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80'

export default function DetalhePlanta() {
  const { id } = useParams()
  const { usuario, toast } = useApp()
  const navigate = useNavigate()

  const [tabTipo, setTabTipo] = useState('TODOS')
  const [formEntrada, setFormEntrada] = useState({ tipo: 'REGA', observacao: '' })
  const [formAdocao, setFormAdocao] = useState({ dataInicio: '', dataFim: '', mensagemCliente: '' })
  const [savingEntrada, setSavingEntrada] = useState(false)
  const [savingAdocao, setSavingAdocao] = useState(false)

  const { data: plantaRes, loading } = useApi(() => plantasApi.buscar(id), [id])
  const { data: entradasRes, refetch } = useApi(() => entradasApi.listar({ plantaId: id }), [id])

  const planta = plantaRes?.dados
  const entradas = (entradasRes?.dados || []).filter(e => tabTipo === 'TODOS' || e.tipo === tabTipo)

  const isLogado = Boolean(usuario)
  const isOwner = Boolean(usuario?.id && planta?.donoId === usuario.id)
  const podeRegistrarDiario = isLogado && isOwner
  const podeSolicitarAdocao = isLogado && !isOwner && planta?.disponivelParaAdocao

  const qtdInteracoes = useMemo(() => (planta?._count?.adocoes || 0), [planta])

  const handleRegistrar = async () => {
    if (!podeRegistrarDiario) {
      toast('Apenas o dono logado pode registrar entradas neste item.')
      return
    }

    if (!formEntrada.observacao.trim()) {
      toast('Adicione uma observação para registrar a entrada.')
      return
    }

    setSavingEntrada(true)
    try {
      await entradasApi.criar({ ...formEntrada, plantaId: id, autorId: usuario.id })
      toast('Entrada registrada com sucesso!')
      setFormEntrada(p => ({ ...p, observacao: '' }))
      refetch()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setSavingEntrada(false)
    }
  }

  const handleSolicitarAdocao = async () => {
    if (!podeSolicitarAdocao) {
      toast('Você precisa estar logado para interagir com este item.')
      return
    }

    if (!formAdocao.dataInicio) {
      toast('Informe a data de início da interação.')
      return
    }

    setSavingAdocao(true)
    try {
      await adocoesApi.criar({
        plantaId: id,
        cuidadorId: usuario.id,
        dataInicio: formAdocao.dataInicio,
        dataFim: formAdocao.dataFim || undefined,
        mensagemCliente: formAdocao.mensagemCliente || undefined,
      })
      toast('Interação enviada para análise!')
      setFormAdocao({ dataInicio: '', dataFim: '', mensagemCliente: '' })
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setSavingAdocao(false)
    }
  }

  if (loading) {
    return (
      <AppShell activePage="plantas">
        <div className="loading-wrap"><div className="spinner" /></div>
      </AppShell>
    )
  }

  if (!planta) {
    return (
      <AppShell activePage="plantas">
        <div className="error-msg">Item não encontrado.</div>
      </AppShell>
    )
  }

  const conteudo = (
    <>
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(isLogado ? '/plantas' : '/')}>← Voltar</button>
      </div>

      <div className="det-layout">
        <div className="det-left">
          <div className="det-main-img">
            <img src={planta.urlFoto || FOTO_FALLBACK} alt={planta.apelido} />
          </div>
          <div className="info-card">
            <h4>Informações</h4>
            <div className="info-r"><span className="l">Espécie</span><span className="v">{planta.especie?.nomeComum}</span></div>
            <div className="info-r"><span className="l">Nome científico</span><span className="v" style={{ fontStyle: 'italic', fontSize: 12 }}>{planta.especie?.nomeCientifico}</span></div>
            <div className="info-r"><span className="l">Dificuldade</span><span className="v">{planta.especie?.dificuldade}</span></div>
            <div className="info-r"><span className="l">Adquirida em</span><span className="v">{new Date(planta.adquiridaEm).toLocaleDateString('pt-BR')}</span></div>
            <div className="info-r"><span className="l">Interações</span><span className="v">{qtdInteracoes}</span></div>
            <div className="info-r"><span className="l">Disponível para adoção</span><span className="v">{planta.disponivelParaAdocao ? 'Sim' : 'Não'}</span></div>
          </div>
          {planta.especie && (
            <div className="tip-card">
              <h4>Dicas de cuidado</h4>
              <div className="tip-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                {planta.especie.dicaRega}
              </div>
              <div className="tip-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
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

          {!isLogado && (
            <div className="entrada-form" style={{ marginBottom: 16, background: 'var(--cream)' }}>
              <h4>Interação bloqueada</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                Você pode visualizar os detalhes, mas precisa fazer login para interagir com este item.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm">Entrar para interagir</Link>
            </div>
          )}

          {podeSolicitarAdocao && (
            <div className="entrada-form" style={{ marginBottom: 16 }}>
              <h4>Solicitar interação (adoção temporária)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="field">
                  <label>Data de início *</label>
                  <input type="date" value={formAdocao.dataInicio} onChange={e => setFormAdocao(p => ({ ...p, dataInicio: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Data de fim</label>
                  <input type="date" value={formAdocao.dataFim} onChange={e => setFormAdocao(p => ({ ...p, dataFim: e.target.value }))} />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Mensagem para o admin (opcional)</label>
                <textarea value={formAdocao.mensagemCliente} onChange={e => setFormAdocao(p => ({ ...p, mensagemCliente: e.target.value }))} placeholder="Explique como você pretende cuidar do item..." />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSolicitarAdocao} disabled={savingAdocao}>
                {savingAdocao ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </div>
          )}

          <div className="diario-hd">
            <h3>Histórico</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entradasRes?.total || 0} entradas</span>
          </div>

          <div className="type-tabs">
            {[['TODOS', 'Todos'], ['REGA', 'Rega'], ['ADUBACAO', 'Adubação'], ['PODA', 'Poda'], ['OBSERVACAO', 'Observação']].map(([k, l]) => (
              <button key={k} className={`tt${tabTipo === k ? ' sel tt-o' : ''}`} onClick={() => setTabTipo(k)}>{l}</button>
            ))}
          </div>

          <div className="entrada-form">
            <h4>Nova entrada</h4>
            {!podeRegistrarDiario && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                Apenas o dono logado pode registrar novas entradas neste item.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field">
                <label>Tipo</label>
                <select value={formEntrada.tipo} onChange={e => setFormEntrada(p => ({ ...p, tipo: e.target.value }))} disabled={!podeRegistrarDiario}>
                  <option value="REGA">Rega</option>
                  <option value="ADUBACAO">Adubação</option>
                  <option value="PODA">Poda</option>
                  <option value="OBSERVACAO">Observação</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Observação</label>
              <textarea
                placeholder="Descreva o que foi feito..."
                value={formEntrada.observacao}
                onChange={e => setFormEntrada(p => ({ ...p, observacao: e.target.value }))}
                style={{ minHeight: 72 }}
                disabled={!podeRegistrarDiario}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleRegistrar} disabled={savingEntrada || !podeRegistrarDiario}>
                {savingEntrada ? 'Salvando...' : 'Registrar'}
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
    </>
  )

  if (isLogado) {
    return <AppShell activePage="plantas">{conteudo}</AppShell>
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <nav className="lnav">
        <Link to="/" className="lnav-logo">Brotou</Link>
        <div className="lnav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Criar conta</Link>
        </div>
      </nav>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: 'calc(var(--nav-h) + 24px) 24px 40px' }}>
        {conteudo}
      </main>
    </div>
  )
}
