import { FormEvent, useEffect, useRef, useState } from 'react'

import { ArrowLeft, ShieldCheck } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { verifyTwoFactor } from '../services/auth'

interface TwoFactorProps {
  email: string
  onSucesso: (nome: string) => void
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
      onSucesso(response.nome || email.split('@')[0] || 'Usuário')
    } catch (error) {
      // Mensagens de erro do backend são repassadas para manter o usuário informado.
      setErro(error instanceof Error ? error.message : 'Código de verificação inválido.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="two-factor-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
        <h1 id="two-factor-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Verificação</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Enviamos um código de 6 dígitos para o seu e-mail.</p>
        <p className="mt-1 text-sm text-zinc-500">Verifique sua caixa de entrada e Spam.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Código
          <Input
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

        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" id="two-factor-error" role="alert">{erro}</p>}

        <Button type="submit" disabled={carregando}>
          <ShieldCheck size={16} />
          {carregando ? 'Confirmando...' : 'Confirmar'}
        </Button>
      </form>

      <Button className="mt-4" variant="ghost" type="button" onClick={onVoltar}><ArrowLeft size={16} />Voltar para o login</Button>
    </section>
  )
}