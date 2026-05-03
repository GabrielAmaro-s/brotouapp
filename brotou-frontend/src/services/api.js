const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

async function request(path, options = {}) {
  const { auth = 'user', headers = {}, ...rest } = options

  const token =
    auth === 'admin'
      ? localStorage.getItem('brotou_admin_token')
      : auth === 'user'
        ? localStorage.getItem('brotou_token') || sessionStorage.getItem('brotou_token')
        : null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const raw = await res.text()
  const data = raw ? JSON.parse(raw) : {}

  if (!res.ok) {
    throw new Error(data.mensagem || 'Erro na requisicao')
  }

  return data
}

function buildQuery(path, params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (entries.length === 0) return path
  const query = new URLSearchParams(entries).toString()
  return `${path}?${query}`
}

export const usuariosApi = {
  listar: (params = {}) => request(buildQuery('/usuarios', params), { auth: 'none' }),
  buscar: (id) => request(`/usuarios/${id}`, { auth: 'none' }),
  login: (identificador, senha) => request('/usuarios/login', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ identificador, senha }),
  }),
  criar: (data) => request('/usuarios', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(data),
  }),
  atualizar: (id, data) => request(`/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  remover: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
}

export const amizadesApi = {
  listar: (params = {}) => request(buildQuery('/amizades', params)),
  solicitar: (destinatarioId) => request('/amizades', {
    method: 'POST',
    body: JSON.stringify({ destinatarioId }),
  }),
  aceitar: (id) => request(`/amizades/${id}/aceitar`, { method: 'PATCH' }),
  recusar: (id) => request(`/amizades/${id}/recusar`, { method: 'PATCH' }),
  remover: (id) => request(`/amizades/${id}`, { method: 'DELETE' }),
}

export const especiesApi = {
  listar: (params = {}) => request(buildQuery('/especies', params), { auth: 'none' }),
  buscar: (id) => request(`/especies/${id}`, { auth: 'none' }),
  criar: (data) => request('/especies', {
    method: 'POST',
    auth: 'admin',
    body: JSON.stringify(data),
  }),
  atualizar: (id, data) => request(`/especies/${id}`, {
    method: 'PATCH',
    auth: 'admin',
    body: JSON.stringify(data),
  }),
  remover: (id) => request(`/especies/${id}`, {
    method: 'DELETE',
    auth: 'admin',
  }),
}

export const plantasApi = {
  listar: (params = {}) => request(buildQuery('/plantas', params), { auth: 'none' }),
  buscar: (id) => request(`/plantas/${id}`, { auth: 'none' }),
  criar: (data) => request('/plantas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/plantas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  remover: (id) => request(`/plantas/${id}`, { method: 'DELETE' }),
}

export const entradasApi = {
  listar: (params = {}) => request(buildQuery('/entradas', params), { auth: 'none' }),
  buscar: (id) => request(`/entradas/${id}`, { auth: 'none' }),
  criar: (data) => request('/entradas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/entradas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  remover: (id) => request(`/entradas/${id}`, { method: 'DELETE' }),
}

export const adocoesApi = {
  listar: (params = {}, options = {}) => request(buildQuery('/adocoes', params), { auth: options.auth || 'user' }),
  buscar: (id, options = {}) => request(`/adocoes/${id}`, { auth: options.auth || 'user' }),
  criar: (data) => request('/adocoes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id, data) => request(`/adocoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  aceitar: (id) => request(`/adocoes/${id}/aceitar`, { method: 'PATCH' }),
  concluir: (id) => request(`/adocoes/${id}/concluir`, { method: 'PATCH' }),
  confirmar: (id) => request(`/adocoes/${id}/confirmar`, { method: 'PATCH', auth: 'admin' }),
  responder: (id, respostaAdmin) => request(`/adocoes/${id}/responder`, {
    method: 'PATCH',
    auth: 'admin',
    body: JSON.stringify({ respostaAdmin }),
  }),
  enviarEmail: (id) => request(`/adocoes/${id}/enviar-email`, { method: 'PATCH', auth: 'admin' }),
  remover: (id, options = {}) => request(`/adocoes/${id}`, {
    method: 'DELETE',
    auth: options.auth || 'user',
  }),
}

export const adminApi = {
  login: (email, senha) => request('/admins/login', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ email, senha }),
  }),
  dashboard: () => request('/admins/dashboard', { auth: 'admin' }),
  listarUsuarios: () => request('/usuarios', { auth: 'admin' }),
  listarPlantas: (params = {}) => request(buildQuery('/plantas', params), { auth: 'admin' }),
  criarPlanta: (data) => request('/plantas', {
    method: 'POST',
    auth: 'admin',
    body: JSON.stringify(data),
  }),
}
