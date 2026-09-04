// Define os valores permitidos para perfil e status do usuário doador no sistema.
export type UsuarioPerfil = 'DOADOR'
export type UsuarioStatus = 'ATIVO'

// O payload de criação do usuário reúne os dados obrigatórios do cadastro inicial do doador.
export interface CadastroUsuario {
  nome: string
  cpf: string
  email: string
  senha: string
  perfil: UsuarioPerfil
  status: UsuarioStatus
  hemocentro_id: null
}

// A resposta pública do backend expõe os dados básicos do usuário sem expor informações privadas sensíveis.
export interface UsuarioPublico {
  id: number
  nome: string
  email: string
  perfil: string
  status: string
  hemocentro_id: number | null
}