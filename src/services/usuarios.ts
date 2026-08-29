import { request } from './api'
import type { CadastroUsuario, UsuarioPublico } from '../types/usuario'

export function cadastrarUsuario(data: CadastroUsuario) {
  return request<UsuarioPublico>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}