import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { consultarIndicadores, listarTriagens } from '../services/triagens'
import type { FilaResponse, Indicadores } from '../types/triagem'
import { dataAtendimento, mensagemErro, STATUS_LABELS } from '../utils/triagemFormatters'

export function Enfermagem() {
  const navigate = useNavigate()
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [fila, setFila] = useState<FilaResponse | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [form, setForm] = useState({ busca: '', status: 'AGUARDANDO_TRIAGEM', inicio: '', fim: '' })
  const [filtros, setFiltros] = useState(form)
  const [pagina, setPagina] = useState(1)
  const [revisao, setRevisao] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true)
      setErro('')
      setFila(null)
      setIndicadores(null)
      const params = new URLSearchParams({ pagina: String(pagina) })
      Object.entries(filtros).forEach(([key, value]) => { if (value) params.set(key, value) })
      try {
        const [stats, registros] = await Promise.all([
          consultarIndicadores(controller.signal), listarTriagens(params, controller.signal),
        ])
        if (!controller.signal.aborted) { setIndicadores(stats); setFila(registros) }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }
    void carregar()
    return () => controller.abort()
  }, [filtros, pagina, revisao])

  function filtrar(event: FormEvent) {
    event.preventDefault()
    if (form.inicio && form.fim && form.inicio > form.fim) {
      setErro('O início do período deve ser anterior ao fim.')
      return
    }
    setPagina(1)
    setFiltros({ ...form })
  }

  return (
    <section aria-label="Triagens de doadores" className="space-y-5">
      <p className="text-zinc-600">Acompanhe os doadores que precisam passar pela avaliação no seu hemocentro.</p>
      {carregando && <p role="status">Carregando triagens...</p>}
      {erro && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro} <Button variant="ghost" onClick={() => setRevisao(value => value + 1)}>Tentar novamente</Button></div>}
      {indicadores && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Triagens pendentes', indicadores.pendentes], ['Em atendimento', indicadores.em_atendimento],
          ['Triagens concluídas', indicadores.concluidas], ['Encaminhadas ao médico', indicadores.encaminhadas_medico],
        ].map(([label, value]) => <article key={label} className="rounded-xl border border-red-100 p-4"><h2 className="text-sm text-zinc-600">{label}</h2><p className="mt-2 text-3xl font-semibold">{value}</p></article>)}
      </div>}
      <p className="text-sm text-zinc-500">Indicadores de todos os atendimentos da unidade. Concluídas inclui os encaminhamentos; os filtros abaixo se aplicam somente à lista.</p>
      <form onSubmit={filtrar} className="grid gap-3 rounded-xl bg-rose-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-sm">Nome ou CPF<Input maxLength={100} value={form.busca} onChange={e => setForm({ ...form, busca: e.target.value })} /></label>
        <label className="grid gap-1 text-sm">Status<select className="rounded-xl border border-red-200 bg-white p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).filter(([key]) => key !== 'AGENDADO').map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <label className="grid gap-1 text-sm">De (data UTC)<Input type="date" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} /></label>
        <label className="grid gap-1 text-sm">Até (data UTC)<Input type="date" value={form.fim} onChange={e => setForm({ ...form, fim: e.target.value })} /></label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit" disabled={carregando}>Filtrar</Button>
          <Button variant="secondary" disabled={carregando} onClick={() => {
            const empty = { busca: '', status: '', inicio: '', fim: '' }
            setForm(empty); setFiltros(empty); setPagina(1)
          }}>Limpar filtros</Button>
          <Button variant="ghost" disabled={carregando} onClick={() => setRevisao(value => value + 1)}>Atualizar</Button>
        </div>
      </form>
      {fila && (fila.itens.length === 0 ? <div className="rounded-xl border border-red-100 p-6" role="status">
        <h2 className="font-semibold">{filtros.status === 'AGUARDANDO_TRIAGEM' ? 'Nenhuma triagem pendente.' : 'Nenhuma triagem encontrada.'}</h2>
        <p className="mt-2 text-zinc-600">Não existem atendimentos nesta página para os filtros selecionados. Confira os filtros e a paginação.</p>
      </div> : <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="mb-3 text-left font-semibold">Atendimentos encontrados: {fila.total}</caption>
          <thead><tr>{['Nome', 'CPF', 'Agendamento', 'Tipo sanguíneo', 'Status', 'Ação'].map(label => <th key={label} scope="col" className="border-b p-3">{label}</th>)}</tr></thead>
          <tbody>{fila.itens.map(item => <tr key={item.id}>
            <td className="border-b p-3">{item.nome}</td><td className="border-b p-3 whitespace-nowrap">{item.cpf_mascarado}</td>
            <td className="border-b p-3">{dataAtendimento(item.agendado_em)}</td><td className="border-b p-3">{item.tipo_sanguineo ?? 'Não informado'}</td>
            <td className="border-b p-3">{STATUS_LABELS[item.status]}</td><td className="border-b p-3"><Button size="sm" onClick={() => navigate(`/enfermeiro/triagens/${item.id}`)}>Visualizar</Button></td>
          </tr>)}</tbody>
        </table>
      </div>)}
      {fila && <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={carregando || pagina === 1} onClick={() => setPagina(value => value - 1)}>Anterior</Button>
        <span>Página {pagina} de {Math.max(1, Math.ceil(fila.total / fila.tamanho))}</span>
        <Button variant="secondary" disabled={carregando || pagina * fila.tamanho >= fila.total} onClick={() => setPagina(value => value + 1)}>Próxima</Button>
      </nav>}
    </section>
  )
}
