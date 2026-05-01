import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { usuariosApi } from '../services/api'

export default function Login() {
  const { loginUsuario, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identificador: '', senha: '', manterConectado: true })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const res = await usuariosApi.login(form.identificador, form.senha)
      loginUsuario(res.dados, res.token, { manterConectado: form.manterConectado })
      toast('Bem-vindo ao Brotou!')
      navigate('/home')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
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
                <label>E-mail ou username</label>
                <input name="identificador" placeholder="seu@email.com ou @usuario" value={form.identificador} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Senha</label>
                <input type="password" name="senha" placeholder="********" value={form.senha} onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="manterConectado"
                    checked={form.manterConectado}
                    onChange={handleChange}
                  />
                  Manter conectado
                </label>
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
