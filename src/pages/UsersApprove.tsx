import { useEffect, useState } from 'react'

import { Button } from '../components/ui/button'
import { listarHemocentros } from '../services/hemocentros'
import { aprovarEnfermeiro, listarEnfermeirosPendentes } from '../services/usuarios'
import type { AprovacoesPendentes, EnfermeiroPendente } from '../types/usuario'
import { mensagemErro } from '../utils/triagemFormatters'

export function UsersApprove() {
  const [dados, setDados] = useState<AprovacoesPendentes | null>(null)
  const [centros, setCentros] = useState<{ id: number; nome: string }[]>([])
  const [selecao, setSelecao] = useState<Record<number, string>>({})
  const [conferidos, setConferidos] = useState<Record<number, boolean>>({})
  const [pagina, setPagina] = useState(1)
  const [revisao, setRevisao] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true); setErro(''); setDados(null)
      setSelecao({}); setConferidos({})
      try {
        const [pendentes, unidades] = await Promise.all([
          listarEnfermeirosPendentes(pagina, controller.signal), listarHemocentros(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setDados(pendentes); setCentros(unidades.filter(item => item.status === 'ATIVO'))
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally { if (!controller.signal.aborted) setCarregando(false) }
    }
    void carregar()
    return () => controller.abort()
  }, [pagina, revisao])

  async function aprovar(item: EnfermeiroPendente) {
    if (ocupado) return
    const centro = centros.find(unidade => String(unidade.id) === selecao[item.id])
    if (!conferidos[item.id] || !centro) {
      setErro('Confirme a conferência profissional e selecione um hemocentro ativo.')
      return
    }
    if (!window.confirm(`Aprovar ${item.nome} como enfermeiro(a) no hemocentro ${centro.nome}? A conta poderá acessar dados de doadores dessa unidade.`)) return
    setOcupado(true); setErro(''); setMensagem('')
    try {
      await aprovarEnfermeiro(item.id, centro.id)
      setMensagem(`${item.nome}: aprovação concluída. A conta pode realizar login com 2FA.`)
      // Se esta era a última solicitação da página, retorna à página anterior.
      if (dados?.itens.length === 1 && pagina > 1) setPagina(value => value - 1)
      else setRevisao(value => value + 1)
    } catch (error) {
      setErro(`${mensagemErro(error)} Atualize a lista antes de repetir a aprovação.`)
    } finally { setOcupado(false) }
  }

  return <section className="space-y-5" aria-label="Enfermeiros pendentes de aprovação">
    <p className="text-zinc-600">Confira o registro profissional e a identidade do solicitante pelos procedimentos oficiais da instituição antes de liberar o acesso. Não há consulta automática ao COREN.</p>
    <Button variant="secondary" disabled={ocupado || carregando} onClick={() => setRevisao(value => value + 1)}>Atualizar solicitações</Button>
    {carregando && <p role="status">Carregando solicitações...</p>}
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
    {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
    {dados && <>
      <p className="font-semibold">Solicitações pendentes: {dados.total}</p>
      {centros.length === 0 && <p role="status" className="rounded-xl border border-red-200 p-4">Nenhum hemocentro ativo disponível. Cadastre ou ative uma unidade antes de aprovar.</p>}
      {dados.itens.length === 0 ? <p role="status" className="rounded-xl border border-red-100 p-6">Nenhum enfermeiro pendente de aprovação nesta página.</p> : <div className="grid gap-4">
        {dados.itens.map(item => <article key={item.id} className="space-y-4 rounded-xl border border-red-100 p-5" aria-labelledby={`solicitante-${item.id}`}>
          <h2 id={`solicitante-${item.id}`} className="text-xl font-semibold">{item.nome}</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="font-semibold">E-mail</dt><dd className="break-words">{item.email}</dd>
            <dt className="font-semibold">COREN informado</dt><dd>{item.coren_uf} · {item.coren_numero}</dd>
            <dt className="font-semibold">Situação</dt><dd>Conta inativa, aguardando conferência administrativa.</dd>
          </dl>
          <label className="grid gap-2 text-sm font-semibold">Hemocentro para {item.nome}
            <select className="rounded-xl border border-red-200 bg-white p-3" value={selecao[item.id] ?? ''} disabled={ocupado} onChange={event => setSelecao({ ...selecao, [item.id]: event.target.value })}>
              <option value="">Selecione o hemocentro</option>{centros.map(centro => <option key={centro.id} value={centro.id}>{centro.nome}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={conferidos[item.id] ?? false} disabled={ocupado} onChange={event => setConferidos({ ...conferidos, [item.id]: event.target.checked })} />
            <span>Conferi o COREN, a categoria de enfermeiro(a), a situação do registro e a identidade de {item.nome}, conforme o procedimento institucional.</span>
          </label>
          <Button disabled={ocupado || !conferidos[item.id] || !selecao[item.id] || centros.length === 0} onClick={() => void aprovar(item)}>{ocupado ? 'Processando...' : `Aprovar ${item.nome}`}</Button>
        </article>)}
      </div>}
      <nav aria-label="Paginação de solicitações" className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={pagina === 1 || ocupado || carregando} onClick={() => setPagina(value => value - 1)}>Anterior</Button>
        <span>Página {pagina} de {Math.max(1, Math.ceil(dados.total / dados.tamanho))}</span>
        <Button variant="secondary" disabled={pagina * dados.tamanho >= dados.total || ocupado || carregando} onClick={() => setPagina(value => value + 1)}>Próxima</Button>
      </nav>
    </>}
  </section>
}
