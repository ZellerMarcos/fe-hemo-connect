import { FormEvent, useState } from 'react'
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
    <section className="auth-panel" aria-labelledby="forgot-password-title">
      <div className="panel-heading">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="forgot-password-title">Recuperar senha</h1>
        <p>Informe o e-mail para receber o link de redefinição.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label>
          E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>

        {erro && <p className="feedback error" role="alert">{erro}</p>}
        {sucesso && <p className="feedback success" role="status">{sucesso}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>

      <button className="text-button" type="button" onClick={onVoltarAoLogin}>
        Voltar para o login
      </button>
    </section>
  )
}
