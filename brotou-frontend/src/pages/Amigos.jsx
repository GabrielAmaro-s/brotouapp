import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { amizadesApi, usuariosApi } from '../services/api'

function outroLado(amizade, usuarioId) {
  return amizade.solicitanteId === usuarioId ? amizade.destinatario : amizade.solicitante
}

export default function Amigos() {
  const { usuario, toast } = useApp()
  const [busca, setBusca] = useState('')
  const [loadingAcao, setLoadingAcao] = useState(null)

  const { data: usuariosRes, loading: loadingBusca, refetch: refetchUsuarios } = useApi(
    () => usuariosApi.listar({ busca, excluirId: usuario?.id }),
    [busca, usuario?.id],
  )

  const { data: amizadesRes, loading: loadingAmizades, refetch: refetchAmizades } = useApi(
    () => amizadesApi.listar({ tipo: 'todas' }),
    [usuario?.id],
  )

  const usuarios = usuariosRes?.dados || []
  const amizades = amizadesRes?.dados || []

  const statusPorUsuario = useMemo(() => {
    const map = {}
    amizades.forEach((amizade) => {
      const outro = outroLado(amizade, usuario.id)
      if (!outro) return
      map[outro.id] = amizade
    })
    return map
  }, [amizades, usuario?.id])

  const solicitacoesRecebidas = amizades.filter(
    (a) => a.destinatarioId === usuario.id && a.status === 'PENDENTE',
  )

  const meusAmigos = amizades
    .filter((a) => a.status === 'ACEITA')
    .map((a) => ({ amizadeId: a.id, usuario: outroLado(a, usuario.id) }))

  const atualizarTudo = () => {
    refetchAmizades()
    refetchUsuarios()
  }

  const executar = async (key, fn, sucessoMsg) => {
    setLoadingAcao(key)
    try {
      await fn()
      if (sucessoMsg) toast(sucessoMsg)
      atualizarTudo()
    } catch (err) {
      toast('Erro: ' + err.message)
    } finally {
      setLoadingAcao(null)
    }
  }

  return (
    <AppShell activePage="amigos">
      <div className="page-hd">
        <div>
          <h1>Rede de Amigos</h1>
          <p>Procure usuários por nome, e-mail ou username e conecte-se com eles.</p>
        </div>
      </div>

      <div className="friends-search">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar usuários (nome, @username, e-mail)"
        />
      </div>

      <div className="friends-layout">
        <section className="friends-section card">
          <h3>Encontrar usuários</h3>
          {loadingBusca ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : usuarios.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="friends-list">
              {usuarios.map((u) => {
                const amizade = statusPorUsuario[u.id]
                const status = amizade?.status
                const recebeuDele = amizade?.solicitanteId === u.id && amizade?.destinatarioId === usuario.id
                const keyBase = amizade?.id || u.id

                return (
                  <div key={u.id} className="friend-item">
                    <div className="friend-user">
                      {u.urlAvatar
                        ? <img src={u.urlAvatar} alt={u.nome} />
                        : <div className="friend-avatar">{u.nome?.charAt(0)?.toUpperCase() || 'U'}</div>
                      }
                      <div>
                        <div className="friend-name">{u.nome}</div>
                        <div className="friend-meta">@{u.username} · {u.email}</div>
                      </div>
                    </div>

                    <div className="friend-actions">
                      {!amizade && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => executar(`add-${keyBase}`, () => amizadesApi.solicitar(u.id), 'Solicitação enviada!')}
                          disabled={loadingAcao === `add-${keyBase}`}
                        >
                          Adicionar
                        </button>
                      )}

                      {status === 'PENDENTE' && !recebeuDele && (
                        <button className="btn btn-ghost btn-sm" disabled>
                          Solicitação enviada
                        </button>
                      )}

                      {status === 'PENDENTE' && recebeuDele && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => executar(`accept-${amizade.id}`, () => amizadesApi.aceitar(amizade.id), 'Agora vocês são amigos!')}
                            disabled={loadingAcao === `accept-${amizade.id}`}
                          >
                            Aceitar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => executar(`deny-${amizade.id}`, () => amizadesApi.recusar(amizade.id), 'Solicitação recusada.')}
                            disabled={loadingAcao === `deny-${amizade.id}`}
                          >
                            Recusar
                          </button>
                        </>
                      )}

                      {status === 'ACEITA' && (
                        <>
                          <span className="badge bg-green">Amigos</span>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => executar(`rm-${amizade.id}`, () => amizadesApi.remover(amizade.id), 'Amizade removida.')}
                            disabled={loadingAcao === `rm-${amizade.id}`}
                          >
                            Remover
                          </button>
                        </>
                      )}

                      {status === 'RECUSADA' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => executar(`retry-${amizade.id}`, () => amizadesApi.solicitar(u.id), 'Solicitação reenviada!')}
                          disabled={loadingAcao === `retry-${amizade.id}`}
                        >
                          Enviar novamente
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="friends-section card">
          <h3>Solicitações recebidas</h3>
          {loadingAmizades ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : solicitacoesRecebidas.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Sem solicitações pendentes.</p>
            </div>
          ) : (
            <div className="friends-list">
              {solicitacoesRecebidas.map((amizade) => (
                <div key={amizade.id} className="friend-item">
                  <div className="friend-user">
                    {amizade.solicitante?.urlAvatar
                      ? <img src={amizade.solicitante.urlAvatar} alt={amizade.solicitante.nome} />
                      : <div className="friend-avatar">{amizade.solicitante?.nome?.charAt(0)?.toUpperCase() || 'U'}</div>
                    }
                    <div>
                      <div className="friend-name">{amizade.solicitante?.nome}</div>
                      <div className="friend-meta">@{amizade.solicitante?.username}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => executar(`accept-${amizade.id}`, () => amizadesApi.aceitar(amizade.id), 'Solicitação aceita!')}
                      disabled={loadingAcao === `accept-${amizade.id}`}
                    >
                      Aceitar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => executar(`deny-${amizade.id}`, () => amizadesApi.recusar(amizade.id), 'Solicitação recusada.')}
                      disabled={loadingAcao === `deny-${amizade.id}`}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="friends-section card" style={{ marginTop: 18 }}>
        <h3>Minha rede ({meusAmigos.length})</h3>
        {meusAmigos.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>Você ainda não adicionou amigos.</p>
          </div>
        ) : (
          <div className="friends-list">
            {meusAmigos.map((item) => (
              <div key={item.amizadeId} className="friend-item">
                <div className="friend-user">
                  {item.usuario?.urlAvatar
                    ? <img src={item.usuario.urlAvatar} alt={item.usuario.nome} />
                    : <div className="friend-avatar">{item.usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}</div>
                  }
                  <div>
                    <div className="friend-name">{item.usuario?.nome}</div>
                    <div className="friend-meta">@{item.usuario?.username} · {item.usuario?.email}</div>
                  </div>
                </div>
                <div className="friend-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => executar(`rm-${item.amizadeId}`, () => amizadesApi.remover(item.amizadeId), 'Amizade removida.')}
                    disabled={loadingAcao === `rm-${item.amizadeId}`}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
