import type { Agendamento } from './triagem'

export interface PeriodoAgenda {
  inicio: string
  fim: string
}

export interface PeriodoSemanal extends PeriodoAgenda {
  dia_semana: number
}

export interface ExcecaoAgenda {
  data: string
  periodos: PeriodoAgenda[]
}

export interface AgendaConfig {
  fuso_horario: string
  duracao_minutos: number
  capacidade: number
  antecedencia_minutos: number
  horizonte_dias: number
  cancelamento_minutos: number
  remarcacao_minutos: number
  publicada: boolean
  periodos: PeriodoSemanal[]
  excecoes: ExcecaoAgenda[]
  versao: number
}

export interface AgendaResponse {
  configurada: boolean
  configuracao: AgendaConfig | null
  pendencias_legadas: { id: number; agendado_em: string }[]
}

export interface HorarioDisponivel {
  id: number
  inicio: string
  fim: string
  vagas_disponiveis: number
}

export interface Disponibilidade {
  hemocentro_id: number
  fuso_horario: string | null
  situacao: 'DISPONIVEL' | 'SEM_AGENDA' | 'INATIVO' | 'SEM_VAGAS'
  mensagem: string
  dias: { data: string; motivo: string | null; horarios: HorarioDisponivel[] }[]
  avisos: string[]
}

export interface AlteracaoReserva {
  acao: 'RESERVADO' | 'REMARCADO' | 'CANCELADO' | 'CONCILIADO' | 'CANCELADO_CONTA_REMOVIDA'
  agendado_anterior: string
  agendado_novo: string | null
  ocorrido_em: string
}

export interface Reserva extends Agendamento {
  fuso_horario: string | null
  pode_cancelar: boolean
  pode_remarcar: boolean
  motivo_cancelamento: string | null
  motivo_remarcacao: string | null
  alteracoes: AlteracaoReserva[]
}

export interface AlteracaoRequest {
  versao: number
  chave_requisicao: string
}
