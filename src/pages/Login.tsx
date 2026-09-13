import { FormEvent, useState } from 'react'

import { KeyRound, LifeBuoy, LogIn, MailCheck, UserPlus2 } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { entrar } from '../services/auth'
import type { LoginUserResponse } from '../types/auth'

interface LoginProps {
  onLoginSucesso: (usuario: LoginUserResponse) => void
  onTwoFactor: (email: string) => void
  onIrParaCadastro: () => void
  onEsqueciSenha: () => void
  mensagemSessaoExpirada?: string
}

export function Login({ onLoginSucesso, onTwoFactor, onIrParaCadastro, onEsqueciSenha, mensagemSessaoExpirada }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // A submissão valida primeiro o formulário local e então repassa a requisição ao backend.
    event.preventDefault()
    setErro('')
    if (!email.trim() || !senha) {
      // Evita requisição vazia e orienta o usuário a preencher os campos obrigatórios.
      setErro('Informe seu e-mail e sua senha.')
      return
    }

    setCarregando(true)
    try {
      // O backend responde com 2FA quando a credencial é válida, antes de concluir a sessão.
      const response = await entrar({ email, senha })
      if ('requires_2fa' in response) {
        // O usuário precisa confirmar a segunda etapa antes de ser considerado autenticado.
        onTwoFactor(email)
        return
      }
      // O fluxo de login completo gera a sessão e leva o usuário diretamente à área logada.
      onLoginSucesso(response)
    } catch (error) {
      // O frontend reutiliza a mensagem detalhada do backend, inclusive o número de tentativas restantes e o bloqueio do usuário.
      const mensagem = error instanceof Error ? error.message : 'E-mail ou senha inválidos.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="login-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
        <h1 id="login-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Bem-vindo de volta</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Entre para acompanhar suas doações.</p>
      </div>
      {mensagemSessaoExpirada && (
        // A mensagem de expiração é exibida somente quando o backend rejeitou a sessão por timeout.
        <p className="mt-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{mensagemSessaoExpirada}</p>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          <span className="inline-flex items-center gap-2">
            <MailCheck size={16} className="text-zinc-500" />
            E-mail
          </span>
          <div>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          <span className="inline-flex items-center gap-2">
            <KeyRound size={16} className="text-zinc-500" />
            Senha
          </span>
          <div>
            <Input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="current-password" required />
          </div>
        </label>
        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}
        <Button type="submit" disabled={carregando}>
          <LogIn size={16} />
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="mt-4 grid gap-2">
        <Button variant="ghost" type="button" onClick={onEsqueciSenha}>
          <LifeBuoy size={16} />
          Esqueci minha senha
        </Button>
        <Button variant="secondary" type="button" onClick={onIrParaCadastro}>
          <UserPlus2 size={16} />
          Criar uma conta
        </Button>
      </div>
    </section>
  )
}