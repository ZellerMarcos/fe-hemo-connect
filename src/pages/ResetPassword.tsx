import { FormEvent, useState } from 'react'

import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { redefinirSenha } from '../services/auth'

interface ResetPasswordProps {
  token: string
  onVoltarAoLogin: () => void
}

// A redefinição de senha valida o token recebido e permite que o usuário crie uma nova senha segura.
export function ResetPassword({ token, onVoltarAoLogin }: ResetPasswordProps) {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
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
    <section id="reset-password-modal" className="w-full max-w-lg rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="reset-password-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
        <h1 id="reset-password-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Nova senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Crie uma nova senha para continuar.</p>
      </div>

      {!tokenConsumido && (
      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Nova senha
          <div className="relative">
            <Input type={mostrarSenha ? 'text' : 'password'} className="pr-12" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="new-password" required />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-red-50" type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Confirmar nova senha
          <div className="relative">
            <Input type={mostrarConfirmacao ? 'text' : 'password'} className="pr-12" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} autoComplete="new-password" required />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-red-50" type="button" onClick={() => setMostrarConfirmacao((current) => !current)} aria-label={mostrarConfirmacao ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}>
              {mostrarConfirmacao ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}
        {sucesso && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">{sucesso}</p>}

        <Button type="submit" disabled={carregando}>
          <KeyRound size={16} />
          {carregando ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </form>
      )}

      <Button className="mt-4" variant="ghost" type="button" onClick={onVoltarAoLogin}>
        <ArrowLeft size={16} />
        Voltar para o login
      </Button>
    </section>
  )
}
