import { FormEvent, useState } from 'react'
import { Mail, UserRound } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '../components/ui/button'
import { BrandLogo } from '../components/BrandLogo'
import { Privacidade } from './Privacidade'
import type { EmailChangeRequest, LoginUserResponse } from '../types/auth'
import { Input } from '../components/ui/input'
import { solicitarTrocaEmail } from '../services/auth'
import { ApiError } from '../services/api'

type EmailChangeFieldErrors = Partial<Record<keyof EmailChangeRequest, string>>

interface MeuPerfilProps {
  usuario: LoginUserResponse
  onVoltarHome: () => void
  onContaRemovida: () => void
}

// Consolida dados de perfil e direitos do titular no mesmo fluxo de autoatendimento.
export function MeuPerfil({ usuario, onVoltarHome, onContaRemovida }: MeuPerfilProps) {
  const [novoEmail, setNovoEmail] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [errosCamposEmail, setErrosCamposEmail] = useState<EmailChangeFieldErrors>({})
  const [sucessoEmail, setSucessoEmail] = useState('')
  const [enviandoEmail, setEnviandoEmail] = useState(false)

  async function handleEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErroEmail('')
    setErrosCamposEmail({})
    setSucessoEmail('')
    const form = event.currentTarget
    const emailInput = form.elements.namedItem('new_email')
    const normalizedEmail = novoEmail.trim()
    const fieldErrors: EmailChangeFieldErrors = {}
    if (!normalizedEmail) {
      fieldErrors.new_email = 'Informe o novo e-mail.'
    } else if (emailInput instanceof HTMLInputElement && emailInput.validity.typeMismatch) {
      fieldErrors.new_email = 'Informe um endereço de e-mail válido.'
    }
    if (!senhaAtual) fieldErrors.current_password = 'Informe sua senha atual.'
    if (fieldErrors.new_email || fieldErrors.current_password) {
      setErrosCamposEmail(fieldErrors)
      setErroEmail('Confira os campos destacados.')
      const input = form.elements.namedItem(fieldErrors.new_email ? 'new_email' : 'current_password')
      if (input instanceof HTMLElement) input.focus()
      return
    }
    setEnviandoEmail(true)
    try {
      const response = await solicitarTrocaEmail({
        new_email: normalizedEmail,
        current_password: senhaAtual,
      })
      setSucessoEmail(`Enviamos a confirmação para ${response.pending_email}. Seu e-mail atual permanece válido até a confirmação.`)
      setNovoEmail('')
      setSenhaAtual('')
    } catch (error) {
      if (error instanceof ApiError && (error.fieldErrors.new_email || error.fieldErrors.current_password)) {
        setErrosCamposEmail({
          new_email: error.fieldErrors.new_email,
          current_password: error.fieldErrors.current_password,
        })
        setErroEmail('Confira os campos destacados.')
      } else {
        setErroEmail(error instanceof Error ? error.message : 'Não foi possível solicitar a troca de e-mail.')
      }
    } finally {
      setEnviandoEmail(false)
    }
  }

  return (
    <section className="w-full max-w-5xl" aria-labelledby="meu-perfil-title">
      <header className="rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg shadow-red-100/30 md:p-8">
        <BrandLogo compact className="mb-4" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Meu Perfil</p>
            <h1 id="meu-perfil-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Dados e Privacidade</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">Consulte seus dados de conta e gerencie seus direitos do titular no mesmo lugar.</p>
          </div>
          <span className="hidden rounded-xl bg-red-50 p-2 text-red-700 md:inline-flex">
            <UserRound size={20} />
          </span>
        </div>
      </header>

      <motion.article
        aria-label="Resumo da conta"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="mt-4 rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg shadow-red-100/20"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Resumo da conta</h2>
        <dl className="mt-4 grid gap-2 text-sm md:grid-cols-[120px_1fr] md:text-base">
          <dt className="font-semibold text-red-800">Nome</dt>
          <dd className="text-zinc-700">{usuario.nome}</dd>
          <dt className="font-semibold text-red-800">E-mail</dt>
          <dd className="text-zinc-700">{usuario.email}</dd>
          <dt className="font-semibold text-red-800">Perfil</dt>
          <dd className="text-zinc-700">{usuario.perfil}</dd>
        </dl>
      </motion.article>

      <motion.article
        aria-labelledby="troca-email-title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="mt-4 rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg shadow-red-100/20"
      >
        <h2 id="troca-email-title" className="text-lg font-semibold text-zinc-900">Trocar e-mail</h2>
        <p className="mt-2 text-sm text-zinc-600">Confirme sua senha atual. A troca só será concluída pelo link enviado ao novo endereço.</p>
        <form onSubmit={handleEmailChange} className="mt-4 grid gap-4" noValidate>
          <div className="grid gap-2 text-sm font-semibold text-zinc-700">
            <label htmlFor="novo-email">Novo e-mail</label>
            <Input
              id="novo-email" name="new_email" type="email" value={novoEmail}
              onChange={(event) => {
                setNovoEmail(event.target.value)
                setErrosCamposEmail(current => ({ ...current, new_email: undefined }))
                setErroEmail('')
                setSucessoEmail('')
              }}
              autoComplete="email" required
              aria-invalid={Boolean(errosCamposEmail.new_email)}
              aria-describedby={errosCamposEmail.new_email ? 'novo-email-error' : undefined}
            />
            {errosCamposEmail.new_email && <p id="novo-email-error" className="font-normal text-red-800" role="alert">{errosCamposEmail.new_email}</p>}
          </div>
          <div className="grid gap-2 text-sm font-semibold text-zinc-700">
            <label htmlFor="senha-atual-email">Senha atual</label>
            <Input
              id="senha-atual-email" name="current_password" type="password" value={senhaAtual}
              onChange={(event) => {
                setSenhaAtual(event.target.value)
                setErrosCamposEmail(current => ({ ...current, current_password: undefined }))
                setErroEmail('')
                setSucessoEmail('')
              }}
              autoComplete="current-password" required
              aria-invalid={Boolean(errosCamposEmail.current_password)}
              aria-describedby={errosCamposEmail.current_password ? 'senha-atual-email-error' : undefined}
            />
            {errosCamposEmail.current_password && <p id="senha-atual-email-error" className="font-normal text-red-800" role="alert">{errosCamposEmail.current_password}</p>}
          </div>
          {erroEmail && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erroEmail}</p>}
          {sucessoEmail && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">{sucessoEmail}</p>}
          <Button type="submit" disabled={enviandoEmail}>
            <Mail size={16} />
            {enviandoEmail ? 'Enviando confirmação...' : 'Solicitar troca de e-mail'}
          </Button>
        </form>
      </motion.article>

      <div className="mt-4 rounded-2xl border border-red-100 bg-white/90 p-3 shadow-lg shadow-red-100/20 md:p-4">
        <Privacidade onContaRemovida={onContaRemovida} embedded />
      </div>

      <footer className="mt-3 flex justify-end">
        <Button variant="ghost" onClick={onVoltarHome}>Voltar para Home</Button>
      </footer>
    </section>
  )
}
