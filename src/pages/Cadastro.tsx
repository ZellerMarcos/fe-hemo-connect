import { FormEvent, useState } from 'react'

import { Eye, EyeOff, FileText, UserPlus } from 'lucide-react'

import { PrivacyPolicyModal, POLICY_VERSION } from '../components/PrivacyPolicyModal'
import { Button } from '../components/ui/button'
import { BrandLogo } from '../components/BrandLogo'
import { Input } from '../components/ui/input'
import { cadastrarUsuario } from '../services/usuarios'
import { COREN_UFS } from '../types/usuario'
import type { CorenUF, TipoSanguineo, UsuarioPerfil } from '../types/usuario'

interface CadastroProps {
  onCadastroSucesso: () => void
  onIrParaLogin: () => void
}

export function Cadastro({ onCadastroSucesso, onIrParaLogin }: CadastroProps) {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '', dataNascimento: '', telefone: '' })
  const [tipoSanguineo, setTipoSanguineo] = useState<TipoSanguineo | ''>('')
  const [perfil, setPerfil] = useState<UsuarioPerfil>('DOADOR')
  const [corenNumero, setCorenNumero] = useState('')
  const [corenUF, setCorenUF] = useState<CorenUF | ''>('')
  const [aprovacaoPendente, setAprovacaoPendente] = useState(false)
  const [consentimentoAceito, setConsentimentoAceito] = useState(false)
  const [politicaAberta, setPoliticaAberta] = useState(false)
  const [leituraPoliticaConcluida, setLeituraPoliticaConcluida] = useState(false)
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
    if (perfil === 'ENFERMEIRO' && (!/^\d{1,20}$/.test(corenNumero) || !corenUF)) {
      setErro('Informe o número de inscrição do COREN, somente com dígitos, e selecione a UF.')
      return
    }

    // O cadastro so avanca depois da leitura integral e do aceite explicito do titular.
    if (!leituraPoliticaConcluida) {
      setErro('Leia a Política de Privacidade até o final antes de aceitar os termos.')
      return
    }

    if (!consentimentoAceito) {
      setErro('Você deve aceitar a Política de Privacidade para concluir o cadastro.')
      return
    }

    setCarregando(true)
    try {
      const cadastroBase = {
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        senha: form.senha,
        hemocentro_id: null,
        data_nascimento: form.dataNascimento || null,
        telefone: form.telefone.trim() || null,
        tipo_sanguineo: tipoSanguineo || null,
        // O payload envia aceite, versao e finalidades para registro auditavel no backend.
        consentimento_aceito: true,
        consentimento_versao: POLICY_VERSION,
        consentimento_finalidades: [
          'cadastro',
          'autenticacao',
          'seguranca',
          'doacao',
          'triagem',
          'atendimento',
          'historico_doacoes',
          'comunicacao',
          'recuperacao_conta',
          'melhoria_plataforma',
          ...(perfil === 'ENFERMEIRO' ? ['validacao_profissional'] : []),
        ],
      }
      const response = perfil === 'ENFERMEIRO' && corenUF
        ? await cadastrarUsuario({ ...cadastroBase, perfil: 'ENFERMEIRO', status: 'INATIVO', coren_numero: corenNumero, coren_uf: corenUF })
        : await cadastrarUsuario({ ...cadastroBase, perfil: 'DOADOR', status: 'ATIVO' })
      setAprovacaoPendente(response.aprovacao_pendente)
      setSucesso(true)
      setForm({ nome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '', dataNascimento: '', telefone: '' })
      setTipoSanguineo('')
      setCorenNumero(''); setCorenUF('')
      setConsentimentoAceito(false)
      setLeituraPoliticaConcluida(false)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível realizar o cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirPolitica() {
    setConsentimentoAceito(false)
    setLeituraPoliticaConcluida(false)
    setPoliticaAberta(true)
  }

  return (
    <section className="w-full max-w-xl rounded-2xl border border-red-100 bg-white/92 p-6 shadow-2xl shadow-red-100/40 md:p-8" aria-labelledby="cadastro-title">
      <div>
        <BrandLogo />
        <h1 id="cadastro-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Criar cadastro</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Cadastre-se como doador ou solicite acesso profissional de enfermagem.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">Perfil de cadastro
          <select className="rounded-xl border border-red-200 bg-white p-3" value={perfil} disabled={carregando} onChange={event => {
            const value = event.target.value
            if (value === 'DOADOR' || value === 'ENFERMEIRO') {
              setPerfil(value); setCorenNumero(''); setCorenUF(''); setErro(''); setSucesso(false)
            }
          }}>
            <option value="DOADOR">Doador(a)</option>
            <option value="ENFERMEIRO">Enfermeiro(a)</option>
          </select>
        </label>
        {perfil === 'ENFERMEIRO' && <fieldset className="grid gap-3 rounded-xl border border-red-100 bg-rose-50 p-4" disabled={carregando}>
          <legend className="text-sm font-semibold">Registro profissional</legend>
          <label className="grid gap-2 text-sm">Número do COREN
            <Input required inputMode="numeric" maxLength={20} value={corenNumero} onChange={event => setCorenNumero(event.target.value.replace(/\D/g, ''))} />
          </label>
          <label className="grid gap-2 text-sm">UF do COREN
            <select required className="rounded-xl border border-red-200 bg-white p-3" value={corenUF} onChange={event => {
              const uf = COREN_UFS.find(value => value === event.target.value)
              setCorenUF(uf ?? '')
            }}>
              <option value="">Selecione a UF</option>
              {COREN_UFS.map(uf => <option key={uf}>{uf}</option>)}
            </select>
          </label>
          <p className="text-sm text-zinc-600">O número informado não comprova o registro profissional. Sua conta ficará inativa até um administrador conferir o COREN e sua identidade e vinculá-la a um hemocentro.</p>
        </fieldset>}
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">Nome completo<Input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} autoComplete="name" required /></label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">CPF<Input value={form.cpf} onChange={(event) => updateField('cpf', event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="numeric" maxLength={11} required /></label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">E-mail<Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" required /></label>
        <fieldset className="grid gap-3 rounded-xl border border-red-100 p-3">
          <legend className="text-sm font-semibold">Dados opcionais para atendimento</legend>
          <label className="grid gap-2 text-sm">Data de nascimento<Input type="date" value={form.dataNascimento} onChange={e => updateField('dataNascimento', e.target.value)} autoComplete="bday" /></label>
          <label className="grid gap-2 text-sm">Telefone<Input type="tel" maxLength={30} value={form.telefone} onChange={e => updateField('telefone', e.target.value)} autoComplete="tel" /></label>
          <label className="grid gap-2 text-sm">Tipo sanguíneo<select className="rounded-xl border border-red-200 bg-white p-3" value={tipoSanguineo} onChange={e => {
            const value = e.target.value
            if (value === '' || value === 'A+' || value === 'A-' || value === 'B+' || value === 'B-' || value === 'AB+' || value === 'AB-' || value === 'O+' || value === 'O-') setTipoSanguineo(value)
          }}>
            <option value="">Não informado</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(value => <option key={value}>{value}</option>)}
          </select></label>
        </fieldset>

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

        <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-sm text-zinc-700">
          <Button variant="secondary" type="button" onClick={abrirPolitica} className="w-full">
            <FileText size={16} />
            Ler Política de Privacidade e Uso de Dados
          </Button>
          <p className="mt-2 text-xs text-zinc-600">A leitura completa da política é necessária antes do aceite.</p>
        </div>

        <label className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${leituraPoliticaConcluida ? 'border-red-100 bg-red-50/60 text-zinc-700' : 'border-zinc-200 bg-zinc-100 text-zinc-500'}`}>
          <input
            type="checkbox"
            checked={consentimentoAceito}
            onChange={(event) => setConsentimentoAceito(event.target.checked)}
            disabled={!leituraPoliticaConcluida}
            required
            className="mt-1 h-4 w-4"
          />
          <span>
            Li e estou ciente da Política de Privacidade e do tratamento dos meus dados pessoais (versão {POLICY_VERSION}).
          </span>
        </label>

        <p className="text-xs text-zinc-600">Perfil: <strong>{perfil === 'ENFERMEIRO' ? 'Enfermeiro(a)' : 'Doador(a)'}</strong> · Cadastro: <strong>{perfil === 'ENFERMEIRO' ? 'Sujeito à aprovação administrativa' : 'Ativo'}</strong></p>
        {erro && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">{erro}</p>}
        {sucesso && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">{aprovacaoPendente ? 'Solicitação de cadastro enviada. Aguarde a aprovação administrativa do COREN antes de fazer login.' : 'Cadastro realizado com sucesso.'}</p>}
        <Button type="submit" disabled={carregando}>
          <UserPlus size={16} />
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>

      <div className="mt-4 grid gap-2">
        <Button variant="ghost" type="button" onClick={onIrParaLogin}>Já tenho uma conta</Button>
        {sucesso && !aprovacaoPendente && <Button variant="secondary" type="button" onClick={onIrParaLogin}>Ir para o login</Button>}
        <Button variant="ghost" size="sm" type="button" onClick={onCadastroSucesso}>Voltar</Button>
      </div>

      <PrivacyPolicyModal
        open={politicaAberta}
        onClose={() => setPoliticaAberta(false)}
        onReadComplete={() => setLeituraPoliticaConcluida(true)}
        readComplete={leituraPoliticaConcluida}
      />
    </section>
  )
}