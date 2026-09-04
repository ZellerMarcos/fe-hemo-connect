import { request } from './api'
import type { CadastroUsuario, UsuarioPublico } from '../types/usuario'

// O cadastro do usuário envia os dados do novo perfil para a API e retorna a representação pública do registro criado.
export function cadastrarUsuario(data: CadastroUsuario) {
  return request<UsuarioPublico>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}