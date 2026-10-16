import { request } from './api'
import type { AgendaConfig, AgendaResponse, AlteracaoRequest, Disponibilidade, Reserva } from '../types/agenda'

export function consultarAgenda(centroId: number, signal?: AbortSignal) {
  return request<AgendaResponse>(`/hemocentros/${centroId}/agenda`, { signal })
}

export function configurarAgenda(centroId: number, data: AgendaConfig) {
  return request<AgendaResponse>(`/hemocentros/${centroId}/agenda`, { method: 'PUT', body: JSON.stringify(data) })
}

export function consultarDisponibilidade(centroId: number, inicio: string, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (inicio) params.set('inicio', inicio)
  return request<Disponibilidade>(`/hemocentros/${centroId}/disponibilidade?${params}`, { signal })
}

export function cancelarReserva(id: number, data: AlteracaoRequest) {
  return request<Reserva>(`/agendamentos/${id}/cancelar`, { method: 'POST', body: JSON.stringify(data) })
}

export function remarcarReserva(id: number, data: AlteracaoRequest & { horario_id: number }) {
  return request<Reserva>(`/agendamentos/${id}/remarcar`, { method: 'POST', body: JSON.stringify(data) })
}
