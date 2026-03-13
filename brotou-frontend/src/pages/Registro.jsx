import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { usuariosApi } from '../services/api'

export default function Registro() {
  const { loginUsuario, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem'); return }
    setLoading(true); setErro('')
    try {
      const res = await usuariosApi.criar({ nome: form.nome, email: form.email })
      loginUsuario(res.dados)
      toast('Conta criada! Bem-vindo ao Brotou!')
      navigate('/home')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      <div className="auth-layout">
        <div className="auth-left">
          <img className="auth-bg" src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=900&q=85" alt="" />
          <div className="auth-left-content">
            <Link to="/" className="auth-logo-mark" style={{ color: 'white', textDecoration: 'none' }}>Brotou</Link>
            <div>
              <div className="auth-tagline">Cada planta<br />tem uma<br /><em>história</em><br />para contar.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Ao criar sua conta</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'rgba(255,255,255,.9)' }}>
                <div>Badge "Primeira Planta" desbloqueado</div>
                <div>Acesso ao catálogo completo de espécies</div>
                <div>Rede de adoção temporária gratuita</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-form-logo">Brotou</Link>
            <h1 className="auth-h1">Criar conta</h1>
            <p className="auth-sub">Comece a cuidar do seu jardim digital.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {erro && <div className="error-msg">{erro}</div>}
              <div className="field">
                <label>Nome completo</label>
                <input name="nome" placeholder="Ana Silva" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Senha</label>
                  <input type="password" name="senha" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Confirmar</label>
                  <input type="password" name="confirmar" placeholder="Repita a senha" value={form.confirmar} onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: 13 }} disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </form>
            <div className="auth-switch">Já tem conta? <Link to="/login">Entrar</Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}
