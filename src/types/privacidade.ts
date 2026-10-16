import type { ResultadoTriagem, RespostaPreTriagem } from './triagem'
import type { CorenUF } from './usuario'
import type { AlteracaoReserva } from './agenda'

// Estrutura de cada consentimento associado ao titular para exibição em tela.
export interface Consentimento {
  finalidade: string
  versao_termo: string
  base_legal: string
  concedido: boolean
  concedido_em: string
  revogado_em: string | null
}

// Resposta principal de consulta LGPD do proprio titular autenticado.
export interface DadosTitular {
  nome: string
  cpf: string
  email: string
  perfil: string
  data_nascimento: string | null
  telefone: string | null
  tipo_sanguineo: string | null
  coren_numero: string | null
  coren_uf: CorenUF | null
  atendimentos: {
    agendado_em: string
    status: string
    pre_triagem: RespostaPreTriagem[]
    observacoes: string | null
    resultado: ResultadoTriagem | null
    finalizada_em: string | null
    alteracoes: AlteracaoReserva[]
  }[]
  consentimentos: Consentimento[]
}

// Pacote de exportacao com dados do titular e timestamp de emissao.
export interface ExportacaoTitular {
  titular: DadosTitular
  exportado_em: string
}

// Payload para revogar consentimento por finalidade.
export interface RevogacaoConsentimentoRequest {
  finalidade: string
}

// Resposta de confirmacao da revogacao executada pelo backend.
export interface RevogacaoConsentimentoResponse {
  revogado: boolean
  finalidade: string
  revogado_em: string
}

// Retorno padrao da exclusao/anonimizacao do titular.
export interface ExclusaoTitularResponse {
  excluido: boolean
  mensagem: string
}
