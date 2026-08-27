import { FormEvent, useState } from 'react'
import { entrar } from '../services/auth'
import type { LoginResponse } from '../types/auth'

interface LoginProps {
  onLoginSucesso: (usuario: LoginResponse) => void
  onIrParaCadastro: () => void
}

export function Login({ onLoginSucesso, onIrParaCadastro }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    if (!email.trim() || !senha) {
      setErro('Informe seu e-mail e sua senha.')
      return
    }

    setCarregando(true)
    try {
      onLoginSucesso(await entrar({ email, senha }))
    } catch {
      setErro('E-mail ou senha inválidos.')
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
      <form onSubmit={handleSubmit} noValidate>
        <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="current-password" required /></label>
        {erro && <p className="feedback error" role="alert">{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <button className="text-button" type="button" onClick={onIrParaCadastro}>Criar uma conta</button>
    </section>
  )
}