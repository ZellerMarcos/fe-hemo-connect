import { clearAccessToken, getAccessToken } from './session'

function resolveApiUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim()
  if (!configuredUrl) {
    throw new Error('VITE_API_URL deve ser definida para executar o frontend.')
  }

  const normalized = configuredUrl.replace(/\/+$/, '')
  const parsed = new URL(normalized)
  const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'

  if (import.meta.env.PROD && parsed.protocol !== 'https:') {
    throw new Error('VITE_API_URL deve usar HTTPS em produção.')
  }

  if (!import.meta.env.PROD && parsed.protocol !== 'https:' && !isLocalHost) {
    throw new Error('Ambiente de desenvolvimento permite HTTP apenas para localhost/127.0.0.1.')
  }

  return normalized
}

const API_URL = resolveApiUrl()

// A função request centraliza a comunicação HTTP da aplicação, padronizando URL base, headers e tratamento de erros do backend.
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Centralizar o fetch mantém a URL base, os headers e o padrão de tratamento de erros em um único ponto.
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // O cliente transforma qualquer falha HTTP em uma exceção padronizada para as páginas.
    let message = 'Não foi possível concluir a operação.'
    try {
      const body: { detail?: unknown } = await response.json()
      if (response.status < 500 && typeof body.detail === 'string') message = body.detail
      if (response.status === 422 && Array.isArray(body.detail)) message = 'Verifique os campos informados e tente novamente.'
      // Qualquer 401 em rotas protegidas sinaliza sessão inválida ou expirada; o app reage redirecionando para o login.
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
    }
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/2fa')) {
      clearAccessToken()
      window.dispatchEvent(new CustomEvent('session-expired'))
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}