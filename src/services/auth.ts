import { request } from './api'
import type {
  LoginRequest,
  LoginResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
} from '../types/auth'

export function entrar(data: LoginRequest) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function verifyTwoFactor(data: TwoFactorVerifyRequest) {
  return request<TwoFactorVerifyResponse>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}