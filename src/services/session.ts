const SESSION_KEY = 'hemo-connect-session'

export function getAccessToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token)
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
