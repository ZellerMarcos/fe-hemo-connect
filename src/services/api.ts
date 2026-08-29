const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Centralizar o fetch mantém URL, headers e tratamento de erro fora das páginas.
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'
    try {
      const body = await response.json()
      if (response.status === 409) message = body.detail
    } catch {
      // Mantém uma mensagem genérica quando a API não retorna JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}