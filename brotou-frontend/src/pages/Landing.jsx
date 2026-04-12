import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useApp } from '../contexts/AppContext'
import { plantasApi } from '../services/api'

const FOTO_HERO = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85'
const FOTO_LOGO = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=60&q=80'
const FOTO_FALLBACK = 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80'

function calcScore(planta) {
  const entradas = planta?._count?.entradasDiario || 0
  const adocoes = planta?._count?.adocoes || 0
  return entradas * 2 + adocoes * 3 + (planta?.disponivelParaAdocao ? 2 : 0)
}

function calcAvaliacao(planta) {
  const score = calcScore(planta)
  const nota = Math.min(5, 3 + score / 8)
  return Number(nota.toFixed(1))
}

function CardPlanta({ planta, navigate }) {
  return (
    <button className="fpc" type="button" onClick={() => navigate(`/plantas/${planta.id}`)}>
      <div className="fpc-img">
        <img src={planta.urlFoto || FOTO_FALLBACK} alt={planta.apelido} />
        {planta.disponivelParaAdocao && <span className="fpc-badge">Adoção aberta</span>}
      </div>
      <div className="fpc-body">
        <div className="fpc-name">{planta.apelido}</div>
        <div className="fpc-sp">{planta.especie?.nomeComum} · {planta.especie?.dificuldade}</div>
        <div className="fpc-foot">
          <span className="pc-since">Desde {new Date(planta.adquiridaEm).toLocaleDateString('pt-BR')}</span>
          <span className="badge bg-blue">{calcAvaliacao(planta)} ★</span>
        </div>
      </div>
    </button>
  )
}

export default function Landing() {
  const { usuario } = useApp()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('TODAS')

  const { data, loading } = useApi(() => plantasApi.listar(), [])
  const plantas = data?.dados || []

  const plantasOrdenadas = useMemo(() => {
    return plantas
      .map((p) => ({ ...p, __score: calcScore(p), __avaliacao: calcAvaliacao(p) }))
      .sort((a, b) => b.__score - a.__score)
  }, [plantas])

  const destaques = plantasOrdenadas.slice(0, 4)

  const ultimos = useMemo(() => {
    return [...plantasOrdenadas]
      .sort((a, b) => new Date(b.adquiridaEm) - new Date(a.adquiridaEm))
      .slice(0, 4)
  }, [plantasOrdenadas])

  const melhorAvaliacao = useMemo(() => {
    return [...plantasOrdenadas]
      .sort((a, b) => b.__avaliacao - a.__avaliacao)
      .slice(0, 4)
  }, [plantasOrdenadas])

  const filtradas = plantasOrdenadas
    .filter((p) => {
      if (filtro === 'ADOCAO') return p.disponivelParaAdocao
      if (filtro === 'FACIL') return p.especie?.dificuldade === 'FACIL'
      if (filtro === 'MEDIO') return p.especie?.dificuldade === 'MEDIO'
      if (filtro === 'DIFICIL') return p.especie?.dificuldade === 'DIFICIL'
      return true
    })
    .filter((p) => {
      if (!busca.trim()) return true
      const termo = busca.toLowerCase()
      return (
        p.apelido?.toLowerCase().includes(termo) ||
        p.especie?.nomeComum?.toLowerCase().includes(termo) ||
        p.especie?.nomeCientifico?.toLowerCase().includes(termo)
      )
    })

  const limparFiltros = () => {
    setBusca('')
    setFiltro('TODAS')
  }

  return (
    <div id="page-landing" className="page-enter">
      <nav className="lnav">
        <Link to="/" className="lnav-logo">
          <img src={FOTO_LOGO} alt="Brotou" />
          Brotou
        </Link>
        <div className="lnav-links">
          <a href="#catalogo">Catálogo</a>
          <a href="#destaques">Destaques</a>
          <a href="#ultimos">Últimos</a>
        </div>
        <div className="lnav-actions">
          {usuario ? <Link to="/home" className="btn btn-ghost btn-sm">Minha área</Link> : <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>}
          {!usuario && <Link to="/registro" className="btn btn-primary btn-sm">Criar conta</Link>}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Catálogo vivo da comunidade</div>
          <h1 className="hero-title display">Veja os itens mais queridos da plataforma</h1>
          <p className="hero-sub">
            Explore a tabela principal com destaques, últimos cadastrados e melhores avaliados.
            Clique em qualquer item para ver detalhes.
          </p>
          <div className="hero-ctas">
            <a href="#catalogo" className="btn btn-primary btn-lg">Explorar catálogo</a>
            {!usuario && <Link to="/login" className="btn btn-ghost btn-lg">Entrar para interagir</Link>}
          </div>
        </div>
        <div className="hero-right">
          <img className="hero-img-main" src={FOTO_HERO} alt="Plantas em casa" />
          <div className="hero-img-overlay" />
          <div className="hero-float-card">
            <div className="hfc-label">Itens na tabela principal</div>
            <div className="hfc-val">{loading ? '...' : plantas.length}</div>
            <div className="hfc-sub">dados atualizados em tempo real</div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item"><div className="stat-num">{loading ? '...' : plantas.length}</div><div className="stat-lbl">Itens</div></div>
        <div className="stat-item"><div className="stat-num">{loading ? '...' : plantas.filter(p => p.disponivelParaAdocao).length}</div><div className="stat-lbl">Disponíveis</div></div>
        <div className="stat-item"><div className="stat-num">{loading ? '...' : Math.round((plantas.reduce((acc, p) => acc + calcAvaliacao(p), 0) / (plantas.length || 1)) * 10) / 10}</div><div className="stat-lbl">Média aval.</div></div>
        <div className="stat-item"><div className="stat-num">{loading ? '...' : plantas.reduce((acc, p) => acc + (p._count?.adocoes || 0), 0)}</div><div className="stat-lbl">Interações</div></div>
      </div>

      <section id="catalogo" className="features" style={{ paddingTop: 70, paddingBottom: 46 }}>
        <div className="section-eyebrow">Pesquisa</div>
        <h2 className="section-title display" style={{ marginBottom: 20, maxWidth: 720 }}>Filtre os itens/produtos e reexiba tudo com um clique</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 12 }}>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por apelido, espécie ou nome científico"
            style={{ padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--sand)', fontSize: 14 }}
          />
          <button type="button" className="btn btn-ghost" onClick={limparFiltros}>Reexibir todos</button>
        </div>

        <div className="filter-row" style={{ marginBottom: 16 }}>
          {[
            ['TODAS', 'Todas'],
            ['ADOCAO', 'Disponíveis'],
            ['FACIL', 'Fácil'],
            ['MEDIO', 'Médio'],
            ['DIFICIL', 'Difícil'],
          ].map(([k, l]) => (
            <button type="button" key={k} className={`fbtn${filtro === k ? ' active' : ''}`} onClick={() => setFiltro(k)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <h3>Nenhum item encontrado</h3>
            <p>Ajuste os filtros ou use o botão "Reexibir todos".</p>
          </div>
        ) : (
          <div className="feed-grid">
            {filtradas.slice(0, 8).map((p) => <CardPlanta key={p.id} planta={p} navigate={navigate} />)}
          </div>
        )}
      </section>

      <section id="destaques" className="features" style={{ paddingTop: 0, paddingBottom: 46 }}>
        <div className="section-eyebrow">Destaques</div>
        <h2 className="section-title display" style={{ marginBottom: 20, maxWidth: 680 }}>Itens com mais atividade na plataforma</h2>
        <div className="feed-grid">
          {destaques.map((p) => <CardPlanta key={p.id} planta={p} navigate={navigate} />)}
        </div>
      </section>

      <section id="ultimos" className="features" style={{ paddingTop: 0, paddingBottom: 46 }}>
        <div className="section-eyebrow">Últimos cadastrados</div>
        <h2 className="section-title display" style={{ marginBottom: 20, maxWidth: 680 }}>Veja o que entrou recentemente na tabela principal</h2>
        <div className="feed-grid">
          {ultimos.map((p) => <CardPlanta key={p.id} planta={p} navigate={navigate} />)}
        </div>
      </section>

      <section className="features" style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div className="section-eyebrow">Melhor avaliação</div>
        <h2 className="section-title display" style={{ marginBottom: 20, maxWidth: 680 }}>Top itens com melhor desempenho geral</h2>
        <div className="feed-grid">
          {melhorAvaliacao.map((p) => <CardPlanta key={p.id} planta={p} navigate={navigate} />)}
        </div>
      </section>

      <footer className="lfoot">
        <div className="lfoot-logo">Brotou</div>
        <div className="lfoot-links">
          <a>Sobre</a><a>Termos</a><a>Privacidade</a><a>Contato</a>
        </div>
        <div className="lfoot-copy">© 2026 Brotou. Catálogo e interações da comunidade.</div>
      </footer>
    </div>
  )
}
