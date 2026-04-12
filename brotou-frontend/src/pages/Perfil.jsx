import { useState } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../contexts/AppContext'
import { useApi } from '../hooks/useApi'
import { plantasApi, entradasApi, usuariosApi } from '../services/api'

const CONQUISTAS = [
  { id: 1, nome: 'Primeira Planta', desc: 'Cadastrou a 1ª', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&q=80' },
  { id: 2, nome: 'Regador Fiel', desc: '10 regas seguidas', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=80&q=80' },
  { id: 3, nome: 'Cuidador', desc: '1ª adoção feita', img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=80&q=80' },
  { id: 4, nome: 'Diário Ativo', desc: '30 entradas', img: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=80&q=80' },
]

export default function Perfil() {
  const { usuario, loginUsuario, toast } = useApp()
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    username: usuario?.username || '',
    email: usuario?.email || '',
  })
  const [toggles, setToggles] = useState({ lembretes: true, emails: true, publico: false })

  const { data: plantasRes } = useApi(() => plantasApi.listar({ donoId: usuario?.id }), [usuario?.id])
  const { data: entradasRes } = useApi(() => entradasApi.listar({ autorId: usuario?.id }), [usuario?.id])

  const totalPlantas = plantasRes?.total || 0
  const totalEntradas = entradasRes?.total || 0

  const earnedIds = [1, 2, 3]

  const handleSave = async () => {
    try {
      const res = await usuariosApi.atualizar(usuario.id, {
        nome: form.nome,
        username: form.username,
        email: form.email,
      })
      loginUsuario(res.dados)
      toast('Perfil atualizado!')
    } catch (err) {
      toast('Erro: ' + err.message)
    }
  }

  const togglePref = (k) => setToggles(p => ({ ...p, [k]: !p[k] }))

  return (
    <AppShell activePage="perfil">
      <div className="page-hd"><div><h1>Meu Perfil</h1></div></div>
      <div className="perfil-layout">
        <div>
          <div className="perfil-card">
            {usuario?.urlAvatar
              ? <img className="perfil-avatar" src={usuario.urlAvatar} alt={usuario.nome} />
              : <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'var(--ff-d)', fontWeight: 700, fontSize: 32, color: 'var(--moss)', border: '3px solid var(--sage-lt)' }}>
                {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            }
            <div className="perfil-name">{usuario?.nome}</div>
            <div className="perfil-email">@{usuario?.username}</div>
            <div className="perfil-email">{usuario?.email}</div>
            <div className="perf-stats">
              <div className="ps"><div className="ps-num">{totalPlantas}</div><div className="ps-lbl">Plantas</div></div>
              <div className="ps"><div className="ps-num">{totalEntradas}</div><div className="ps-lbl">Entradas</div></div>
              <div className="ps"><div className="ps-num">{earnedIds.length}</div><div className="ps-lbl">Conquistas</div></div>
              <div className="ps"><div className="ps-num">0</div><div className="ps-lbl">Adoções</div></div>
            </div>
          </div>
        </div>

        <div>
          <div className="perfil-sec">
            <h3>Dados pessoais</h3>
            <div className="form-grid-2">
              <div className="field"><label>Nome</label><input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
              <div className="field"><label>Username</label><input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
              <div className="field"><label>E-mail</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="field"><label>Senha atual</label><input type="password" placeholder="********" /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Salvar alterações</button>
            </div>
          </div>

          <div className="perfil-sec">
            <h3>Preferências</h3>
            {[
              { k: 'lembretes', l: 'Lembretes de rega', d: 'Notificações quando for hora de regar' },
              { k: 'emails', l: 'E-mails da comunidade', d: 'Novidades e solicitações de adoção' },
              { k: 'publico', l: 'Perfil público', d: 'Outros usuários podem ver suas plantas' },
            ].map(({ k, l, d }) => (
              <div className="pref-r" key={k}>
                <div><div className="pref-lbl">{l}</div><div className="pref-desc">{d}</div></div>
                <button className={`toggle ${toggles[k] ? 'on' : 'off'}`} onClick={() => togglePref(k)}>
                  <span className="toggle-k" />
                </button>
              </div>
            ))}
          </div>

          <div className="perfil-sec">
            <h3>Conquistas</h3>
            <div className="conquistas-g">
              {CONQUISTAS.map(c => (
                <div key={c.id} className={`conq${earnedIds.includes(c.id) ? ' earned' : ''}`}>
                  <div className="conq-icon"><img src={c.img} alt={c.nome} /></div>
                  <div className="conq-name">{c.nome}</div>
                  <div className="conq-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
