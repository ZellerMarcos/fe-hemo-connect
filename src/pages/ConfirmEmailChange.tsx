import { useEffect, useState } from 'react'
import { MailCheck } from 'lucide-react'

import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/ui/button'
import { confirmarTrocaEmail } from '../services/auth'
import { clearAccessToken } from '../services/session'

interface ConfirmEmailChangeProps {
  token: string
  onVoltarAoLogin: () => void
}

export function ConfirmEmailChange({ token, onVoltarAoLogin }: ConfirmEmailChangeProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => token ? 'loading' : 'error')
  const [message, setMessage] = useState(() => token ? 'Confirmando seu novo e-mail...' : 'O link de confirmação é inválido.')

  useEffect(() => {
    if (!token) return
    let active = true
    confirmarTrocaEmail(token).then(response => {
      if (!active) return
      clearAccessToken()
      setStatus('success')
      setMessage(`E-mail alterado para ${response.email}. Entre novamente para continuar.`)
    }).catch(error => {
      if (!active) return
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Não foi possível confirmar a troca de e-mail.')
    })
    return () => { active = false }
  }, [token])

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="confirm-email-title">
      <BrandLogo />
      <MailCheck className="mt-5 text-red-700" size={32} aria-hidden="true" />
      <h1 id="confirm-email-title" className="mt-3 text-3xl font-semibold text-zinc-900">Confirmação de e-mail</h1>
      <p className={`mt-4 rounded-xl px-3 py-2 text-sm ${status === 'error' ? 'bg-red-100 text-red-800' : status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-700'}`} role={status === 'error' ? 'alert' : 'status'}>
        {message}
      </p>
      {status !== 'loading' && <Button className="mt-5" onClick={onVoltarAoLogin}>Ir para o login</Button>}
    </section>
  )
}
