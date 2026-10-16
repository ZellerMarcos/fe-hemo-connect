import { request } from './api'
import type { AprovacoesPendentes, CadastroUsuario, UsuarioPublico } from '../types/usuario'

// O cadastro do usuário envia os dados do novo perfil para a API e retorna a representação pública do registro criado.
export function cadastrarUsuario(data: CadastroUsuario) {
  const path = data.perfil === 'ENFERMEIRO' ? '/usuarios/solicitar-enfermagem' : '/usuarios'
  return request<UsuarioPublico>(path, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listarEnfermeirosPendentes(pagina = 1, signal?: AbortSignal) {
  return request<AprovacoesPendentes>(`/usuarios/aprovacoes/pendentes?pagina=${pagina}`, { signal })
}

export function aprovarEnfermeiro(id: number, hemocentroId: number) {
  return request<UsuarioPublico>(`/usuarios/aprovacoes/${id}/aprovar`, {
    method: 'POST',
    body: JSON.stringify({ hemocentro_id: hemocentroId, conferencia_confirmada: true }),
  })
}