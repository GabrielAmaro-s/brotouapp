import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { usuariosApi, authApi } from '../services/api'

export default function Login() {
  const { loginUsuario, loginAdmin, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      // Para demo: busca usuário pelo e-mail
      const res = await usuariosApi.listar()
      const usuario = res.dados?.find(u => u.email === form.email)
      if (!usuario) throw new Error('Usuário não encontrado')
      loginUsuario(usuario)
      toast('Bem-vindo ao Brotou!')
      navigate('/home')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    navigate('/admin-login')
  }

  return (
    <div className="page-enter">
      <div className="auth-layout">
        <div className="auth-left">
          <img className="auth-bg" src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85" alt="" />
          <div className="auth-left-content">
            <Link to="/" className="auth-logo-mark" style={{ color: 'white', textDecoration: 'none' }}>Brotou</Link>
            <div>
              <div className="auth-tagline">Seu jardim<br />está com<br /><em>saudades</em><br />de você.</div>
            </div>
            <ul className="auth-feat-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Diário de cuidados completo
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Rede de adoção temporária
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Catálogo com 180+ espécies
              </li>
            </ul>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-form-logo">Brotou</Link>
            <h1 className="auth-h1">Bem-vindo de volta</h1>
            <p className="auth-sub">Suas plantas estão esperando por você.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {erro && <div className="error-msg">{erro}</div>}
              <div className="field">
                <label>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Senha</label>
                <input type="password" name="senha" placeholder="••••••••" value={form.senha} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: 13, color: 'var(--sage)' }}>Esqueci minha senha</a>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: 13 }} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <div className="or-divider">ou</div>
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button type="button" onClick={handleAdminLogin} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--sage)', cursor: 'pointer' }}>
                  Entrar como admin
                </button>
              </div>
            </form>
            <div className="auth-switch">
              Não tem conta? <Link to="/registro">Criar conta grátis</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
