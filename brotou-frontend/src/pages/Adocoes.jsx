import { useState } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { adocoesApi } from '../services/api'

const STATUS_BADGE = {
  PENDENTE:  { cls: 'bg-orange', label: 'Pendente' },
  ATIVA:     { cls: 'bg-green',  label: 'Ativa' },
  CONCLUIDA: { cls: 'bg-muted',  label: 'Concluída' },
}

export default function Adocoes() {
  const { usuario, toast } = useApp()
  const [aba, setAba] = useState('minhas')
  const [atualizando, setAtualizando] = useState(null)

  const { data: minhasRes, loading: lMinhas, refetch: refMinhas } = useApi(
    () => adocoesApi.listar({ cuidadorId: usuario?.id }), [usuario?.id]
  )
  const { data: dasPlantasRes, loading: lDas, refetch: refDas } = useApi(
    () => adocoesApi.listar(), []
  )

  const lista = aba === 'minhas'
    ? (minhasRes?.dados || [])
    : (dasPlantasRes?.dados?.filter(a => a.planta?.donoId === usuario?.id) || [])
  const loading = aba === 'minhas' ? lMinhas : lDas

  const handleAceitar = async (id) => {
    setAtualizando(id)
    try {
      await adocoesApi.aceitar(id)
      toast('Adoção aceita!'); refDas(); refMinhas()
    } catch (err) { toast('Erro: ' + err.message) }
    finally { setAtualizando(null) }
  }

  const handleConcluir = async (id) => {
    setAtualizando(id)
    try {
      await adocoesApi.concluir(id)
      toast('Adoção concluída!'); refDas(); refMinhas()
    } catch (err) { toast('Erro: ' + err.message) }
    finally { setAtualizando(null) }
  }

  return (
    <AppShell activePage="adocoes">
      <div className="page-hd"><div><h1>Adoções</h1><p>Gerencie cuidados de plantas</p></div></div>

      <div className="adocao-tabs">
        <button className={`atab${aba === 'minhas' ? ' active' : ''}`} onClick={() => setAba('minhas')}>Minhas adoções</button>
        <button className={`atab${aba === 'plantas' ? ' active' : ''}`} onClick={() => setAba('plantas')}>Minhas plantas</button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3>Nenhuma adoção</h3>
          <p>{aba === 'minhas' ? 'Você ainda não cuida de nenhuma planta.' : 'Nenhuma das suas plantas tem adoção registrada.'}</p>
        </div>
      ) : (
        <div className="adocao-grid">
          {lista.map(a => {
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
                  <div className="ac-r"><span className="l">Início</span><span className="v">{new Date(a.dataInicio).toLocaleDateString('pt-BR')}</span></div>
                  {a.dataFim && <div className="ac-r"><span className="l">Fim</span><span className="v">{new Date(a.dataFim).toLocaleDateString('pt-BR')}</span></div>}
                  <div className="ac-r"><span className="l">Dono</span><span className="v">{a.planta?.dono?.nome}</span></div>
                </div>
                {(a.status === 'PENDENTE' || a.status === 'ATIVA') && (
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
                    <button className="btn btn-danger btn-sm">Cancelar</button>
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
