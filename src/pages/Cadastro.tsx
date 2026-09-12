import { FormEvent, useState } from 'react'
import { cadastrarUsuario } from '../services/usuarios'

interface CadastroProps {
  onCadastroSucesso: () => void
  onIrParaLogin: () => void
}

export function Cadastro({ onCadastroSucesso, onIrParaLogin }: CadastroProps) {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '' })
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
      })
      setSucesso(true)
      setForm({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '' })
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
        <label>Nome completo<input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} autoComplete="name" required /></label>
        <label>CPF<input value={form.cpf} onChange={(event) => updateField('cpf', event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" maxLength={11} required /></label>
        <label>E-mail<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" required /></label>
        <label>
          Senha
          <span className="password-input">
            <input type={mostrarSenha ? 'text' : 'password'} value={form.senha} onChange={(event) => updateField('senha', event.target.value)} autoComplete="new-password" required />
            <button className="password-toggle" type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
        </label>
        <label>
          Confirmar senha
          <span className="password-input">
            <input type={mostrarConfirmacao ? 'text' : 'password'} value={form.confirmacaoSenha} onChange={(event) => updateField('confirmacaoSenha', event.target.value)} autoComplete="new-password" required />
            <button className="password-toggle" type="button" onClick={() => setMostrarConfirmacao((current) => !current)} aria-label={mostrarConfirmacao ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}>
              {mostrarConfirmacao ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
        </label>
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