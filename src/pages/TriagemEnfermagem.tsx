import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { consultarTriagem, finalizarTriagem, iniciarTriagem, salvarAvaliacao } from '../services/triagens'
import type { LoginUserResponse } from '../types/auth'
import type { ResultadoTriagem, TriagemDetalhe } from '../types/triagem'
import { dataAtendimento, mensagemErro, STATUS_LABELS } from '../utils/triagemFormatters'

export function TriagemEnfermagem({ usuario }: { usuario: LoginUserResponse }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const atendimentoId = Number(id)
  const [dados, setDados] = useState<TriagemDetalhe | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [resultado, setResultado] = useState<ResultadoTriagem | ''>('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [revisao, setRevisao] = useState(0)
  const alterado = dados !== null && observacoes !== (dados.avaliacao?.observacoes ?? '')
  const podeEditar = dados?.agendamento.status === 'EM_TRIAGEM' && dados.avaliacao?.enfermeiro_id === usuario.id

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setDados(null)
      setErro('')
      try {
        if (!Number.isSafeInteger(atendimentoId) || atendimentoId <= 0) throw new Error('Atendimento inválido.')
        const detalhe = await consultarTriagem(atendimentoId, controller.signal)
        if (!controller.signal.aborted) {
          setDados(detalhe); setObservacoes(detalhe.avaliacao?.observacoes ?? ''); setResultado(detalhe.avaliacao?.resultado ?? '')
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [atendimentoId, revisao])

  useEffect(() => {
    function avisar(event: BeforeUnloadEvent) {
      if (alterado || ocupado) { event.preventDefault(); event.returnValue = '' }
    }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [alterado, ocupado])

  async function executar(acao: 'iniciar' | 'salvar' | 'finalizar') {
    if (ocupado || !dados) return
    if (acao !== 'iniciar' && !observacoes.trim()) { setErro('Registre as observações da avaliação.'); return }
    if (acao === 'finalizar' && !resultado) { setErro('Selecione o resultado antes de finalizar.'); return }
    if (acao === 'finalizar' && !window.confirm(`Finalizar a triagem como ${resultado ? STATUS_LABELS[resultado] : ''}? Confira os dados; a finalização não pode ser editada nesta tela.`)) return
    setOcupado(true); setErro(''); setMensagem('')
    try {
      let atualizado: TriagemDetalhe
      if (acao === 'iniciar') atualizado = await iniciarTriagem(atendimentoId)
      else {
        if (!dados.avaliacao) throw new Error('Inicie a triagem antes de registrar a avaliação.')
        atualizado = acao === 'finalizar' && resultado
          ? await finalizarTriagem(atendimentoId, observacoes, dados.avaliacao.versao, resultado)
          : await salvarAvaliacao(atendimentoId, observacoes, dados.avaliacao.versao)
      }
      setDados(atualizado); setObservacoes(atualizado.avaliacao?.observacoes ?? ''); setResultado(atualizado.avaliacao?.resultado ?? '')
      setMensagem(acao === 'finalizar' ? 'Triagem finalizada com sucesso.' : acao === 'salvar' ? 'Avaliação salva com sucesso.' : 'Triagem iniciada.')
    } catch (error) {
      setErro(`${mensagemErro(error)} Consulte o estado atualizado antes de repetir a operação.`)
    } finally { setOcupado(false) }
  }

  function recarregar() {
    if (!alterado || window.confirm('Recarregar descarta as observações ainda não salvas. Continuar?')) {
      setMensagem(''); setRevisao(value => value + 1)
    }
  }

  return (
    <section className="space-y-5" aria-label="Detalhes da triagem">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={ocupado} onClick={() => {
          if (!alterado || window.confirm('Sair descarta as observações ainda não salvas. Continuar?')) navigate('/enfermeiro/triagens')
        }}>Voltar à lista</Button>
        <Button variant="ghost" disabled={ocupado || carregando} onClick={recarregar}>Recarregar atendimento</Button>
      </div>
      {carregando && <p role="status">Carregando atendimento...</p>}
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
      {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
      {dados && <>
        <article className="rounded-xl border border-red-100 p-5">
          <h2 className="text-xl font-semibold">Dados do doador</h2>
          <p className="my-3 font-semibold text-red-800">{STATUS_LABELS[dados.agendamento.status]} · {dataAtendimento(dados.agendamento.agendado_em)}</p>
          <dl className="grid gap-2 text-sm sm:grid-cols-[180px_1fr]">
            {[
              ['Nome', dados.doador.nome], ['CPF', dados.doador.cpf],
              ['Data de nascimento', dados.doador.data_nascimento ? dados.doador.data_nascimento.split('-').reverse().join('/') : 'Não informada'],
              ['Telefone', dados.doador.telefone ?? 'Não informado'], ['E-mail', dados.doador.email],
              ['Tipo sanguíneo', dados.doador.tipo_sanguineo ?? 'Não informado'],
            ].map(([label, value]) => <div key={label} className="contents"><dt className="font-semibold">{label}</dt><dd className="break-words">{value}</dd></div>)}
          </dl>
        </article>
        <article className="rounded-xl border border-red-100 p-5">
          <h2 className="text-xl font-semibold">Pré-triagem</h2>
          <p className="mt-2 text-sm text-zinc-600">Respostas do doador, somente para consulta. Sem interpretação clínica automática.</p>
          {dados.pre_triagem.length === 0 ? <p className="mt-3">Nenhuma resposta registrada.</p> : <dl className="mt-4 space-y-3">
            {dados.pre_triagem.map((resposta, index) => <div key={index}><dt className="font-semibold">{resposta.pergunta}</dt><dd className="whitespace-pre-wrap break-words">{resposta.resposta}</dd></div>)}
          </dl>}
        </article>
        <article className="rounded-xl border border-red-100 p-5">
          <h2 className="text-xl font-semibold">Histórico de atendimentos</h2>
          <p className="mt-2 text-sm text-zinc-600">Triagens finalizadas neste hemocentro. Não comprova doações realizadas.</p>
          {dados.historico.length === 0 ? <p className="mt-3">Nenhum atendimento anterior registrado.</p> : <ul className="mt-3 space-y-2">
            {dados.historico.map(item => <li key={item.agendamento_id}>{dataAtendimento(item.data)} · {item.tipo} · {STATUS_LABELS[item.resultado]}</li>)}
          </ul>}
        </article>
        <article className="space-y-4 rounded-xl border border-red-100 p-5">
          <h2 className="text-xl font-semibold">Avaliação de enfermagem</h2>
          <p className="text-sm text-zinc-600">Registre observações conforme o protocolo institucional. Não há critérios clínicos automáticos. Salve antes de sair; não existe salvamento automático.</p>
          {dados.agendamento.status === 'AGUARDANDO_TRIAGEM' && <Button disabled={ocupado} onClick={() => void executar('iniciar')}>{ocupado ? 'Iniciando...' : 'Iniciar Triagem'}</Button>}
          {dados.avaliacao && <>
            <p className="text-sm">Início: {dataAtendimento(dados.avaliacao.iniciada_em)}{dados.avaliacao.finalizada_em && ` · Finalização: ${dataAtendimento(dados.avaliacao.finalizada_em)}`}</p>
            {!podeEditar && dados.agendamento.status === 'EM_TRIAGEM' && <p role="status">Atendimento em andamento com outro enfermeiro. Avaliação somente para consulta.</p>}
            <label className="grid gap-2 font-semibold">Observações
              <textarea className="min-h-40 rounded-xl border border-red-200 p-3 font-normal disabled:bg-zinc-50" maxLength={10000} value={observacoes} onChange={e => setObservacoes(e.target.value)} disabled={!podeEditar || ocupado} />
            </label>
            <label className="grid gap-2 font-semibold">Resultado
              <select className="rounded-xl border border-red-200 p-3 font-normal" value={resultado} onChange={e => {
                const value = e.target.value
                if (value === '' || value === 'APTO' || value === 'INAPTO' || value === 'ENCAMINHADO_MEDICO') setResultado(value)
              }} disabled={!podeEditar || ocupado}>
                <option value="">Selecione um resultado</option>
                <option value="APTO">Apto</option><option value="INAPTO">Inapto</option><option value="ENCAMINHADO_MEDICO">Encaminhado ao médico</option>
              </select>
            </label>
            {podeEditar && <div className="flex flex-wrap gap-3">
              <Button variant="secondary" disabled={ocupado} onClick={() => void executar('salvar')}>Salvar avaliação</Button>
              <Button disabled={ocupado} onClick={() => void executar('finalizar')}>{ocupado ? 'Processando...' : 'Finalizar triagem'}</Button>
            </div>}
            {dados.avaliacao.resultado === 'ENCAMINHADO_MEDICO' && <p role="status">Encaminhamento registrado. A avaliação médica é uma etapa separada e não está disponível nesta área.</p>}
          </>}
        </article>
      </>}
    </section>
  )
}
