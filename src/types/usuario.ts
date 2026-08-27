export type UsuarioPerfil = 'DOADOR'
export type UsuarioStatus = 'ATIVO'

export interface CadastroUsuario {
  nome: string
  cpf: string
  email: string
  senha: string
  perfil: UsuarioPerfil
  status: UsuarioStatus
  hemocentro_id: null
}

export interface UsuarioPublico {
  id: number
  nome: string
  email: string
  perfil: string
  status: string
  hemocentro_id: number | null
}