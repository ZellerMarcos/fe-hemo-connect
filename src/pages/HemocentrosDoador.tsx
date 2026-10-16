import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { consultarDisponibilidade } from '../services/agenda'
import { listarHemocentros } from '../services/hemocentros'
import type { Disponibilidade } from '../types/agenda'
import type { Hemocentro } from '../types/hemocentro'
import { mensagemErro } from '../utils/triagemFormatters'

type ConsultaVagas =
  | { estado: 'carregando' }
  | { estado: 'erro'; mensagem: string }
  | { estado: 'pronto'; dados: Disponibilidade }

function normalizarBusca(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
}

function telefoneDiscavel(telefone: string) {
  const texto = telefone.trim()
  if (!/^\+?[\d\s().-]+$/.test(texto)) return null
  const numero = texto.replace(/[^\d+]/g, '')
  return numero.replace(/\D/g, '').length >= 3 ? `tel:${numero}` : null
}

function dataLocal(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${data}T12:00:00Z`))
}

function possuiVagas(dados: Disponibilidade) {
  return dados.situacao === 'DISPONIVEL'
    && dados.dias.some(dia => dia.horarios.some(horario => horario.vagas_disponiveis > 0))
}

export function HemocentrosDoador() {
  const navigate = useNavigate()
  const [centros, setCentros] = useState<Hemocentro[] | null>(null)
  const [busca, setBusca] = useState('')
  const [consultas, setConsultas] = useState<Record<number, ConsultaVagas>>({})
  const [carregando, setCarregando] = useState(true)
  const [consultandoVagas, setConsultandoVagas] = useState(false)
  const [erro, setErro] = useState('')
  const [revisao, setRevisao] = useState(0)
  const consultaAtual = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    consultaAtual.current = controller
    async function carregar() {
      setCarregando(true)
      setErro('')
      setCentros(null)
      setConsultas({})
      setConsultandoVagas(true)
      try {
        const unidades = await listarHemocentros(controller.signal)
        if (controller.signal.aborted) return
        setCentros(unidades)
        setCarregando(false)
        const ativas = unidades.filter(unidade => unidade.status === 'ATIVO')
        for (let indice = 0; indice < ativas.length && !controller.signal.aborted; indice += 4) {
          await Promise.all(ativas.slice(indice, indice + 4).map(async unidade => {
            try {
              const dados = await consultarDisponibilidade(unidade.id, '', controller.signal)
              if (!controller.signal.aborted) {
                setConsultas(anteriores => ({ ...anteriores, [unidade.id]: { estado: 'pronto', dados } }))
              }
            } catch (error) {
              if (!controller.signal.aborted) {
                setConsultas(anteriores => ({ ...anteriores, [unidade.id]: { estado: 'erro', mensagem: mensagemErro(error) } }))
              }
            }
          }))
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false)
          setConsultandoVagas(false)
        }
      }
    }
    void carregar()
    return () => controller.abort()
  }, [revisao])

  function atualizar() {
    consultaAtual.current?.abort()
    setRevisao(valor => valor + 1)
  }

  async function tentarVagasNovamente(id: number) {
    const controller = consultaAtual.current
    if (!controller || controller.signal.aborted || consultandoVagas) return
    setConsultandoVagas(true)
    setConsultas(anteriores => ({ ...anteriores, [id]: { estado: 'carregando' } }))
    try {
      const dados = await consultarDisponibilidade(id, '', controller.signal)
      if (!controller.signal.aborted) setConsultas(anteriores => ({ ...anteriores, [id]: { estado: 'pronto', dados } }))
    } catch (error) {
      if (!controller.signal.aborted) {
        setConsultas(anteriores => ({ ...anteriores, [id]: { estado: 'erro', mensagem: mensagemErro(error) } }))
      }
    } finally {
      if (!controller.signal.aborted) setConsultandoVagas(false)
    }
  }

  const termo = normalizarBusca(busca)
  const filtrados = centros?.filter(unidade =>
    normalizarBusca(`${unidade.nome} ${unidade.endereco}`).includes(termo),
  ) ?? []

  return <section className="min-w-0 space-y-5" aria-label="Consulta de hemocentros">
    <Button variant="secondary" onClick={() => navigate('/home')}>Voltar à central</Button>
    <p className="text-zinc-600">Conheça as unidades cadastradas e escolha onde deseja doar. As vagas podem mudar até a confirmação da reserva.</p>
    <p className="text-sm text-zinc-600">O botão de agendamento fica disponível quando há vagas nos próximos 7 dias. Outras semanas podem ser consultadas em Agendamentos, pela central.</p>
    <div className="flex flex-wrap items-end gap-3">
      <label htmlFor="busca-hemocentros" className="grid min-w-0 flex-1 gap-2 font-semibold">
        Buscar por nome ou endereço
        <Input id="busca-hemocentros" type="search" value={busca}
          onChange={event => setBusca(event.target.value)} />
      </label>
      <Button variant="secondary" disabled={carregando} onClick={atualizar}>Atualizar lista</Button>
    </div>
    {carregando && <p role="status">Carregando hemocentros...</p>}
    {erro && <div role="alert" className="space-y-2 rounded-xl bg-red-50 p-4 text-red-800">
      <p>{erro}</p>
      <Button variant="secondary" onClick={atualizar}>Tentar novamente</Button>
    </div>}
    {!carregando && !erro && centros && <>
      <p role="status" className="text-sm text-zinc-600">{filtrados.length} de {centros.length} hemocentro(s).</p>
      {centros.length === 0
        ? <p>Nenhum hemocentro cadastrado.</p>
        : filtrados.length === 0
          ? <div className="space-y-2"><p>Nenhum hemocentro encontrado para esta busca.</p><Button variant="secondary" onClick={() => setBusca('')}>Limpar busca</Button></div>
          : <ul className="grid gap-4 md:grid-cols-2">
            {filtrados.map(unidade => {
              const consulta = consultas[unidade.id]
              const dados = consulta?.estado === 'pronto' ? consulta.dados : null
              const inativa = unidade.status === 'INATIVO' || dados?.situacao === 'INATIVO'
              const vagas = !inativa && dados !== null && possuiVagas(dados)
              const telefone = telefoneDiscavel(unidade.telefone)
              return <li key={unidade.id} className="min-w-0 space-y-3 rounded-xl border border-red-100 bg-white p-5">
                <h2 className="break-words text-xl font-semibold">{unidade.nome}</h2>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${inativa ? 'bg-zinc-100 text-zinc-700' : 'bg-emerald-50 text-emerald-800'}`}>
                  {inativa ? 'Inativo' : 'Ativo'}
                </span>
                <dl className="space-y-2 text-sm text-zinc-600">
                  <div><dt className="font-semibold">Endereço</dt><dd className="break-words">{unidade.endereco}</dd></div>
                  <div><dt className="font-semibold">Telefone</dt><dd className="break-words">
                    {telefone ? <a href={telefone} className="inline-flex min-h-11 items-center text-red-800 underline focus-visible:outline-2 focus-visible:outline-red-700">{unidade.telefone}</a> : unidade.telefone}
                  </dd></div>
                </dl>
                {inativa ? <p className="text-sm">Esta unidade está inativa e não recebe novos agendamentos.</p> : <>
                  {(!consulta || consulta.estado === 'carregando') && <p role="status">Consultando vagas nos próximos 7 dias...</p>}
                  {consulta?.estado === 'erro' && <div role="alert" className="space-y-2 text-sm text-red-800">
                    <p>Não foi possível consultar as vagas: {consulta.mensagem}</p>
                    <Button variant="secondary" disabled={consultandoVagas} onClick={() => void tentarVagasNovamente(unidade.id)}>Tentar consultar vagas novamente</Button>
                  </div>}
                  {dados && <>
                    <p className="text-sm font-semibold">{dados.situacao === 'SEM_AGENDA'
                      ? 'A unidade ainda não publicou sua agenda.'
                      : vagas ? 'Vagas disponíveis nos próximos 7 dias.' : 'Sem vagas nos próximos 7 dias.'}</p>
                    {dados.dias.length > 0 && <p className="text-sm text-zinc-600">
                      Período consultado: {dataLocal(dados.dias[0].data)} a {dataLocal(dados.dias[dados.dias.length - 1].data)}.
                    </p>}
                    {dados.fuso_horario && <p className="text-sm text-zinc-600">Fuso da unidade: {dados.fuso_horario}.</p>}
                    {dados.avisos.length > 0 && <ul className="space-y-1 text-sm text-amber-900">{dados.avisos.map(aviso => <li key={aviso}>{aviso}</li>)}</ul>}
                  </>}
                  <Button disabled={!vagas} className="h-auto min-h-11 w-full px-4 py-3 sm:w-fit"
                    onClick={() => navigate(`/agendamentos?hemocentro_id=${unidade.id}`)}>Agendar doação neste local</Button>
                </>}
              </li>
            })}
          </ul>}
    </>}
  </section>
}
