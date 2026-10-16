import { request } from './api'
import type { Agendamento, FilaResponse, HistoricoItem, Indicadores, RespostaPreTriagem, ResultadoTriagem, TriagemDetalhe } from '../types/triagem'
import type { Reserva } from '../types/agenda'

export function consultarIndicadores(signal?: AbortSignal) {
  return request<Indicadores>('/triagens/indicadores', { signal })
}

export function listarTriagens(params: URLSearchParams, signal?: AbortSignal) {
  return request<FilaResponse>(`/triagens?${params}`, { signal })
}

export function consultarTriagem(id: number, signal?: AbortSignal) {
  return request<TriagemDetalhe>(`/triagens/${id}`, { signal })
}

export function iniciarTriagem(id: number) {
  return request<TriagemDetalhe>(`/triagens/${id}/iniciar`, { method: 'POST' })
}

export function salvarAvaliacao(id: number, observacoes: string, versao: number) {
  return request<TriagemDetalhe>(`/triagens/${id}`, {
    method: 'PUT', body: JSON.stringify({ observacoes, versao }),
  })
}

export function finalizarTriagem(id: number, observacoes: string, versao: number, resultado: ResultadoTriagem) {
  return request<TriagemDetalhe>(`/triagens/${id}/finalizar`, {
    method: 'POST', body: JSON.stringify({ observacoes, versao, resultado }),
  })
}

export function listarRecepcao(pagina = 1, signal?: AbortSignal) {
  return request<FilaResponse>(`/recepcao/agendamentos?pagina=${pagina}`, { signal })
}

export function receberDoador(id: number, versao: number) {
  return request<Agendamento>(`/recepcao/agendamentos/${id}/receber`, {
    method: 'POST', body: JSON.stringify({ versao }),
  })
}

export function meusAgendamentos(signal?: AbortSignal) {
  return request<Reserva[]>('/agendamentos/me', { signal })
}

export function meuHistorico(signal?: AbortSignal) {
  return request<HistoricoItem[]>('/historico/me', { signal })
}

export function agendar(data: { horario_id: number; chave_requisicao: string; respostas_pre_triagem: RespostaPreTriagem[] }) {
  return request<Reserva>('/agendamentos', { method: 'POST', body: JSON.stringify(data) })
}
