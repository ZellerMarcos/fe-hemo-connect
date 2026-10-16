import { useEffect, useState } from 'react'

import { Button } from '../components/ui/button'
import { listarRecepcao, receberDoador } from '../services/triagens'
import type { FilaResponse } from '../types/triagem'
import { dataAtendimento, mensagemErro } from '../utils/triagemFormatters'

export function Recepcao() {
  const [fila, setFila] = useState<FilaResponse | null>(null)
  const [pagina, setPagina] = useState(1)
  const [revisao, setRevisao] = useState(0)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function carregar() {
      setCarregando(true); setErro(''); setFila(null)
      try {
        const registros = await listarRecepcao(pagina, controller.signal)
        if (!controller.signal.aborted) setFila(registros)
      } catch (error) {
        if (!controller.signal.aborted) setErro(mensagemErro(error))
      } finally { if (!controller.signal.aborted) setCarregando(false) }
    }
    void carregar()
    return () => controller.abort()
  }, [pagina, revisao])

  async function confirmar(id: number, nome: string, versao: number) {
    if (ocupado || !window.confirm(`Confirma a chegada de ${nome}? Confira a identidade conforme o protocolo da instituição.`)) return
    setOcupado(true); setErro(''); setMensagem('')
    try {
      await receberDoador(id, versao)
      setMensagem('Chegada confirmada. Atendimento disponível para enfermagem.')
      setRevisao(value => value + 1)
    } catch (error) { setErro(`${mensagemErro(error)} Atualize a lista antes de repetir.`) }
    finally { setOcupado(false) }
  }

  return <section className="space-y-4" aria-label="Recepção de doadores">
    <p>Confirme a chegada do doador para disponibilizar o atendimento à enfermagem.</p>
    <Button variant="secondary" disabled={carregando || ocupado} onClick={() => setRevisao(value => value + 1)}>Atualizar lista</Button>
    {carregando && <p role="status">Carregando agendamentos...</p>}
    {erro && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
    {mensagem && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{mensagem}</p>}
    {fila && (fila.itens.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <caption className="mb-3 text-left">Agendamentos aguardando chegada: {fila.total}</caption>
      <thead><tr>{['Doador', 'CPF', 'Data/hora', 'Hemocentro', 'Ação'].map(label => <th key={label} scope="col" className="border-b p-3">{label}</th>)}</tr></thead>
      <tbody>{fila.itens.map(item => <tr key={item.id}>
        <td className="border-b p-3">{item.nome}</td><td className="border-b p-3">{item.cpf_mascarado}</td>
        <td className="border-b p-3">{dataAtendimento(item.agendado_em)}</td><td className="border-b p-3">{item.hemocentro_id}</td>
        <td className="border-b p-3"><Button size="sm" disabled={ocupado} onClick={() => void confirmar(item.id, item.nome, item.versao)}>Confirmar chegada</Button></td>
      </tr>)}</tbody>
    </table></div> : <p role="status">Nenhum agendamento aguardando chegada nesta página.</p>)}
    {fila && <nav aria-label="Paginação" className="flex items-center justify-between gap-3">
      <Button variant="secondary" disabled={pagina === 1 || ocupado || carregando} onClick={() => setPagina(value => value - 1)}>Anterior</Button>
      <span>Página {pagina}</span>
      <Button variant="secondary" disabled={pagina * fila.tamanho >= fila.total || ocupado || carregando} onClick={() => setPagina(value => value + 1)}>Próxima</Button>
    </nav>}
  </section>
}
