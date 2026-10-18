import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { consultarHemocentro } from '../services/hemocentros'
import { confirmarMinhaChegada, consultarProximoAgendamento } from '../services/triagens'
import type { Reserva } from '../types/agenda'
import type { Hemocentro } from '../types/hemocentro'
import { dataAtendimento, mensagemErro, STATUS_LABELS } from '../utils/triagemFormatters'

export function ConfirmacaoChegada() {
  const [dados, setDados] = useState<{ reserva: Reserva; hemocentro: Hemocentro } | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')
  const [revisao, setRevisao] = useState(0)
  const [atualizacaoNecessaria, setAtualizacaoNecessaria] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setDados(null)
      setErro('')
      setAtualizacaoNecessaria(false)
      try {
        const reserva = await consultarProximoAgendamento(controller.signal)
        if (!reserva) return
        const hemocentro = await consultarHemocentro(reserva.hemocentro_id, controller.signal)
        if (!controller.signal.aborted) setDados({ reserva, hemocentro })
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [revisao])

  async function confirmar() {
    if (!dados || confirmando || atualizacaoNecessaria || dados.reserva.status !== 'AGENDADO') return
    if (!window.confirm('Você declara que já está no hemocentro? A confirmação colocará seu atendimento em Aguardando triagem e impedirá cancelar ou remarcar esta reserva.')) return
    setConfirmando(true)
    setErro('')
    try {
      const reserva = await confirmarMinhaChegada(dados.reserva.id, dados.reserva.versao)
      setDados({ ...dados, reserva })
    } catch (error) {
      setErro(`${mensagemErro(error)} Atualize a consulta para verificar a situação da reserva antes de tentar novamente.`)
      setAtualizacaoNecessaria(true)
    } finally {
      setConfirmando(false)
    }
  }

  return <section aria-label="Confirmação de chegada" className="space-y-5">
    <Link to="/home" className="inline-flex min-h-11 items-center text-red-800 underline">Voltar à central</Link>
    <p>Consulte seu próximo agendamento e confirme sua chegada somente se já estiver no hemocentro.</p>
    <p className="text-sm text-zinc-600">A confirmação é uma autodeclaração, sem código ou verificação de localização. Não há restrição de antecedência para o próximo agendamento futuro.</p>
    <Button variant="secondary" disabled={carregando || confirmando}
      onClick={() => setRevisao(valor => valor + 1)}>Atualizar consulta</Button>
    {carregando && <p role="status">Consultando próximo agendamento...</p>}
    {erro && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
      <p>{erro}</p>
      <Button variant="ghost" disabled={carregando || confirmando}
        onClick={() => setRevisao(valor => valor + 1)}>Tentar novamente</Button>
    </div>}
    {!carregando && !erro && !dados && <div role="status" className="space-y-2 rounded-xl border border-red-100 p-5">
      <h2 className="text-xl font-semibold">Nenhum agendamento futuro aguardando confirmação de chegada.</h2>
      <p>Reservas canceladas, passadas ou com chegada já confirmada não aparecem nesta consulta.</p>
    </div>}
    {dados && <article className="space-y-4 rounded-xl border border-red-100 p-5">
      <h2 className="break-words text-xl font-semibold">{dados.hemocentro.nome}</h2>
      <dl className="space-y-2">
        <div><dt className="font-semibold">Endereço</dt><dd className="break-words">{dados.hemocentro.endereco}</dd></div>
        <div><dt className="font-semibold">Data e horário</dt><dd>{dataAtendimento(dados.reserva.agendado_em, dados.reserva.fuso_horario)}</dd></div>
        <div><dt className="font-semibold">Fuso horário</dt><dd>{dados.reserva.fuso_horario ?? 'Horário local do dispositivo; fuso da unidade não informado.'}</dd></div>
        <div><dt className="font-semibold">Status</dt><dd>{STATUS_LABELS[dados.reserva.status]}</dd></div>
      </dl>
      {dados.reserva.status === 'AGENDADO' ? <>
        <p className="text-sm text-zinc-600">Após confirmar, suas respostas de pré-triagem estarão disponíveis à enfermagem autorizada da unidade. Você não poderá mais cancelar ou remarcar esta reserva.</p>
        <Button disabled={confirmando || atualizacaoNecessaria} onClick={() => void confirmar()}>
          {confirmando ? 'Confirmando chegada...' : 'Confirmar minha chegada'}
        </Button>
      </> : <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
        Chegada confirmada. Seu atendimento está aguardando triagem e já está disponível para a enfermagem da unidade. Aguarde as orientações da equipe.
      </p>}
    </article>}
    <Link to="/agendamentos" className="inline-flex min-h-11 items-center text-red-800 underline">Consultar meus agendamentos</Link>
  </section>
}
