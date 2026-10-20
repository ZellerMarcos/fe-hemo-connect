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

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

const VALIDATION_FIELD_LABELS: Record<string, string> = {
  fuso_horario: 'Fuso horário',
  duracao_minutos: 'Duração do horário',
  capacidade: 'Vagas por horário',
  antecedencia_minutos: 'Antecedência para reservar',
  horizonte_dias: 'Horizonte de reservas',
  cancelamento_minutos: 'Antecedência para cancelar',
  remarcacao_minutos: 'Antecedência para remarcar',
  publicada: 'Publicação',
  periodos: 'Períodos semanais',
  excecoes: 'Feriados e exceções',
  dia_semana: 'Dia da semana',
  inicio: 'Início',
  fim: 'Fim',
  data: 'Data',
  versao: 'Versão da agenda',
}

function validationLocation(location: unknown): string {
  if (!Array.isArray(location)) return ''
  const parts = location.filter((part): part is string | number => (
    typeof part === 'string' || typeof part === 'number'
  )).filter(part => part !== 'body').map((part, index, items) => {
    if (typeof part === 'number') {
      const parent = items[index - 1]
      const label = parent === 'periodos'
        ? 'Período semanal'
        : parent === 'excecoes'
          ? 'Exceção'
          : 'Item'
      return `${label} ${part + 1}`
    }
    return VALIDATION_FIELD_LABELS[part] ?? part
  })
  return parts.join(' > ')
}

function formatValidationErrors(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null
  const messages = detail.flatMap(item => {
    if (typeof item !== 'object' || item === null || !('msg' in item) || typeof item.msg !== 'string') {
      return []
    }
    const location = 'loc' in item ? validationLocation(item.loc) : ''
    return [`${location ? `${location}: ` : ''}${item.msg}`]
  })
  if (messages.length === 0) return null
  const visibleMessages = messages.slice(0, 5)
  if (messages.length > visibleMessages.length) {
    visibleMessages.push(`E mais ${messages.length - visibleMessages.length} erro(s) de validação.`)
  }
  return visibleMessages.join('\n')
}

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
      if (response.status === 422) {
        message = formatValidationErrors(body.detail)
          ?? 'A API rejeitou os dados. Confira os campos informados e tente novamente.'
      }
      // Qualquer 401 em rotas protegidas sinaliza sessão inválida ou expirada; o app reage redirecionando para o login.
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
    }
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/2fa')) {
      clearAccessToken()
      window.dispatchEvent(new CustomEvent('session-expired'))
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter && /^\d+$/.test(retryAfter)) {
        message += ` Tente novamente em ${retryAfter} segundos.`
      }
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}