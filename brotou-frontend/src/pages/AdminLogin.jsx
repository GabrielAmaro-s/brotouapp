import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { adminApi } from '../services/api'

export default function AdminLogin() {
  const { loginAdmin, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@brotou.app', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setErro('')
    try {
      const res = await adminApi.login(form.email, form.senha)
      loginAdmin(res.admin, res.token)
      toast('Bem-vindo, Administrador!')
      navigate('/admin')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adm-bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 40, background: 'var(--adm-bg2)', borderRadius: 16, border: '1px solid var(--adm-border)' }}>
        <div style={{ fontFamily: 'var(--ff-d)', fontSize: 22, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 8 }}>
          Brotou <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'var(--adm-blue)', color: '#fff', padding: '2px 7px', borderRadius: 4, marginLeft: 4, fontFamily: 'var(--ff-b)' }}>Admin</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--adm-muted)', marginBottom: 28 }}>Acesso restrito ao painel administrativo</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {erro && <div className="error-msg">{erro}</div>}
          <div className="field">
            <label style={{ color: 'var(--adm-muted)' }}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{ background: 'var(--adm-bg3)', border: '1px solid var(--adm-border)', color: 'var(--adm-text)' }}
            />
          </div>
          <div className="field">
            <label style={{ color: 'var(--adm-muted)' }}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
              style={{ background: 'var(--adm-bg3)', border: '1px solid var(--adm-border)', color: 'var(--adm-text)' }}
            />
          </div>
          <button type="submit" className="adm-btn adm-btn-primary btn-full" style={{ marginTop: 4, padding: 12, justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar painel'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--adm-muted)' }}>← Voltar para o login</Link>
        </div>
      </div>
    </div>
  )
}