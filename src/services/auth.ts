import { request } from './api'
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetSubmitRequest,
  PasswordResetSubmitResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
} from '../types/auth'

// A função entrar envia as credenciais do usuário para o backend e inicia o fluxo de autenticação em duas etapas.
export function entrar(data: LoginRequest) {
  // O endpoint de login valida e-mail e senha antes de avançar para a etapa de confirmação em 2FA.
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// A verificação do código de 2FA confirma a identidade do usuário antes de liberar a sessão ativa.
export function verifyTwoFactor(data: TwoFactorVerifyRequest) {
  // O backend confirma o código enviado e, se estiver correto, autoriza a sessão do usuário.
  return request<TwoFactorVerifyResponse>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// A recuperação de senha solicita ao backend o envio do link seguro para o e-mail cadastrado do usuário.
export function solicitarResetSenha(data: PasswordResetRequest) {
  return request<PasswordResetResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// A redefinição final persiste a nova senha após validação do token recebido no link de recuperação.
export function redefinirSenha(data: PasswordResetSubmitRequest) {
  return request<PasswordResetSubmitResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}