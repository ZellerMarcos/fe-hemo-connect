import { useEffect, useId, useState } from 'react'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { consultarDisponibilidade } from '../services/agenda'
import type { Disponibilidade, HorarioDisponivel } from '../types/agenda'
import { dataAtendimento, mensagemErro } from '../utils/triagemFormatters'

interface Props {
  centroId: number
  selecionado?: HorarioDisponivel | null
  onSelecionar?: (horario: HorarioDisponivel | null) => void
  onFusoHorario?: (fuso: string | null) => void
  horarioAtualId?: number | null
  disabled?: boolean
  revisao?: number
}

function nomeDia(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

export function SeletorHorario({ centroId, selecionado, onSelecionar, onFusoHorario, horarioAtualId, disabled = false, revisao = 0 }: Props) {
  const id = useId()
  const [inicio, setInicio] = useState('')
  const [dia, setDia] = useState('')
  const [dados, setDados] = useState<Disponibilidade | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [atualizacao, setAtualizacao] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setDados(null)
      setErro('')
      setDia('')
      onSelecionar?.(null)
      onFusoHorario?.(null)
      try {
        const response = await consultarDisponibilidade(centroId, inicio, controller.signal)
        if (!controller.signal.aborted) {
          setDados(response)
          onFusoHorario?.(response.fuso_horario)
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [centroId, inicio, atualizacao, revisao, onSelecionar, onFusoHorario])

  const escolhido = dados?.dias.find(item => item.data === dia)

  return <section className="min-w-0 space-y-4" aria-label="Disponibilidade da unidade" aria-busy={carregando}>
    <div className="flex flex-wrap items-end gap-3">
      <label htmlFor={`${id}-inicio`} className="grid min-w-0 flex-1 gap-2">
        Consultar semana a partir de
        <Input id={`${id}-inicio`} type="date" disabled={disabled} value={inicio}
          onChange={event => setInicio(event.target.value)} />
      </label>
      <Button variant="secondary" disabled={disabled || carregando} onClick={() => setAtualizacao(value => value + 1)}>Atualizar horários</Button>
    </div>
    {carregando && <p role="status">Consultando horários e vagas...</p>}
    {erro && <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-red-800">
      <p>{erro}</p>
      <Button variant="secondary" disabled={disabled} onClick={() => setAtualizacao(value => value + 1)}>Tentar novamente</Button>
    </div>}
    {dados && <>
      <p className="text-sm text-zinc-600">Horários da unidade: <strong>{dados.fuso_horario ?? 'fuso ainda não configurado'}</strong>.</p>
      {dados.situacao !== 'DISPONIVEL' && <p role="status" className="rounded-xl bg-amber-50 p-4 text-amber-900">{dados.mensagem}</p>}
      {dados.avisos.length > 0 && <ul className="space-y-1 text-sm text-amber-900">{dados.avisos.map(aviso => <li key={aviso}>{aviso}</li>)}</ul>}
      {dados.dias.length > 0 && <label htmlFor={`${id}-dia`} className="grid min-w-0 gap-2">
        Dia do atendimento
        <select id={`${id}-dia`} className="min-h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          value={dia} disabled={disabled} onChange={event => { setDia(event.target.value); onSelecionar?.(null) }}>
          <option value="">Selecione um dia</option>
          {dados.dias.map(item => <option key={item.data} value={item.data}>
            {nomeDia(item.data)}{item.horarios.some(horario => horario.vagas_disponiveis > 0) ? '' : ' — sem vagas'}
          </option>)}
        </select>
      </label>}
      {escolhido && (escolhido.horarios.length === 0
        ? <p role="status">{escolhido.motivo}</p>
        : <fieldset disabled={disabled} className="min-w-0">
          <legend className="mb-3 font-semibold">{onSelecionar ? 'Escolha um horário' : 'Horários e vagas'}</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {escolhido.horarios.map(horario => {
              const unavailable = horario.vagas_disponiveis === 0 || horario.id === horarioAtualId
              const content = <>
                <span className="font-semibold">{dataAtendimento(horario.inicio, dados.fuso_horario)}</span>
                <span className="text-sm">{horario.id === horarioAtualId ? 'Horário atual' : horario.vagas_disponiveis === 0 ? 'Lotado' : `${horario.vagas_disponiveis} vaga(s)`}</span>
              </>
              return onSelecionar
                ? <label key={horario.id} className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl border p-3 ${selecionado?.id === horario.id ? 'border-red-700 bg-red-50 text-red-900' : 'border-red-100 bg-white text-zinc-700'} ${unavailable ? 'opacity-60' : 'cursor-pointer'}`}>
                  <input className="agenda-radio" type="radio" name={`${id}-horario`} value={horario.id}
                    checked={selecionado?.id === horario.id} disabled={unavailable}
                    onChange={() => onSelecionar(horario)} />
                  <span className="grid min-w-0 gap-1">{content}</span>
                </label>
                : <div key={horario.id} className="grid min-w-0 gap-1 rounded-xl border border-red-100 p-3">{content}</div>
            })}
          </div>
        </fieldset>)}
    </>}
  </section>
}
