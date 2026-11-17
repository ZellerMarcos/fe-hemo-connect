import { FormEvent, useEffect, useRef, useState } from 'react'

import { Eye, EyeOff, KeyRound, LifeBuoy, LogIn, MailCheck, UserPlus2 } from 'lucide-react'

import { Button } from '../components/ui/button'
import { BrandLogo } from '../components/BrandLogo'
import { Input } from '../components/ui/input'
import { entrar } from '../services/auth'
import { ApiError } from '../services/api'
import type { LoginRequest, LoginTwoFactorResponse } from '../types/auth'

type LoginFieldErrors = Partial<Record<keyof LoginRequest, string>>

interface LoginProps {
  onTwoFactor: (challenge: LoginTwoFactorResponse) => void
  onIrParaCadastro: () => void
  onEsqueciSenha: () => void
  mensagemSessaoExpirada?: string
}

export function Login({ onTwoFactor, onIrParaCadastro, onEsqueciSenha, mensagemSessaoExpirada }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<LoginFieldErrors>({})
  const [carregando, setCarregando] = useState(false)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    return () => { activeRef.current = false }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // A submissão valida primeiro o formulário local e então repassa a requisição ao backend.
    event.preventDefault()
    setErro('')
    setErrosCampos({})
    const form = event.currentTarget
    const emailInput = form.elements.namedItem('email')
    const normalizedEmail = email.trim()
    const fieldErrors: LoginFieldErrors = {}
    if (!normalizedEmail) {
      fieldErrors.email = 'Informe seu e-mail.'
    } else if (emailInput instanceof HTMLInputElement && emailInput.validity.typeMismatch) {
      fieldErrors.email = 'Informe um endereço de e-mail válido.'
    }
    if (!senha) fieldErrors.senha = 'Informe sua senha.'
    if (fieldErrors.email || fieldErrors.senha) {
      setErrosCampos(fieldErrors)
      setErro('Confira os campos destacados.')
      const input = form.elements.namedItem(fieldErrors.email ? 'email' : 'senha')
      if (input instanceof HTMLElement) input.focus()
      return
    }

    setCarregando(true)
    try {
      // O backend responde com 2FA quando a credencial é válida, antes de concluir a sessão.
      const response = await entrar({ email: normalizedEmail, senha })
      // Uma resposta tardia nao pode recriar o desafio depois de sair ou cancelar o login.
      if (!activeRef.current) return
      // Tipos TypeScript nao validam JSON em runtime; rejeita contrato antigo ou incompleto.
      if (
        !response.requires_2fa || !/^[0-9a-f]{32}$/.test(response.challenge_id) ||
        !/^[A-Za-z0-9_-]{43}$/.test(response.challenge_secret) ||
        !Number.isFinite(response.expires_in) || response.expires_in <= 0 ||
        response.expires_in > 300
      ) {
        throw new Error('A API não retornou um desafio de verificação válido. Reinicie o login.')
      }
      setSenha('')
      onTwoFactor(response)
    } catch (error) {
      if (!activeRef.current) return
      if (error instanceof ApiError && (error.fieldErrors.email || error.fieldErrors.senha)) {
        setErrosCampos({ email: error.fieldErrors.email, senha: error.fieldErrors.senha })
        setErro('Confira os campos destacados.')
      } else {
        const mensagem = error instanceof Error ? error.message : 'E-mail ou senha inválidos.'
        setErro(mensagem)
      }
    } finally {
      if (activeRef.current) setCarregando(false)
    }
  }

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="login-title">
      <div>
        <BrandLogo />
        <h1 id="login-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Bem-vindo de volta</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Entre para acompanhar suas doações.</p>
      </div>
      {mensagemSessaoExpirada && (
        // O App informa tanto expiracao da sessao quanto reinicio necessario do desafio.
        <p className="mt-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{mensagemSessaoExpirada}</p>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <div className="grid gap-2 text-sm font-semibold text-zinc-700">
          <label htmlFor="login-email" className="inline-flex items-center gap-2">
            <MailCheck size={16} className="text-zinc-500" />
            E-mail
          </label>
          <div>
            <Input
              id="login-email" name="email" type="email" value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrosCampos(current => ({ ...current, email: undefined }))
                setErro('')
              }}
              autoComplete="email" required
              aria-invalid={Boolean(errosCampos.email)}
              aria-describedby={errosCampos.email ? 'login-email-error' : undefined}
            />
          </div>
          {errosCampos.email && <p id="login-email-error" className="font-normal text-red-800" role="alert">{errosCampos.email}</p>}
        </div>
        <div className="grid gap-2 text-sm font-semibold text-zinc-700">
          <label htmlFor="login-senha" className="inline-flex items-center gap-2">
            <KeyRound size={16} className="text-zinc-500" />
            Senha
          </label>
          <div className="relative">
            <Input
              id="login-senha" name="senha" type={mostrarSenha ? 'text' : 'password'} value={senha}
              onChange={(event) => {
                setSenha(event.target.value)
                setErrosCampos(current => ({ ...current, senha: undefined }))
                setErro('')
              }}
              autoComplete="current-password" className="pr-12" required
              aria-invalid={Boolean(errosCampos.senha)}
              aria-describedby={errosCampos.senha ? 'login-senha-error' : undefined}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-red-50" type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errosCampos.senha && <p id="login-senha-error" className="font-normal text-red-800" role="alert">{errosCampos.senha}</p>}
        </div>
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