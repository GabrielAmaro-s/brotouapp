import { Link } from 'react-router-dom'

const FOTO_HERO = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85'
const FOTO_LOGO = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=60&q=80'

export default function Landing() {
  return (
    <div id="page-landing" className="page-enter">
      <nav className="lnav">
        <Link to="/" className="lnav-logo">
          <img src={FOTO_LOGO} alt="Brotou" />
          Brotou
        </Link>
        <div className="lnav-links">
          <a>Funcionalidades</a>
          <a>Espécies</a>
          <a>Comunidade</a>
        </div>
        <div className="lnav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Criar conta</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Para quem ama plantas</div>
          <h1 className="hero-title display">Seu jardim <em>vive</em>, cresce e floresce</h1>
          <p className="hero-sub">Registre cada detalhe das suas plantas, acompanhe o crescimento ao longo do tempo e encontre cuidadores de confiança quando precisar viajar.</p>
          <div className="hero-ctas">
            <Link to="/registro" className="btn btn-primary btn-lg">Começar de graça</Link>
            <Link to="/home" className="btn btn-ghost btn-lg">Ver demonstração</Link>
          </div>
        </div>
        <div className="hero-right">
          <img className="hero-img-main" src={FOTO_HERO} alt="Plantas em casa" />
          <div className="hero-img-overlay" />
          <div className="hero-float-card">
            <div className="hfc-label">Plantas cadastradas</div>
            <div className="hfc-val">2.400+</div>
            <div className="hfc-sub">pela comunidade Brotou</div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item"><div className="stat-num">2.4k</div><div className="stat-lbl">Plantas</div></div>
        <div className="stat-item"><div className="stat-num">180+</div><div className="stat-lbl">Espécies</div></div>
        <div className="stat-item"><div className="stat-num">830</div><div className="stat-lbl">Usuários</div></div>
        <div className="stat-item"><div className="stat-num">340</div><div className="stat-lbl">Adoções</div></div>
      </div>

      <section className="features">
        <div className="section-eyebrow">Por que o Brotou</div>
        <h2 className="section-title display">Tudo que suas plantas precisam, num só lugar</h2>
        <div className="feat-grid">
          {[
            { title: 'Diário de cuidados', desc: 'Registre rega, adubação, poda e observações. Veja a evolução da sua planta ao longo do tempo com histórico completo.' },
            { title: 'Adoção temporária', desc: 'Viajando? Encontre cuidadores de confiança na comunidade. Acompanhe cada ação feita pelo cuidador em tempo real.' },
            { title: 'Catálogo de espécies', desc: 'Mais de 180 espécies catalogadas com dicas de rega, nível de luz ideal e grau de dificuldade de cuidado.' },
            { title: 'Perfil do jardim', desc: 'Mostre sua coleção para a comunidade. Conquistas e badges para quem cuida bem e mantém o diário em dia.' },
            { title: 'Lembretes de rega', desc: 'Nunca mais esqueça de regar. Configure lembretes personalizados para cada planta com base na frequência ideal.' },
            { title: 'Álbum de crescimento', desc: 'Fotografe cada etapa do desenvolvimento. Linha do tempo visual para acompanhar a evolução das suas plantas.' },
          ].map((f) => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3D6130" strokeWidth="1.8" width="26" height="26">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-banner">
        <div className="cta-banner-left">
          <h2>Pronto para fazer brotar?</h2>
          <p>Cadastre-se agora e comece a cuidar melhor das suas plantas. Grátis para sempre.</p>
          <Link to="/registro" className="btn btn-primary btn-lg">Criar conta grátis</Link>
        </div>
        <div className="cta-banner-right">
          <img src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?w=500&q=80" alt="Plantas" />
        </div>
      </div>

      <footer className="lfoot">
        <div className="lfoot-logo">Brotou</div>
        <div className="lfoot-links">
          <a>Sobre</a><a>Termos</a><a>Privacidade</a><a>Contato</a>
        </div>
        <div className="lfoot-copy">© 2025 Brotou. Feito para amantes de plantas.</div>
      </footer>
    </div>
  )
}
