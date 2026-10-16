export type UsuarioPerfil = 'DOADOR' | 'ENFERMEIRO'
export type UsuarioStatus = 'ATIVO' | 'INATIVO'
export const COREN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const
export type CorenUF = typeof COREN_UFS[number]
export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

// O payload de criação do usuário reúne os dados obrigatórios do cadastro inicial do doador.
interface CadastroBase {
  nome: string
  cpf: string
  email: string
  senha: string
  hemocentro_id: null
  data_nascimento?: string | null
  telefone?: string | null
  tipo_sanguineo?: TipoSanguineo | null
  consentimento_aceito: boolean
  consentimento_versao: string
  consentimento_finalidades: string[]
}

export type CadastroUsuario = CadastroBase & (
  { perfil: 'DOADOR'; status: 'ATIVO'; coren_numero?: never; coren_uf?: never }
  | { perfil: 'ENFERMEIRO'; status: 'INATIVO'; coren_numero: string; coren_uf: CorenUF }
)

// A resposta pública do backend expõe os dados básicos do usuário sem expor informações privadas sensíveis.
export interface UsuarioPublico {
  id: number
  nome: string
  email: string
  perfil: string
  status: string
  hemocentro_id: number | null
  aprovacao_pendente: boolean
  coren_numero: string | null
  coren_uf: CorenUF | null
}

export interface EnfermeiroPendente {
  id: number
  nome: string
  email: string
  coren_numero: string
  coren_uf: CorenUF
}

export interface AprovacoesPendentes {
  itens: EnfermeiroPendente[]
  total: number
  pagina: number
  tamanho: number
}