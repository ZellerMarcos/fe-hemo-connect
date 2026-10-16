import { request } from './api'
import type {
  DadosTitular,
  ExclusaoTitularResponse,
  ExportacaoTitular,
  RevogacaoConsentimentoRequest,
  RevogacaoConsentimentoResponse,
} from '../types/privacidade'

// Consulta os dados atuais do titular autenticado.
export function consultarMeusDados() {
  return request<DadosTitular>('/privacy/me', {
    method: 'GET',
  })
}

// Exporta um snapshot estruturado dos dados do titular.
export function exportarMeusDados() {
  return request<ExportacaoTitular>('/privacy/export', {
    method: 'GET',
  })
}

// Revoga um consentimento especifico por finalidade.
export function revogarConsentimento(data: RevogacaoConsentimentoRequest) {
  return request<RevogacaoConsentimentoResponse>('/privacy/consent/revoke', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Solicita exclusao com anonimizaçao dos dados do titular.
export function excluirMeusDados() {
  return request<ExclusaoTitularResponse>('/privacy/me', {
    method: 'DELETE',
  })
}
