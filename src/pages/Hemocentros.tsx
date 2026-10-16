import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cadastrarHemocentro, listarHemocentros } from '../services/hemocentros'
import type { Hemocentro, HemocentroCreate } from '../types/hemocentro'
import { mensagemErro } from '../utils/triagemFormatters'

const CAMPOS = [
  { key: 'nome', label: 'Nome do hemocentro', limit: 255 },
  { key: 'endereco', label: 'Endereço completo', limit: 500 },
  { key: 'telefone', label: 'Telefone', limit: 30 },
] as const

const FORM_INICIAL: HemocentroCreate = { nome: '', endereco: '', telefone: '', status: 'ATIVO' }

export function Hemocentros() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HemocentroCreate>(FORM_INICIAL)
  const [centros, setCentros] = useState<Hemocentro[] | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [revisao, setRevisao] = useState(0)
  const [erroLista, setErroLista] = useState('')
  const [erroCadastro, setErroCadastro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [campoInvalido, setCampoInvalido] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setErroLista('')
      setCentros(null)
      try {
        const unidades = await listarHemocentros(controller.signal)
        if (!controller.signal.aborted) setCentros(unidades)
      } catch (error) {
        if (!controller.signal.aborted) setErroLista(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [revisao])

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (salvando || carregando) return
    setErroCadastro('')
    setMensagem('')
    setCampoInvalido(null)
    const invalido = CAMPOS.find(campo => !form[campo.key].trim() || form[campo.key].trim().length > campo.limit)
    if (invalido) {
      setErroCadastro(`Preencha ${invalido.label.toLowerCase()} com até ${invalido.limit} caracteres.`)
      setCampoInvalido(invalido.key)
      const element = event.currentTarget.elements.namedItem(invalido.key)
      if (element instanceof HTMLElement) element.focus()
      return
    }
    setSalvando(true)
    try {
      const unidade = await cadastrarHemocentro({
        ...form,
        nome: form.nome.trim(),
        endereco: form.endereco.trim(),
        telefone: form.telefone.trim(),
      })
      setForm(FORM_INICIAL)
      setMensagem(`${unidade.nome}: hemocentro cadastrado com sucesso.`)
      setRevisao(value => value + 1)
    } catch (error) {
      setErroCadastro(mensagemErro(error))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-zinc-600">
        Cadastre uma unidade para disponibilizá-la nos agendamentos e nas aprovações de enfermeiros.
        O cadastro não altera seu vínculo institucional. Somente unidades ativas aparecem nessas seleções.
      </p>
      <section aria-labelledby="novo-hemocentro-title" className="rounded-2xl border border-red-100 bg-rose-50/40 p-4 md:p-6">
        <h2 id="novo-hemocentro-title" className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <Building2 size={22} aria-hidden="true" />
          Novo hemocentro
        </h2>
        <p id="hemocentro-instrucoes" className="mt-2 text-sm text-zinc-600">Todos os campos são obrigatórios.</p>
        <form onSubmit={cadastrar} noValidate aria-describedby="hemocentro-instrucoes" aria-busy={salvando}>
          <fieldset disabled={salvando} className="grid min-w-0 gap-4">
            <legend className="sr-only">Dados do novo hemocentro</legend>
            {CAMPOS.map(campo => (
              <label key={campo.key} htmlFor={`hemocentro-${campo.key}`} className="grid min-w-0 gap-2 text-sm font-semibold text-zinc-700">
                {campo.label}
                <Input
                  id={`hemocentro-${campo.key}`}
                  name={campo.key}
                  type={campo.key === 'telefone' ? 'tel' : 'text'}
                  autoComplete={campo.key === 'telefone' ? 'tel' : 'off'}
                  maxLength={campo.limit}
                  required
                  value={form[campo.key]}
                  aria-invalid={campoInvalido === campo.key}
                  aria-describedby={campoInvalido === campo.key ? 'hemocentro-cadastro-erro' : undefined}
                  onChange={event => setForm({ ...form, [campo.key]: event.target.value })}
                />
              </label>
            ))}
            <label htmlFor="hemocentro-status" className="grid min-w-0 gap-2 text-sm font-semibold text-zinc-700">
              Situação da unidade
              <select
                id="hemocentro-status"
                name="status"
                className="min-h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                value={form.status}
                required
                onChange={event => {
                  const status = event.target.value
                  if (status !== 'ATIVO' && status !== 'INATIVO') {
                    setErroCadastro('Selecione uma situação válida para a unidade.')
                    return
                  }
                  setForm({ ...form, status })
                }}
              >
                <option value="ATIVO">Ativo — disponível para agendamentos</option>
                <option value="INATIVO">Inativo — indisponível para agendamentos</option>
              </select>
            </label>
            <Button type="submit" disabled={salvando || carregando} className="w-full sm:w-fit">
              <Plus size={18} aria-hidden="true" />
              {salvando ? 'Cadastrando...' : 'Cadastrar hemocentro'}
            </Button>
          </fieldset>
          {erroCadastro && <p id="hemocentro-cadastro-erro" role="alert" className="rounded-xl bg-red-100 p-4 text-red-800">{erroCadastro}</p>}
          {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
        </form>
      </section>

      <section aria-labelledby="hemocentros-lista-title" aria-busy={carregando} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="hemocentros-lista-title" className="text-xl font-semibold text-zinc-900">Unidades cadastradas</h2>
          <Button variant="secondary" disabled={carregando || salvando} onClick={() => setRevisao(value => value + 1)}>Atualizar lista</Button>
        </div>
        {carregando && <p role="status">Carregando hemocentros...</p>}
        {erroLista && <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-red-800">
          <p>{erroLista}</p>
          <Button variant="secondary" disabled={carregando || salvando} onClick={() => setRevisao(value => value + 1)}>Tentar novamente</Button>
        </div>}
        {centros && (centros.length === 0
          ? <p role="status" className="rounded-xl border border-red-100 p-5">Nenhum hemocentro cadastrado. Utilize o formulário acima para cadastrar a primeira unidade.</p>
          : <ul className="grid gap-4 md:grid-cols-2">
            {centros.map(centro => <li key={centro.id} className="min-w-0 space-y-3 rounded-xl border border-red-100 bg-white p-5">
              <h3 className="break-words text-lg font-semibold text-zinc-900">{centro.nome}</h3>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${centro.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-700'}`}>
                {centro.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
              </span>
              <dl className="space-y-2 text-sm text-zinc-600">
                <div><dt className="font-semibold">Endereço</dt><dd className="break-words">{centro.endereco}</dd></div>
                <div><dt className="font-semibold">Telefone</dt><dd className="break-words">{centro.telefone}</dd></div>
              </dl>
              <Button variant="secondary" onClick={() => navigate(`/hemocentros/${centro.id}/horarios`)}>Consultar horários</Button>
            </li>)}
          </ul>)}
      </section>
      <Button variant="ghost" onClick={() => navigate('/home')}>Voltar para o painel</Button>
    </div>
  )
}
