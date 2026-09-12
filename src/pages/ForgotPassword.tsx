import { FormEvent, useState } from 'react'

import { ArrowLeft, MailCheck } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { solicitarResetSenha } from '../services/auth'

interface ForgotPasswordProps {
  onVoltarAoLogin: () => void
}

// A tela de recuperação de senha coleta o e-mail do usuário e dispara o fluxo de envio do link de redefinição.
export function ForgotPassword({ onVoltarAoLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  // O submit valida o formulário local e encaminha a solicitação ao backend para envio do link seguro.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso('')

    if (!email.trim()) {
      setErro('Informe seu e-mail para receber o link de redefinição.')
      return
    }

    setCarregando(true)
    try {
      await solicitarResetSenha({ email })
      setSucesso('Se esse e-mail estiver cadastrado, enviaremos um link para redefinir sua senha. Olhe sua caixa de entrada e a caixa de spam.')
      setEmail('')
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível enviar o link.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="forgot-password-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
        <h1 id="forgot-password-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Recuperar senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Informe o e-mail para receber o link de redefinição.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          E-mail
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>

        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}
        {sucesso && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">{sucesso}</p>}

        <Button type="submit" disabled={carregando}>
          <MailCheck size={16} />
          {carregando ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>

      <Button className="mt-4" variant="ghost" type="button" onClick={onVoltarAoLogin}>
        <ArrowLeft size={16} />
        Voltar para o login
      </Button>
    </section>
  )
}
