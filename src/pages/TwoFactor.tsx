import { FormEvent, useEffect, useRef, useState } from 'react'
import { verifyTwoFactor } from '../services/auth'

interface TwoFactorProps {
  email: string
  onSucesso: () => void
  onVoltar: () => void
}

export function TwoFactor({ email, onSucesso, onVoltar }: TwoFactorProps) {
  const [code, setCode] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // A tela move o foco para o campo do código para acelerar a validação e melhorar a acessibilidade.
    codeInputRef.current?.focus()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // O envio do código confirma a segunda etapa da autenticação antes de liberar o acesso.
    event.preventDefault()
    setErro('')
    if (!/^\d{6}$/.test(code)) {
      // Valida o formato do código para evitar erros simples antes de comunicarmos com o backend.
      setErro('Informe o código de 6 dígitos.')
      return
    }

    setCarregando(true)
    try {
      // O backend valida o código e retorna a confirmação de que a autenticação foi concluída.
      const response = await verifyTwoFactor({ email, code })
      if (!response.authenticated) {
        // Qualquer resposta de autenticação falsa significa que o código não foi aceito.
        setErro('Código de verificação inválido.')
        return
      }
      // A aprovação do 2FA libera o acesso à área logada do sistema.
      onSucesso()
    } catch (error) {
      // Mensagens de erro do backend são repassadas para manter o usuário informado.
      setErro(error instanceof Error ? error.message : 'Código de verificação inválido.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="two-factor-title">
      <div className="panel-heading">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="two-factor-title">Verificação</h1>
        <p>Enviamos um código de 6 dígitos para o seu e-mail.</p>
        <p>Verifique sua caixa de entrada e Spam.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Código
          <input
            ref={codeInputRef}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            aria-describedby={erro ? 'two-factor-error' : undefined}
            required
          />
        </label>
        {erro && <p className="feedback error" id="two-factor-error" role="alert">{erro}</p>}
        <button type="submit" disabled={carregando}>
          {carregando ? 'Confirmando...' : 'Confirmar'}
        </button>
      </form>
      {/* O backend atual não oferece reenvio; não simulamos uma chamada inexistente. */}
      <button className="secondary-button" type="button" disabled>
        Reenviar código
      </button>
      <p className="form-note">O reenvio estará disponível quando o backend oferecer esse endpoint.</p>
      <button className="text-button" type="button" onClick={onVoltar}>Voltar para o login</button>
    </section>
  )
}