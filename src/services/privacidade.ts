import { request } from './api'
import type {
  DadosTitular,
  ExclusaoTitularResponse,
  ExportacaoTitular,
  RevogacaoConsentimentoRequest,
  RevogacaoConsentimentoResponse,
} from '../types/privacidade'

// Centraliza o cabecalho de sessao exigido pelo backend para operacoes do titular.
function sessionHeaders(email: string): HeadersInit {
  return {
    'X-User-Email': email,
  }
}

// Consulta os dados atuais do titular autenticado.
export function consultarMeusDados(email: string) {
  return request<DadosTitular>('/privacy/me', {
    method: 'GET',
    headers: sessionHeaders(email),
  })
}

// Exporta um snapshot estruturado dos dados do titular.
export function exportarMeusDados(email: string) {
  return request<ExportacaoTitular>('/privacy/export', {
    method: 'GET',
    headers: sessionHeaders(email),
  })
}

// Revoga um consentimento especifico por finalidade.
export function revogarConsentimento(email: string, data: RevogacaoConsentimentoRequest) {
  return request<RevogacaoConsentimentoResponse>('/privacy/consent/revoke', {
    method: 'POST',
    headers: sessionHeaders(email),
    body: JSON.stringify(data),
  })
}

// Solicita exclusao com anonimizaçao dos dados do titular.
export function excluirMeusDados(email: string) {
  return request<ExclusaoTitularResponse>('/privacy/me', {
    method: 'DELETE',
    headers: sessionHeaders(email),
  })
}
