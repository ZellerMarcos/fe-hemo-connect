export type ResultadoTriagem = 'APTO' | 'INAPTO' | 'ENCAMINHADO_MEDICO'
export type StatusTriagem = 'AGUARDANDO_TRIAGEM' | 'EM_TRIAGEM' | ResultadoTriagem

export interface RespostaPreTriagem {
  pergunta: string
  resposta: string
}

export interface Agendamento {
  id: number
  hemocentro_id: number
  agendado_em: string
  status: 'AGENDADO' | 'CANCELADO' | StatusTriagem
  recebido_em: string | null
  horario_id: number | null
  versao: number
  cancelavel_ate: string | null
  remarcavel_ate: string | null
  cancelado_em: string | null
}

export interface FilaItem extends Agendamento {
  nome: string
  cpf_mascarado: string
  tipo_sanguineo: string | null
  enfermeiro_id: number | null
}

export interface FilaResponse {
  itens: FilaItem[]
  total: number
  pagina: number
  tamanho: number
}

export interface Indicadores {
  pendentes: number
  em_atendimento: number
  concluidas: number
  encaminhadas_medico: number
}

export interface HistoricoItem {
  agendamento_id: number
  data: string
  tipo: 'Triagem'
  resultado: ResultadoTriagem
}

export interface TriagemDetalhe {
  agendamento: Agendamento
  doador: {
    nome: string
    cpf: string
    data_nascimento: string | null
    telefone: string | null
    email: string
    tipo_sanguineo: string | null
  }
  pre_triagem: RespostaPreTriagem[]
  historico: HistoricoItem[]
  avaliacao: {
    enfermeiro_id: number
    iniciada_em: string
    finalizada_em: string | null
    observacoes: string | null
    resultado: ResultadoTriagem | null
    versao: number
  } | null
}
