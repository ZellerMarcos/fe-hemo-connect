import { FormEvent, useState } from 'react'
import { redefinirSenha } from '../services/auth'

interface ResetPasswordProps {
  token: string
  onVoltarAoLogin: () => void
}

// A redefinição de senha valida o token recebido e permite que o usuário crie uma nova senha segura.
export function ResetPassword({ token, onVoltarAoLogin }: ResetPasswordProps) {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  // Impede novas interações nesta tela depois que o backend consumir o token com sucesso.
  const [tokenConsumido, setTokenConsumido] = useState(false)

  // O envio confirma que as senhas são válidas e repassa a nova senha para o backend para persistência.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso('')

    if (!token || tokenConsumido) {
      setErro('Este link de redefinição já foi utilizado ou é inválido.')
      return
    }

    if (!senha || !confirmacao) {
      setErro('Preencha a nova senha e a confirmação.')
      return
    }

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      await redefinirSenha({ token, senha })
      setSucesso('Senha redefinida com sucesso. Você já pode entrar novamente.')
      // O token deixa de ser utilizável após a primeira redefinição concluída.
      setTokenConsumido(true)
      setSenha('')
      setConfirmacao('')
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Não foi possível redefinir a senha.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="reset-password-title">
      <div className="panel-heading">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="reset-password-title">Nova senha</h1>
        <p>Crie uma nova senha para continuar.</p>
      </div>

      {!tokenConsumido && (
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nova senha
          <input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="new-password" required />
        </label>

        <label>
          Confirmar nova senha
          <input type="password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} autoComplete="new-password" required />
        </label>

        {erro && <p className="feedback error" role="alert">{erro}</p>}
        {sucesso && <p className="feedback success" role="status">{sucesso}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
      )}

      <button className="text-button" type="button" onClick={onVoltarAoLogin}>
        Voltar para o login
      </button>
    </section>
  )
}
