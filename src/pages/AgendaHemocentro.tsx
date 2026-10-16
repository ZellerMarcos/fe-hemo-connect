import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { consultarAgenda, configurarAgenda } from '../services/agenda'
import { listarHemocentros } from '../services/hemocentros'
import type { AgendaConfig, AgendaResponse, ExcecaoAgenda } from '../types/agenda'
import type { LoginUserResponse } from '../types/auth'
import type { Hemocentro } from '../types/hemocentro'
import { dataAtendimento, mensagemErro } from '../utils/triagemFormatters'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const NUMEROS = [
  { key: 'duracao_minutos', label: 'Duração de cada horário (minutos)', min: 5, max: 240 },
  { key: 'capacidade', label: 'Vagas por horário', min: 1, max: 1000 },
  { key: 'antecedencia_minutos', label: 'Antecedência mínima para reservar (minutos)', min: 0, max: 10080 },
  { key: 'horizonte_dias', label: 'Até quantos dias à frente reservar', min: 1, max: 180 },
  { key: 'cancelamento_minutos', label: 'Antecedência mínima para cancelar (minutos)', min: 0, max: 10080 },
  { key: 'remarcacao_minutos', label: 'Antecedência mínima para remarcar (minutos)', min: 0, max: 10080 },
] as const

function novaAgenda(): AgendaConfig {
  return {
    fuso_horario: 'America/Sao_Paulo', duracao_minutos: 30, capacidade: 1,
    antecedencia_minutos: 0, horizonte_dias: 30, cancelamento_minutos: 0, remarcacao_minutos: 0,
    publicada: false, periodos: [], excecoes: [], versao: 0,
  }
}

const SELECT_STYLE = 'min-h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300'

export function AgendaHemocentro({ usuario }: { usuario: LoginUserResponse }) {
  const [centros, setCentros] = useState<Hemocentro[]>([])
  const [centro, setCentro] = useState('')
  const [config, setConfig] = useState<AgendaConfig | null>(null)
  const [legados, setLegados] = useState<AgendaResponse['pendencias_legadas']>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [revisao, setRevisao] = useState(0)
  const [revisaoUnidades, setRevisaoUnidades] = useState(0)
  const [alterado, setAlterado] = useState(false)
  const [fusoSalvo, setFusoSalvo] = useState<string | null>(null)

  useUnsavedChanges(alterado, 'Sair da agenda e descartar as alterações não salvas?')

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const unidades = await listarHemocentros(controller.signal)
        if (!controller.signal.aborted) {
          const permitidas = usuario.perfil === 'ADMINISTRADOR' ? unidades : unidades.filter(item => item.id === usuario.hemocentro_id)
          setCentros(permitidas)
          if (usuario.perfil !== 'ADMINISTRADOR') {
            if (permitidas.length === 0) setErro('Seu perfil precisa estar vinculado a um hemocentro para configurar a agenda.')
            else setCentro(String(permitidas[0].id))
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [usuario.perfil, usuario.hemocentro_id, revisaoUnidades])

  useEffect(() => {
    if (!centro) return
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setConfig(null)
      setErro('')
      setMensagem('')
      try {
        const response = await consultarAgenda(Number(centro), controller.signal)
        if (!controller.signal.aborted) {
          setConfig(response.configuracao ?? novaAgenda())
          setFusoSalvo(response.configuracao?.fuso_horario ?? null)
          setLegados(response.pendencias_legadas)
          setAlterado(false)
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [centro, revisao])

  function atualizar(value: AgendaConfig) {
    setConfig(value)
    setAlterado(true)
    setMensagem('')
  }

  function atualizarExcecao(index: number, value: ExcecaoAgenda) {
    if (config) atualizar({ ...config, excecoes: config.excecoes.map((item, i) => i === index ? value : item) })
  }

  async function salvar(event: FormEvent) {
    event.preventDefault()
    if (!config || salvando) return
    setErro('')
    setMensagem('')
    const invalido = NUMEROS.find(item => !Number.isInteger(config[item.key]) || config[item.key] < item.min || config[item.key] > item.max)
    if (invalido || config.periodos.length === 0 || config.excecoes.some(item => !item.data)) {
      setErro(invalido ? `${invalido.label}: informe um inteiro entre ${invalido.min} e ${invalido.max}.`
        : 'Cadastre ao menos um período semanal e preencha a data de todas as exceções.')
      return
    }
    setSalvando(true)
    try {
      const response = await configurarAgenda(Number(centro), config)
      if (!response.configuracao) throw new Error('A API não retornou a configuração salva.')
      setConfig(response.configuracao)
      setFusoSalvo(response.configuracao.fuso_horario)
      setLegados(response.pendencias_legadas)
      setAlterado(false)
      setMensagem(response.configuracao.publicada ? 'Agenda salva e publicada para reservas.' : 'Agenda salva. Novas reservas permanecem suspensas até a publicação.')
    } catch (error) {
      setErro(mensagemErro(error))
    } finally {
      setSalvando(false)
    }
  }

  return <section className="min-w-0 space-y-5" aria-label="Configuração da agenda">
    <p className="text-zinc-600">Defina a disponibilidade real da unidade. Nenhum horário é publicado automaticamente. Alterações que invalidam reservas existentes serão recusadas.</p>
    <label className="grid min-w-0 gap-2">Hemocentro
      <select className={SELECT_STYLE} disabled={carregando || salvando} value={centro} onChange={event => {
        if (!alterado || window.confirm('Descartar as alterações não salvas e mudar de unidade?')) setCentro(event.target.value)
      }}>
        <option value="">Selecione uma unidade</option>
        {centros.map(item => <option key={item.id} value={item.id}>{item.nome} — {item.status === 'ATIVO' ? 'ativo' : 'inativo'}</option>)}
      </select>
    </label>
    {carregando && <p role="status">Carregando agenda...</p>}
    {erro && <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-red-800">
      <p>{erro}</p>
      {centro && <Button variant="secondary" disabled={salvando} onClick={() => {
        if (!alterado || window.confirm('Recarregar a agenda e descartar as alterações não salvas?')) setRevisao(value => value + 1)
      }}>Recarregar agenda</Button>}
      {!centro && <Button variant="secondary" disabled={carregando} onClick={() => setRevisaoUnidades(value => value + 1)}>Tentar carregar unidades novamente</Button>}
    </div>}
    {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
    {!carregando && centros.length === 0 && !erro && <p role="status">Nenhum hemocentro cadastrado. Cadastre uma unidade antes de configurar sua agenda.</p>}
    {config && <>
      {legados.length > 0 && <aside className="space-y-2 rounded-xl bg-amber-50 p-4 text-amber-900">
        <h2 className="font-semibold">Reservas antigas precisam de conciliação</h2>
        <p>O salvamento só será permitido se os horários e a capacidade comportarem todas essas reservas. Elas não serão apagadas nem canceladas automaticamente.</p>
        <p>Fuso de referência das reservas antigas: {fusoSalvo ?? 'UTC'}.</p>
        <ul>{legados.map(item => <li key={item.id}>Reserva {item.id} — {dataAtendimento(item.agendado_em, fusoSalvo ?? 'UTC')}</li>)}</ul>
      </aside>}
      <form onSubmit={salvar} aria-busy={salvando} className="min-w-0 rounded-xl border border-red-100 p-4 md:p-6">
        <fieldset disabled={salvando} className="grid min-w-0 gap-5">
          <legend className="mb-4 text-xl font-semibold">Disponibilidade e políticas</legend>
          <label className="grid min-w-0 gap-2">Fuso horário IANA
            <Input required maxLength={100} list="fusos-agenda" value={config.fuso_horario}
              onChange={event => atualizar({ ...config, fuso_horario: event.target.value })} />
            <datalist id="fusos-agenda">{['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Rio_Branco', 'UTC'].map(item => <option key={item} value={item} />)}</datalist>
          </label>
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {NUMEROS.map(item => <label key={item.key} className="grid min-w-0 gap-2">{item.label}
              <Input required type="number" min={item.min} max={item.max} step={1}
                value={Number.isFinite(config[item.key]) ? config[item.key] : ''}
                onChange={event => atualizar({ ...config, [item.key]: event.target.valueAsNumber })} />
            </label>)}
          </div>
          <p className="text-sm text-zinc-600">Os prazos de cancelamento e remarcação ficam registrados na reserva. Mudar a política não retira os prazos de quem já reservou.</p>
          <section className="min-w-0 space-y-3" aria-labelledby="agenda-periodos-title">
            <h2 id="agenda-periodos-title" className="text-lg font-semibold">Períodos semanais</h2>
            <p className="text-sm text-zinc-600">Use mais de um período para representar intervalos de almoço. O período deve conter um número inteiro de horários e não pode atravessar a meia-noite.</p>
            {config.periodos.map((periodo, index) => <div key={index} className="grid min-w-0 gap-3 rounded-xl bg-rose-50 p-3 sm:grid-cols-2">
              <label className="grid min-w-0 gap-1">Dia da semana {index + 1}
                <select className={SELECT_STYLE} value={periodo.dia_semana} onChange={event => atualizar({
                  ...config, periodos: config.periodos.map((item, i) => i === index ? { ...item, dia_semana: Number(event.target.value) } : item),
                })}>{DIAS.map((dia, i) => <option key={dia} value={i}>{dia}</option>)}</select>
              </label>
              {(['inicio', 'fim'] as const).map(campo => <label key={campo} className="grid min-w-0 gap-1">{campo === 'inicio' ? 'Abertura' : 'Fechamento'} do período {index + 1}
                <Input required type="time" value={periodo[campo].slice(0, 5)} onChange={event => atualizar({
                  ...config, periodos: config.periodos.map((item, i) => i === index ? { ...item, [campo]: event.target.value } : item),
                })} />
              </label>)}
              <Button variant="ghost" onClick={() => atualizar({ ...config, periodos: config.periodos.filter((_, i) => i !== index) })}>Remover período {index + 1}</Button>
            </div>)}
            <Button variant="secondary" disabled={config.periodos.length >= 28} onClick={() => atualizar({
              ...config, periodos: [...config.periodos, { dia_semana: 0, inicio: '08:00', fim: '12:00' }],
            })}>Adicionar período semanal</Button>
          </section>
          <section className="min-w-0 space-y-3" aria-labelledby="agenda-excecoes-title">
            <h2 id="agenda-excecoes-title" className="text-lg font-semibold">Feriados e exceções</h2>
            <p className="text-sm text-zinc-600">Uma exceção substitui o funcionamento semanal naquela data.</p>
            {config.excecoes.map((excecao, index) => <div key={index} className="min-w-0 space-y-3 rounded-xl bg-rose-50 p-3">
              <label className="grid min-w-0 gap-1">Data da exceção {index + 1}
                <Input required type="date" value={excecao.data} onChange={event => atualizarExcecao(index, { ...excecao, data: event.target.value })} />
              </label>
              <label className="flex min-h-11 items-center gap-3">
                <input className="agenda-radio" type="checkbox" checked={excecao.periodos.length === 0}
                  onChange={event => atualizarExcecao(index, { ...excecao, periodos: event.target.checked ? [] : [{ inicio: '08:00', fim: '12:00' }] })} />
                Unidade fechada nesta data
              </label>
              {excecao.periodos.map((periodo, p) => <div key={p} className="grid min-w-0 gap-3 sm:grid-cols-2">
                {(['inicio', 'fim'] as const).map(campo => <label key={campo} className="grid min-w-0 gap-1">{campo === 'inicio' ? 'Abertura' : 'Fechamento'} da exceção {index + 1}, período {p + 1}
                  <Input required type="time" value={periodo[campo].slice(0, 5)} onChange={event => atualizarExcecao(index, {
                    ...excecao, periodos: excecao.periodos.map((item, i) => i === p ? { ...item, [campo]: event.target.value } : item),
                  })} />
                </label>)}
                <Button variant="ghost" onClick={() => atualizarExcecao(index, { ...excecao, periodos: excecao.periodos.filter((_, i) => i !== p) })}>Remover período da exceção {index + 1}</Button>
              </div>)}
              {excecao.periodos.length > 0 && <Button variant="secondary" disabled={excecao.periodos.length >= 4} onClick={() => atualizarExcecao(index, {
                ...excecao, periodos: [...excecao.periodos, { inicio: '13:00', fim: '17:00' }],
              })}>Adicionar período na exceção {index + 1}</Button>}
              <Button variant="ghost" onClick={() => atualizar({ ...config, excecoes: config.excecoes.filter((_, i) => i !== index) })}>Remover exceção {index + 1}</Button>
            </div>)}
            <Button variant="secondary" disabled={config.excecoes.length >= 366} onClick={() => atualizar({
              ...config, excecoes: [...config.excecoes, { data: '', periodos: [] }],
            })}>Adicionar feriado ou exceção</Button>
          </section>
          <label className="flex min-h-11 items-center gap-3">
            <input className="agenda-radio" type="checkbox" checked={config.publicada} onChange={event => atualizar({ ...config, publicada: event.target.checked })} />
            Publicar agenda e permitir novas reservas
          </label>
          <Button type="submit" className="w-full sm:w-fit">{salvando ? 'Salvando...' : 'Salvar agenda'}</Button>
        </fieldset>
      </form>
    </>}
  </section>
}
