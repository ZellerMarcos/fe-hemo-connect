// Define o payload enviado pelo frontend para autenticar um usuário com e-mail e senha.
export interface LoginRequest {
  email: string
  senha: string
}

// Estrutura da resposta do backend após login válido, incluindo dados do perfil do usuário.
export interface LoginUserResponse {
  id: number
  nome: string
  email: string
  perfil: string
  status: string
  hemocentro_id: number | null
}

// O backend indica que a autenticação precisa de uma segunda etapa de confirmação em 2FA.
export interface LoginTwoFactorResponse {
  requires_2fa: true
}

export type LoginResponse = LoginUserResponse | LoginTwoFactorResponse

// O código de verificação é enviado para o backend para confirmar a segunda etapa da autenticação.
export interface TwoFactorVerifyRequest {
  email: string
  code: string
}

// A confirmação do 2FA retorna se a validação foi aceita e o nome do usuário autenticado.
export interface TwoFactorVerifyResponse {
  authenticated: boolean
  nome: string
}

// O pedido de recuperação de senha informa ao backend o e-mail que deve receber o link seguro.
export interface PasswordResetRequest {
  email: string
}

// A resposta confirma que a solicitação de link foi processada pelo servidor.
export interface PasswordResetResponse {
  sent: boolean
}

// O payload de redefinição recebe o token do link e a nova senha escolhida pelo usuário.
export interface PasswordResetSubmitRequest {
  token: string
  senha: string
}

// A confirmação final indica que a senha foi atualizada com sucesso.
export interface PasswordResetSubmitResponse {
  reset: boolean
}