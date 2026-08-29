import { request } from './api'
import type {
  LoginRequest,
  LoginResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
} from '../types/auth'

export function entrar(data: LoginRequest) {
  // O endpoint de login valida e-mail e senha antes de avançar para a etapa de confirmação em 2FA.
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function verifyTwoFactor(data: TwoFactorVerifyRequest) {
  // O backend confirma o código enviado e, se estiver correto, autoriza a sessão do usuário.
  return request<TwoFactorVerifyResponse>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}