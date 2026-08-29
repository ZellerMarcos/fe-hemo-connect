import { FormEvent, useState } from 'react'
import { cadastrarUsuario } from '../services/usuarios'

interface CadastroProps {
  onCadastroSucesso: () => void
  onIrParaLogin: () => void
}

export function Cadastro({ onCadastroSucesso, onIrParaLogin }: CadastroProps) {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso(false)

    if (!form.nome.trim() || !/^\d{11}$/.test(form.cpf) || !form.email.trim() || !form.senha) {
      setErro('Preencha todos os campos corretamente. O CPF deve ter 11 números.')
      return
    }

    setCarregando(true)
    try {
      await cadastrarUsuario({ ...form, perfil: 'DOADOR', status: 'ATIVO', hemocentro_id: null })
      setSucesso(true)
      setForm({ nome: '', cpf: '', email: '', senha: '' })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível realizar o cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="cadastro-title">
      <div className="panel-heading">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="cadastro-title">Criar cadastro</h1>
        <p>Comece sua jornada como doador.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label>Nome<input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} autoComplete="name" required /></label>
        <label>CPF<input value={form.cpf} onChange={(event) => updateField('cpf', event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" maxLength={11} required /></label>
        <label>E-mail<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={form.senha} onChange={(event) => updateField('senha', event.target.value)} autoComplete="new-password" required /></label>
        <p className="fixed-values">Perfil: <strong>Doador</strong> · Status: <strong>Ativo</strong></p>
        {erro && <p className="feedback error" role="alert">{erro}</p>}
        {sucesso && <p className="feedback success" role="status">Cadastro realizado com sucesso.</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>
      <button className="text-button" type="button" onClick={sucesso ? onIrParaLogin : onIrParaLogin}>Já tenho uma conta</button>
      {sucesso && <button className="secondary-button" type="button" onClick={onIrParaLogin}>Ir para o login</button>}
      <button className="back-link" type="button" onClick={onCadastroSucesso}>Voltar</button>
    </section>
  )
}