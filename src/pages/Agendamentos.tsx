import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { FormularioPreTriagem, ResumoPreTriagem } from '../components/FormularioPreTriagem'
import type { FormularioPreTriagemHandle } from '../components/FormularioPreTriagem'
import { SeletorHorario } from '../components/SeletorHorario'
import { agendar, meusAgendamentos, meuHistorico } from '../services/triagens'
import { cancelarReserva, remarcarReserva } from '../services/agenda'
import { listarHemocentros } from '../services/hemocentros'
import type { HistoricoItem } from '../types/triagem'
import type { CatalogoPreTriagem, RespostasQuestionario } from '../types/questionario'
import { consultarQuestionario, montarQuestionario } from '../services/questionario'
import type { HorarioDisponivel, Reserva } from '../types/agenda'
import type { Hemocentro } from '../types/hemocentro'
import { dataAtendimento, mensagemErro, STATUS_LABELS } from '../utils/triagemFormatters'
import { confirmarNavegacao, useUnsavedChanges } from '../hooks/useUnsavedChanges'

export function Agendamentos() {
  const navigate = useNavigate()
  const [centros, setCentros] = useState<Hemocentro[]>([])
  const [agendas, setAgendas] = useState<Reserva[]>([])
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [centro, setCentro] = useState('')
  const [horario, setHorario] = useState<HorarioDisponivel | null>(null)
  const [fusoHorario, setFusoHorario] = useState<string | null>(null)
  const [respostas, setRespostas] = useState<RespostasQuestionario>({})
  const [confirmacoes, setConfirmacoes] = useState<string[]>([])
  const [catalogo, setCatalogo] = useState<CatalogoPreTriagem | null>(null)
  const [erroCatalogo, setErroCatalogo] = useState('')
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  const [revisaoCatalogo, setRevisaoCatalogo] = useState(0)
  const formulario = useRef<FormularioPreTriagemHandle>(null)
  const [erroDados, setErroDados] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [revisao, setRevisao] = useState(0)
  const [revisando, setRevisando] = useState(false)
  const [remarcando, setRemarcando] = useState<Reserva | null>(null)
  const requisicao = useRef<{ conteudo: string; chave: string } | null>(null)

  const formularioSujo = Object.keys(respostas).length > 0 || confirmacoes.length > 0

  useUnsavedChanges(formularioSujo || revisando || remarcando !== null,
    'Sair e descartar os dados ainda não enviados? Reservas existentes permanecem válidas.')

  useEffect(() => {
    if (!formularioSujo && !revisando && !remarcando) return
    const indiceAtual: unknown = window.history.state?.idx
    if (typeof indiceAtual !== 'number') return
    let restaurando = false
    function protegerHistorico(event: PopStateEvent) {
      if (restaurando) {
        restaurando = false
        event.stopImmediatePropagation()
        return
      }
      const destino: unknown = event.state?.idx
      if (typeof destino !== 'number' || destino === indiceAtual) return
      if (window.confirm('Sair e descartar os dados ainda não enviados? Reservas existentes permanecem válidas.')) return
      // Restaura o índice antes que o BrowserRouter desmonte o formulário.
      event.stopImmediatePropagation()
      restaurando = true
      window.history.go((indiceAtual as number) - destino)
    }
    window.addEventListener('popstate', protegerHistorico, true)
    return () => window.removeEventListener('popstate', protegerHistorico, true)
  }, [formularioSujo, revisando, remarcando])

  const escolherHorario = useCallback((value: HorarioDisponivel | null) => {
    setHorario(value)
    setRevisando(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function carregarCatalogo() {
      setCarregandoCatalogo(true)
      setErroCatalogo('')
      try {
        const resultado = await consultarQuestionario(controller.signal)
        if (!controller.signal.aborted) setCatalogo(resultado)
      } catch {
        if (!controller.signal.aborted) setErroCatalogo('Não foi possível carregar o formulário de pré-triagem. Novas reservas estão indisponíveis. Seus dados preenchidos foram preservados.')
      } finally {
        if (!controller.signal.aborted) setCarregandoCatalogo(false)
      }
    }
    void carregarCatalogo()
    return () => controller.abort()
  }, [revisaoCatalogo])

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setErroDados('')
      try {
        const [unidades, registros, anteriores] = await Promise.all([
          listarHemocentros(controller.signal), meusAgendamentos(controller.signal), meuHistorico(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setCentros(unidades)
          setAgendas(registros)
          setHistorico(anteriores)
        }
      } catch (error) {
        if (!controller.signal.aborted) setErroDados(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [revisao])

  function chave(conteudo: string) {
    if (requisicao.current?.conteudo !== conteudo) requisicao.current = { conteudo, chave: crypto.randomUUID() }
    return requisicao.current.chave
  }

  function encerrarRemarcacao() {
    setRemarcando(null)
    setCentro('')
    escolherHorario(null)
    requisicao.current = null
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    if (ocupado || carregando) return
    setErroAcao('')
    setMensagem('')
    if (!horario || !centro) {
      setErroAcao('Escolha um hemocentro, um dia e um horário com vaga.')
      document.getElementById('hemocentro-reserva')?.focus()
      return
    }
    if (!remarcando) {
      if (!catalogo?.publicado || carregandoCatalogo || erroCatalogo) {
        setErroAcao('O formulário está indisponível. Não é possível concluir uma nova reserva.')
        return
      }
      if (!revisando && !formulario.current?.validar()) return
    }
    if (!revisando) {
      setRevisando(true)
      return
    }
    setOcupado(true)
    try {
      if (remarcando) {
        const data = { horario_id: horario.id, versao: remarcando.versao }
        const reserva = await remarcarReserva(remarcando.id, {
          ...data, chave_requisicao: chave(JSON.stringify({ acao: 'remarcar', id: remarcando.id, ...data })),
        })
        setMensagem(reserva.status === 'AGENDADO'
          ? `Remarcação confirmada para ${dataAtendimento(reserva.agendado_em, reserva.fuso_horario)}.`
          : 'Esta solicitação já foi processada. Confira a situação atual em Meus agendamentos.')
        encerrarRemarcacao()
      } else {
        const data = {
          horario_id: horario.id,
          questionario: montarQuestionario(catalogo!, respostas, confirmacoes),
        }
        const reserva = await agendar({ ...data, chave_requisicao: chave(JSON.stringify(data)) })
        setMensagem(reserva.status === 'AGENDADO' ? 'Agendamento confirmado. Suas respostas foram registradas para a equipe de saúde. A possibilidade de doar será avaliada no hemocentro. Na chegada, procure a recepção.'
          : 'Esta solicitação já foi processada. Confira a situação atual em Meus agendamentos.')
        setRespostas({})
        setConfirmacoes([])
        escolherHorario(null)
        requisicao.current = null
      }
      setRevisao(value => value + 1)
    } catch (error) {
      setErroAcao(remarcando
        ? `${mensagemErro(error)} Confira seus agendamentos antes de repetir.`
        : 'Não foi possível confirmar a reserva. Suas respostas foram preservadas. Confira seus agendamentos antes de repetir. Se o questionário foi atualizado, descarte o preenchimento e recarregue o formulário.')
      setRevisao(value => value + 1)
    } finally {
      setOcupado(false)
    }
  }

  async function cancelar(reserva: Reserva) {
    if (ocupado || !window.confirm(`Cancelar a reserva em ${dataAtendimento(reserva.agendado_em, reserva.fuso_horario)}? A vaga será liberada e o registro será preservado.`)) return
    setErroAcao('')
    setMensagem('')
    setOcupado(true)
    try {
      await cancelarReserva(reserva.id, {
        versao: reserva.versao,
        chave_requisicao: chave(JSON.stringify({ acao: 'cancelar', id: reserva.id, versao: reserva.versao })),
      })
      setMensagem('Reserva cancelada. A vaga foi liberada.')
      if (remarcando?.id === reserva.id) encerrarRemarcacao()
      requisicao.current = null
      setRevisao(value => value + 1)
    } catch (error) {
      setErroAcao(mensagemErro(error))
      setRevisao(value => value + 1)
    } finally {
      setOcupado(false)
    }
  }

  const unidade = centros.find(item => String(item.id) === centro)
  const unidadesAtivas = centros.filter(item => item.status === 'ATIVO')

  return <section className="min-w-0 space-y-5" aria-label="Agendamentos e histórico">
    <Button variant="secondary" disabled={ocupado} onClick={() => { if (confirmarNavegacao()) navigate('/home') }}>Voltar à central</Button>
    {carregando && <p role="status">Carregando dados...</p>}
    {erroDados && <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-red-800">
      <p>{erroDados}</p>
      <Button variant="secondary" disabled={ocupado || carregando} onClick={() => setRevisao(value => value + 1)}>Atualizar dados</Button>
    </div>}
    {erroAcao && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erroAcao}</p>}
    {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
    <form onSubmit={enviar} noValidate aria-busy={ocupado} className="min-w-0 space-y-5 rounded-xl border border-red-100 p-4 md:p-6">
      <h2 className="text-xl font-semibold">{remarcando ? 'Remarcar agendamento' : 'Reservar uma vaga'}</h2>
      <p className="text-sm text-zinc-600">A vaga só é garantida após a confirmação. Os horários são apresentados no fuso da unidade.</p>
      {remarcando && <aside className="space-y-2 rounded-xl bg-amber-50 p-4 text-amber-900">
        <p>Reserva atual: {dataAtendimento(remarcando.agendado_em, remarcando.fuso_horario)}. Ela permanece válida se o novo horário ficar sem vagas.</p>
        <p>A remarcação é na mesma unidade e preserva suas respostas de pré-triagem.</p>
        <p>Informe à equipe qualquer mudança de saúde desde o preenchimento original.</p>
        <Button variant="secondary" disabled={ocupado} onClick={encerrarRemarcacao}>Desistir da remarcação</Button>
      </aside>}
      <label className="grid min-w-0 gap-2">Hemocentro
        <select id="hemocentro-reserva" required disabled={ocupado || carregando || !!erroDados || !!remarcando}
          className="min-h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          value={centro} onChange={event => { setCentro(event.target.value); escolherHorario(null); setErroAcao('') }}>
          <option value="">Selecione uma unidade</option>
          {unidadesAtivas.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </label>
      {!carregando && !erroDados && unidadesAtivas.length === 0 && <p role="status">Nenhum hemocentro ativo disponível.</p>}
      {unidade && <div className="space-y-1 text-sm text-zinc-600">
        <p><strong>Endereço:</strong> {unidade.endereco}</p>
        <p><strong>Telefone:</strong> {unidade.telefone}</p>
      </div>}
      {centro && <SeletorHorario key={centro} centroId={Number(centro)} selecionado={horario}
        onSelecionar={escolherHorario} onFusoHorario={setFusoHorario} horarioAtualId={remarcando?.horario_id}
        disabled={ocupado || carregando || !!erroDados} revisao={revisao} />}
      {!remarcando && <>
        {carregandoCatalogo && <p role="status">Carregando formulário de pré-triagem...</p>}
        {erroCatalogo && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erroCatalogo}</p>}
        {!carregandoCatalogo && !erroCatalogo && catalogo && !catalogo.publicado && <aside role="status" className="space-y-2 rounded-xl bg-amber-50 p-4 text-amber-900">
          <p>Formulário de pré-triagem indisponível: o questionário ainda não está publicado. Novas reservas estão temporariamente indisponíveis. Você pode consultar, cancelar ou remarcar reservas existentes.</p>
          <p className="whitespace-pre-wrap">{catalogo.aviso}</p>
        </aside>}
        {catalogo?.publicado && !erroCatalogo && !carregandoCatalogo && !revisando && <FormularioPreTriagem ref={formulario}
          catalogo={catalogo} respostas={respostas} confirmacoes={confirmacoes}
          onRespostas={setRespostas} onConfirmacoes={setConfirmacoes} disabled={ocupado} />}
        {!revisando && <Button variant="secondary" disabled={ocupado || carregandoCatalogo} onClick={() => {
          if (formularioSujo && !window.confirm('Descartar respostas e confirmações não enviadas e carregar o questionário atual?')) return
          setRespostas({}); setConfirmacoes([]); setCatalogo(null); requisicao.current = null
          setRevisaoCatalogo(value => value + 1)
        }}>{erroCatalogo ? 'Tentar novamente' : formularioSujo ? 'Descartar preenchimento e atualizar formulário' : 'Atualizar formulário'}</Button>}
      </>}
      {revisando && horario && unidade && <section aria-labelledby="revisao-reserva-title" className="space-y-3 rounded-xl bg-red-50 p-4 text-red-900">
        <h3 id="revisao-reserva-title" className="font-semibold">Revise antes de confirmar</h3>
        <p>{unidade.nome} — {unidade.endereco}</p>
        <p>{dataAtendimento(horario.inicio, fusoHorario)} — {fusoHorario}. Confira a data e o horário da unidade.</p>
        {!remarcando && catalogo && <ResumoPreTriagem catalogo={catalogo} respostas={respostas} confirmacoes={confirmacoes} />}
        <p className="text-sm">A disponibilidade será conferida novamente. As respostas não poderão ser editadas depois do envio.</p>
        <Button variant="secondary" disabled={ocupado} onClick={() => setRevisando(false)}>Voltar para editar</Button>
      </section>}
      <Button type="submit" disabled={ocupado || carregando || !!erroDados || !horario || (!remarcando && (carregandoCatalogo || !!erroCatalogo || !catalogo?.publicado))} className="w-full sm:w-fit">
        {ocupado ? 'Confirmando...' : revisando ? remarcando ? 'Confirmar remarcação' : 'Confirmar reserva' : 'Revisar reserva'}
      </Button>
    </form>

    {!carregando && !erroDados && <>
      <section className="space-y-4" aria-labelledby="minhas-reservas-title">
        <h2 id="minhas-reservas-title" className="text-xl font-semibold">Meus agendamentos</h2>
        {agendas.length === 0 ? <p role="status">Nenhum agendamento registrado.</p> : <ul className="space-y-4">
          {agendas.map(item => <li key={item.id} className="min-w-0 space-y-3 rounded-xl border border-red-100 p-5">
            <h3 className="break-words text-lg font-semibold">{centros.find(unidade => unidade.id === item.hemocentro_id)?.nome ?? `Hemocentro ${item.hemocentro_id}`}</h3>
            <p>{dataAtendimento(item.agendado_em, item.fuso_horario)} · <strong>{STATUS_LABELS[item.status]}</strong></p>
            {item.fuso_horario && <p className="text-sm text-zinc-600">Fuso da unidade: {item.fuso_horario}</p>}
            {item.cancelavel_ate && item.status === 'AGENDADO' && <p className="text-sm">Cancelamento até {dataAtendimento(item.cancelavel_ate, item.fuso_horario)}. Remarcação até {item.remarcavel_ate && dataAtendimento(item.remarcavel_ate, item.fuso_horario)}.</p>}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={ocupado || !item.pode_remarcar} onClick={() => {
                setRemarcando(item); setCentro(String(item.hemocentro_id)); escolherHorario(null)
                setErroAcao(''); setMensagem(''); requisicao.current = null
              }}>Remarcar</Button>
              <Button variant="ghost" disabled={ocupado || !item.pode_cancelar} onClick={() => void cancelar(item)}>Cancelar reserva</Button>
            </div>
            {!item.pode_cancelar && item.motivo_cancelamento && <p className="text-sm text-zinc-600">Cancelamento: {item.motivo_cancelamento}</p>}
            {!item.pode_remarcar && item.motivo_remarcacao && <p className="text-sm text-zinc-600">Remarcação: {item.motivo_remarcacao}</p>}
            {item.alteracoes.length > 0 && <details className="text-sm text-zinc-600">
              <summary className="min-h-11 cursor-pointer py-3 font-semibold">Histórico da reserva</summary>
              <ul className="space-y-2">{item.alteracoes.map((alteracao, index) => <li key={index}>
                {dataAtendimento(alteracao.ocorrido_em, item.fuso_horario)} — {alteracao.acao.toLowerCase().replaceAll('_', ' ')}
                {alteracao.acao === 'REMARCADO' && alteracao.agendado_novo && <>: de {dataAtendimento(alteracao.agendado_anterior, item.fuso_horario)} para {dataAtendimento(alteracao.agendado_novo, item.fuso_horario)}</>}
              </li>)}</ul>
            </details>}
          </li>)}
        </ul>}
      </section>
      <section className="space-y-3 rounded-xl border border-red-100 p-5" aria-labelledby="historico-atendimentos-title">
        <h2 id="historico-atendimentos-title" className="text-xl font-semibold">Histórico de atendimentos</h2>
        <p className="text-sm text-zinc-600">Resultados de triagem, não comprovação de doações realizadas.</p>
        {historico.length === 0 ? <p>Nenhuma triagem finalizada.</p> : <ul className="space-y-2">{historico.map(item => <li key={item.agendamento_id}>{dataAtendimento(item.data)} · {item.tipo} · {STATUS_LABELS[item.resultado]}</li>)}</ul>}
      </section>
    </>}
  </section>
}
