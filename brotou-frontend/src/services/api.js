const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('brotou_token')
  const adminToken = localStorage.getItem('brotou_admin_token')

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (adminToken && !token) headers['Authorization'] = `Bearer ${adminToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ mensagem: 'Erro desconhecido' }))
    throw new Error(err.mensagem || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  loginAdmin: (email, senha) =>
    request('/admins/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
}

// ─── Usuários ──────────────────────────────────────────────────
export const usuariosApi = {
  listar: (params = {}) => request(`/usuarios?${new URLSearchParams(params)}`),
  buscar: (id) => request(`/usuarios/${id}`),
  criar: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
}

// ─── Espécies ──────────────────────────────────────────────────
export const especiesApi = {
  listar: (params = {}) => request(`/especies?${new URLSearchParams(params)}`),
  buscar: (id) => request(`/especies/${id}`),
  criar: (data) => request('/especies', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/especies/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/especies/${id}`, { method: 'DELETE' }),
}

// ─── Plantas ──────────────────────────────────────────────────
export const plantasApi = {
  listar: (params = {}) => request(`/plantas?${new URLSearchParams(params)}`),
  buscar: (id) => request(`/plantas/${id}`),
  criar: (data) => request('/plantas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/plantas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/plantas/${id}`, { method: 'DELETE' }),
}

// ─── Entradas do Diário ────────────────────────────────────────
export const entradasApi = {
  listar: (params = {}) => request(`/entradas?${new URLSearchParams(params)}`),
  buscar: (id) => request(`/entradas/${id}`),
  criar: (data) => request('/entradas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/entradas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/entradas/${id}`, { method: 'DELETE' }),
}

// ─── Adoções ──────────────────────────────────────────────────
export const adocoesApi = {
  listar: (params = {}) => request(`/adocoes?${new URLSearchParams(params)}`),
  buscar: (id) => request(`/adocoes/${id}`),
  criar: (data) => request('/adocoes', { method: 'POST', body: JSON.stringify(data) }),
  aceitar: (id) => request(`/adocoes/${id}/aceitar`, { method: 'PATCH' }),
  concluir: (id) => request(`/adocoes/${id}/concluir`, { method: 'PATCH' }),
  remover: (id) => request(`/adocoes/${id}`, { method: 'DELETE' }),
}

// ─── Admin ────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => {
    const token = localStorage.getItem('brotou_admin_token')
    return request('/admins/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  listarUsuarios: () => request('/usuarios'),
}
