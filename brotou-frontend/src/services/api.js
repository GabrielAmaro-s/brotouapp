const BASE_URL = import.meta.env.VITE_API_URL || 'https://brotouapp-production.up.railway.app'

async function request(path, options = {}) {
  const token = localStorage.getItem('brotou_token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.mensagem || 'Erro na requisição')
  }

  return data
}

function buildQuery(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString()
  return query ? `${path}?${query}` : path
}

export const usuariosApi = {
  listar: (params = {}) => request(buildQuery('/usuarios', params)),
  buscar: (id) => request(`/usuarios/${id}`),
  criar: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
}

export const especiesApi = {
  listar: (params = {}) => request(buildQuery('/especies', params)),
  buscar: (id) => request(`/especies/${id}`),
  criar: (data) => request('/especies', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/especies/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/especies/${id}`, { method: 'DELETE' }),
}

export const plantasApi = {
  listar: (params = {}) => request(buildQuery('/plantas', params)),
  buscar: (id) => request(`/plantas/${id}`),
  criar: (data) => request('/plantas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/plantas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/plantas/${id}`, { method: 'DELETE' }),
}

export const entradasApi = {
  listar: (params = {}) => request(buildQuery('/entradas', params)),
  buscar: (id) => request(`/entradas/${id}`),
  criar: (data) => request('/entradas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id, data) => request(`/entradas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remover: (id) => request(`/entradas/${id}`, { method: 'DELETE' }),
}

export const adocoesApi = {
  listar: (params = {}) => request(buildQuery('/adocoes', params)),
  buscar: (id) => request(`/adocoes/${id}`),
  criar: (data) => request('/adocoes', { method: 'POST', body: JSON.stringify(data) }),
  aceitar: (id) => request(`/adocoes/${id}/aceitar`, { method: 'PATCH' }),
  concluir: (id) => request(`/adocoes/${id}/concluir`, { method: 'PATCH' }),
  remover: (id) => request(`/adocoes/${id}`, { method: 'DELETE' }),
}

export const adminApi = {
  dashboard: () => {
    const token = localStorage.getItem('brotou_admin_token')
    return request('/admins/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  listarUsuarios: () => request('/usuarios'),
}
