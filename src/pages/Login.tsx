import { FormEvent, useState } from 'react'
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
    <section className="auth-panel" aria-labelledby="login-title">
      <div className="panel-heading">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="login-title">Bem-vindo de volta</h1>
        <p>Entre para acompanhar suas doações.</p>
      </div>
      {mensagemSessaoExpirada && (
        // A mensagem de expiração é exibida somente quando o backend rejeitou a sessão por timeout.
        <p className="feedback error session-expired-message" role="alert">{mensagemSessaoExpirada}</p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="current-password" required /></label>
        {erro && <p className="feedback error" role="alert">{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <button className="text-button" type="button" onClick={onEsqueciSenha}>Esqueci minha senha</button>
      <button className="text-button" type="button" onClick={onIrParaCadastro}>Criar uma conta</button>
    </section>
  )
}