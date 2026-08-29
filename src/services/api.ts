const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Centralizar o fetch mantém a URL base, os headers e o padrão de tratamento de erros em um único ponto.
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    // O cliente transforma qualquer falha HTTP em uma exceção padronizada para as páginas.
    let message = 'Não foi possível concluir a operação.'
    try {
      const body = await response.json()
      if (response.status === 409) message = body.detail
      // Qualquer 401 em rotas protegidas sinaliza sessão inválida ou expirada; o app reage redirecionando para o login.
      if (response.status === 401 && body?.detail && !path.includes('/auth/login') && !path.includes('/auth/2fa')) {
        window.dispatchEvent(new CustomEvent('session-expired'))
      }
    } catch {
      // Se o backend não devolver JSON, a mensagem genérica continua sendo útil para o usuário.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}