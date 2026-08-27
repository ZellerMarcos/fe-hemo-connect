import { request } from './api'
import type { LoginRequest, LoginResponse } from '../types/auth'

export function entrar(data: LoginRequest) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}