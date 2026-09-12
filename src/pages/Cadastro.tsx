import { FormEvent, useState } from 'react'

import { Eye, EyeOff, UserPlus } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cadastrarUsuario } from '../services/usuarios'

interface CadastroProps {
  onCadastroSucesso: () => void
  onIrParaLogin: () => void
}

export function Cadastro({ onCadastroSucesso, onIrParaLogin }: CadastroProps) {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '' })
  const [consentimentoAceito, setConsentimentoAceito] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso(false)

    const nomeValido = /^(?:[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ][a-záàãâéêíóôõúç]+)(?: (?:[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ][a-záàãâéêíóôõúç]+))+$/.test(form.nome)
    const emailValido = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(form.email)

    if (!nomeValido) {
      setErro('Informe o nome completo com a primeira letra de cada nome em maiúscula. Exemplo: José Carlos.')
      return
    }

    if (!/^\d{11}$/.test(form.cpf)) {
      setErro('Preencha todos os campos corretamente. O CPF deve ter 11 números.')
      return
    }

    if (!emailValido) {
      setErro('Informe um e-mail válido, todo em letras minúsculas.')
      return
    }

    if (!form.senha || form.senha !== form.confirmacaoSenha) {
      setErro('A confirmação de senha deve ser igual à senha.')
      return
    }

    // O cadastro so avanca quando o titular aceita explicitamente o tratamento de dados.
    if (!consentimentoAceito) {
      setErro('Voce deve aceitar o tratamento de dados para concluir o cadastro.')
      return
    }

    setCarregando(true)
    try {
      await cadastrarUsuario({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        senha: form.senha,
        perfil: 'DOADOR',
        status: 'ATIVO',
        hemocentro_id: null,
        // O payload envia aceite, versao e finalidades para registro auditavel no backend.
        consentimento_aceito: true,
        consentimento_versao: 'v1.0',
        consentimento_finalidades: ['cadastro', 'autenticacao', 'seguranca'],
      })
      setSucesso(true)
      setForm({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '' })
      setConsentimentoAceito(false)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível realizar o cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="w-full max-w-xl rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="cadastro-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
        <h1 id="cadastro-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Criar cadastro</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Comece sua jornada como doador.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">Nome completo<Input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} autoComplete="name" required /></label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">CPF<Input value={form.cpf} onChange={(event) => updateField('cpf', event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" maxLength={11} required /></label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">E-mail<Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" required /></label>

        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Senha
          <div className="relative">
            <Input type={mostrarSenha ? 'text' : 'password'} value={form.senha} onChange={(event) => updateField('senha', event.target.value)} autoComplete="new-password" className="pr-12" required />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-red-50" type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Confirmar senha
          <div className="relative">
            <Input type={mostrarConfirmacao ? 'text' : 'password'} value={form.confirmacaoSenha} onChange={(event) => updateField('confirmacaoSenha', event.target.value)} autoComplete="new-password" className="pr-12" required />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-red-50" type="button" onClick={() => setMostrarConfirmacao((current) => !current)} aria-label={mostrarConfirmacao ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}>
              {mostrarConfirmacao ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 p-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={consentimentoAceito}
            onChange={(event) => setConsentimentoAceito(event.target.checked)}
            required
            className="mt-1 h-4 w-4"
          />
          <span>
            Li e aceito o tratamento dos meus dados para cadastro, autenticacao e seguranca da conta (versao v1.0).
          </span>
        </label>

        <p className="text-xs text-zinc-600">Perfil: <strong>Doador</strong> · Status: <strong>Ativo</strong></p>
        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}
        {sucesso && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">Cadastro realizado com sucesso.</p>}
        <Button type="submit" disabled={carregando}>
          <UserPlus size={16} />
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>

      <div className="mt-4 grid gap-2">
        <Button variant="ghost" type="button" onClick={onIrParaLogin}>Já tenho uma conta</Button>
        {sucesso && <Button variant="secondary" type="button" onClick={onIrParaLogin}>Ir para o login</Button>}
        <Button variant="ghost" size="sm" type="button" onClick={onCadastroSucesso}>Voltar</Button>
      </div>
    </section>
  )
}