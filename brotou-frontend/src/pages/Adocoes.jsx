import { useState } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { adocoesApi } from '../services/api'

const STATUS_BADGE = {
  PENDENTE: { cls: 'bg-orange', label: 'Pendente' },
  ATIVA: { cls: 'bg-green', label: 'Ativa' },
  CONCLUIDA: { cls: 'bg-muted', label: 'Concluída' },
}

export default function Adocoes() {
  const { usuario, toast } = useApp()
  const [aba, setAba] = useState('minhas')
  const [atualizando, setAtualizando] = useState(null)

  const { data: minhasRes, loading: lMinhas, refetch: refMinhas } = useApi(
    () => adocoesApi.listar({ cuidadorId: usuario?.id }),
    [usuario?.id],
  )

  const { data: recebidasRes, loading: lRecebidas, refetch: refRecebidas } = useApi(
    () => adocoesApi.listar({ donoId: usuario?.id }),
    [usuario?.id],
  )

  const lista = aba === 'minhas' ? (minhasRes?.dados || []) : (recebidasRes?.dados || [])
  const loading = aba === 'minhas' ? lMinhas : lRecebidas

  const atualizarListas = () => {
    refMinhas()
    refRecebidas()
  }

  const handleAceitar = async (id) => {
    setAtualizando(id)
    try {
      await adocoesApi.aceitar(id)
      toast('Interação aceita com sucesso!')
      atualizarListas()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setAtualizando(null)
    }
  }

  const handleConcluir = async (id) => {
    setAtualizando(id)
    try {
      await adocoesApi.concluir(id)
      toast('Interação concluída!')
      atualizarListas()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setAtualizando(null)
    }
  }

  const handleCancelar = async (id) => {
    setAtualizando(id)
    try {
      await adocoesApi.remover(id)
      toast('Interação removida.')
      atualizarListas()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setAtualizando(null)
    }
  }

  return (
    <AppShell activePage="adocoes">
      <div className="page-hd">
        <div>
          <h1>Interações</h1>
          <p>Visualize suas interações e respostas no sistema</p>
        </div>
      </div>

      <div className="adocao-tabs">
        <button className={`atab${aba === 'minhas' ? ' active' : ''}`} onClick={() => setAba('minhas')}>
          Minhas interações
        </button>
        <button className={`atab${aba === 'recebidas' ? ' active' : ''}`} onClick={() => setAba('recebidas')}>
          Interações recebidas
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3>Nenhuma interação encontrada</h3>
          <p>{aba === 'minhas' ? 'Você ainda não enviou solicitações.' : 'Nenhum cliente interagiu com seus itens.'}</p>
        </div>
      ) : (
        <div className="adocao-grid">
          {lista.map((a) => {
            const sb = STATUS_BADGE[a.status] || STATUS_BADGE.PENDENTE
            return (
              <div className="ac" key={a.id}>
                <div className="ac-head">
                  <div className="ac-plant-img">
                    <img src={a.planta?.urlFoto || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80'} alt={a.planta?.apelido} />
                  </div>
                  <div>
                    <div className="ac-name">{a.planta?.apelido}</div>
                    <div className="ac-sp">{a.planta?.especie?.nomeComum}</div>
                  </div>
                  <div className="ac-status">
                    <span className={`badge ${sb.cls}`}>{sb.label}</span>
                  </div>
                </div>

                <div className="ac-body">
                  <div className="ac-r"><span className="l">Cuidador</span><span className="v">{a.cuidador?.nome}</span></div>
                  <div className="ac-r"><span className="l">Dono</span><span className="v">{a.planta?.dono?.nome}</span></div>
                  <div className="ac-r"><span className="l">Início</span><span className="v">{new Date(a.dataInicio).toLocaleDateString('pt-BR')}</span></div>
                  {a.dataFim && <div className="ac-r"><span className="l">Fim</span><span className="v">{new Date(a.dataFim).toLocaleDateString('pt-BR')}</span></div>}
                  {a.confirmadaEm && <div className="ac-r"><span className="l">Confirmada em</span><span className="v">{new Date(a.confirmadaEm).toLocaleString('pt-BR')}</span></div>}
                  {a.emailEnviadoEm && <div className="ac-r"><span className="l">E-mail enviado em</span><span className="v">{new Date(a.emailEnviadoEm).toLocaleString('pt-BR')}</span></div>}

                  {a.mensagemCliente && (
                    <div style={{ marginTop: 10, background: 'var(--cream)', borderRadius: 10, padding: '8px 10px', fontSize: 12, color: 'var(--ink2)' }}>
                      <strong>Mensagem enviada:</strong> {a.mensagemCliente}
                    </div>
                  )}

                  {a.respostaAdmin && (
                    <div style={{ marginTop: 8, background: 'var(--blue-bg)', borderRadius: 10, padding: '8px 10px', fontSize: 12, color: 'var(--ink2)' }}>
                      <strong>Resposta:</strong> {a.respostaAdmin}
                    </div>
                  )}
                </div>

                {aba === 'recebidas' && (a.status === 'PENDENTE' || a.status === 'ATIVA') && (
                  <div className="ac-actions">
                    {a.status === 'PENDENTE' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAceitar(a.id)} disabled={atualizando === a.id}>
                        Aceitar
                      </button>
                    )}
                    {a.status === 'ATIVA' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleConcluir(a.id)} disabled={atualizando === a.id}>
                        Concluir
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(a.id)} disabled={atualizando === a.id}>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
