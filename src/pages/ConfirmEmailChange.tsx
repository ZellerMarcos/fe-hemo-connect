import { useRef, useState } from 'react'
import { MailCheck, ShieldCheck } from 'lucide-react'

import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/ui/button'
import { confirmarTrocaEmail } from '../services/auth'

interface ConfirmEmailChangeProps {
  token: string
  onConfirmado: () => void
  onVoltarAoLogin: () => void
}

export function ConfirmEmailChange({ token, onConfirmado, onVoltarAoLogin }: ConfirmEmailChangeProps) {
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>(() => token ? 'pending' : 'error')
  const [message, setMessage] = useState(() => token ? '' : 'O link de confirmação é inválido. Solicite uma nova troca de e-mail no seu perfil.')
  const enviando = useRef(false)

  async function handleConfirmar() {
    if (!token || enviando.current || status === 'success') return
    enviando.current = true
    setStatus('loading')
    setMessage('Confirmando seu novo e-mail...')
    try {
      const response = await confirmarTrocaEmail(token)
      onConfirmado()
      setStatus('success')
      setMessage(`E-mail alterado para ${response.email}. Entre novamente com o novo e-mail e sua senha atual.`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Não foi possível confirmar a troca de e-mail.')
    } finally {
      enviando.current = false
    }
  }

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="confirm-email-title">
      <BrandLogo />
      <MailCheck className="mt-5 text-red-700" size={32} aria-hidden="true" />
      <h1 id="confirm-email-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Confirmar troca de e-mail</h1>
      {status !== 'success' && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">
            Você recebeu este link para confirmar o novo e-mail da sua conta Hemo Connect.
            Abrir esta página não altera seus dados. Confirme abaixo somente se você solicitou a troca.
          </p>
          <section className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-relaxed text-zinc-700" aria-labelledby="email-security-title">
            <h2 id="email-security-title" className="flex items-center gap-2 font-semibold text-red-800">
              <ShieldCheck size={18} aria-hidden="true" />
              Antes de confirmar
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Seu e-mail atual permanece válido até você confirmar esta solicitação.</li>
              <li>Após a confirmação, use o novo e-mail para entrar. Sua senha não será alterada.</li>
              <li>Por segurança, todas as sessões da sua conta serão encerradas e você precisará entrar novamente.</li>
              <li>O link é válido por 15 minutos após a solicitação e só pode ser usado uma vez. Uma nova solicitação invalida o link anterior.</li>
              <li>Não compartilhe este link. Se você não solicitou a troca, não confirme: acesse o site diretamente, altere sua senha e entre em contato com o suporte.</li>
            </ul>
          </section>
        </>
      )}
      {message && <p className={`mt-4 rounded-xl px-3 py-2 text-sm ${status === 'error' ? 'bg-red-100 text-red-800' : status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-700'}`} role={status === 'error' ? 'alert' : 'status'}>
        {message}
      </p>}
      {token && status !== 'success' && (
        <Button className="mt-5 h-auto min-h-11 w-full py-3" disabled={status === 'loading'} onClick={() => void handleConfirmar()}>
          {status === 'loading' ? 'Confirmando...' : 'Confirmo a solicitação de troca de e-mail'}
        </Button>
      )}
      <Button className="mt-4 w-full" variant="ghost" disabled={status === 'loading'} onClick={onVoltarAoLogin}>
        {status === 'success' ? 'Ir para o login' : 'Voltar para o login sem confirmar'}
      </Button>
    </section>
  )
}
