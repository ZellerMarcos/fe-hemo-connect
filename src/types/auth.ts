export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginUserResponse {
  id: number
  nome: string
  email: string
  perfil: string
  status: string
  hemocentro_id: number | null
}

export interface LoginTwoFactorResponse {
  requires_2fa: true
}

export type LoginResponse = LoginUserResponse | LoginTwoFactorResponse

export interface TwoFactorVerifyRequest {
  email: string
  code: string
}

export interface TwoFactorVerifyResponse {
  authenticated: boolean
}