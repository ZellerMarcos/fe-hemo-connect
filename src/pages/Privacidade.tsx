import { useState } from 'react'
import { AlertTriangle, Download, FileCheck2, Shield, Trash2 } from 'lucide-react'

import { Button } from '../components/ui/button'
import {
  consultarMeusDados,
  excluirMeusDados,
  exportarMeusDados,
  revogarConsentimento,
} from '../services/privacidade'
import type { DadosTitular } from '../types/privacidade'
import {
  formatarConsentimentos,
  formatarDadosTitular,
} from '../utils/privacyFormatters'
import { downloadExportacaoTitularPdf } from '../utils/privacyExportPdf'

interface PrivacidadeProps {
  email: string
  onContaRemovida: () => void
  onVoltar?: () => void
  embedded?: boolean
}

// Centraliza os fluxos de direitos do titular (consulta, exportacao, revogacao e exclusao).
export function Privacidade({ email, onVoltar, onContaRemovida, embedded = false }: PrivacidadeProps) {
  const [dados, setDados] = useState<DadosTitular | null>(null)
  const [finalidade, setFinalidade] = useState('seguranca')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const dadosFormatados = dados ? formatarDadosTitular(dados) : null

  // Carrega os dados pessoais atuais do titular para conferencia em tela.
  async function handleConsultar() {
    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      const payload = await consultarMeusDados(email)
      setDados(payload)
      setMensagem('Dados do titular carregados com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel consultar os dados do titular.')
    } finally {
      setCarregando(false)
    }
  }

  // Gera o arquivo PDF com os dados tratados para portabilidade do titular.
  async function handleExportar() {
    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      const payload = await exportarMeusDados(email)
      await downloadExportacaoTitularPdf(payload)
      setMensagem('Download do PDF concluido com sucesso.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel exportar os dados do titular.')
    } finally {
      setCarregando(false)
    }
  }

  // Revoga uma finalidade especifica de consentimento e recarrega os dados visiveis.
  async function handleRevogarConsentimento() {
    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      await revogarConsentimento(email, { finalidade })
      setMensagem(`Consentimento revogado para a finalidade: ${finalidade}.`)
      if (dados) {
        const atualizado = await consultarMeusDados(email)
        setDados(atualizado)
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel revogar o consentimento.')
    } finally {
      setCarregando(false)
    }
  }

  // Solicita a exclusao com anonimizaçao e encerra a sessao local apos sucesso.
  async function handleExcluirDados() {
    const confirmed = window.confirm('Esta acao ira anonimizar seus dados e desativar a conta. Deseja continuar?')
    if (!confirmed) return

    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      const response = await excluirMeusDados(email)
      setMensagem(response.mensagem)
      onContaRemovida()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel excluir os dados do titular.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className={embedded ? 'w-full p-1' : 'mx-auto w-full max-w-2xl rounded-2xl border border-red-100 bg-white/90 p-6 shadow-xl shadow-red-100/30 md:p-8'} aria-labelledby="privacy-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Privacidade</p>
        <h1 id="privacy-title" className="mt-2 text-3xl font-semibold text-zinc-900 md:text-4xl">Direitos do titular</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">Consulte, exporte, revogue consentimento e solicite exclusao dos seus dados.</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Button onClick={handleConsultar} disabled={carregando} className="rounded-xl">
          <FileCheck2 size={16} />
          Consultar meus dados
        </Button>
        <Button onClick={handleExportar} disabled={carregando} className="rounded-xl">
          <Download size={16} />
          Download
        </Button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-red-100 bg-red-50/45 p-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-700">
          Finalidade do consentimento
          <input className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none ring-red-200 focus:ring-2" value={finalidade} onChange={(event) => setFinalidade(event.target.value)} />
        </label>
        <Button type="button" onClick={handleRevogarConsentimento} disabled={carregando}>
          <Shield size={16} />
          Revogar consentimento
        </Button>
      </div>

      <Button type="button" variant="secondary" className="mt-4 w-full border-red-200 text-red-800" onClick={handleExcluirDados} disabled={carregando}>
        <Trash2 size={16} />
        Excluir/anonimizar meus dados
      </Button>

      {erro && <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800" role="alert"><AlertTriangle className="mr-1 inline" size={14} />{erro}</p>}
      {mensagem && <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800" role="status">{mensagem}</p>}

      {dados && (
        <div className="mt-4 rounded-xl border border-red-100 bg-white p-4">
          <h2 className="text-lg font-semibold text-zinc-900">Dados do titular</h2>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-[130px_1fr] md:text-base">
            <dt className="font-semibold text-red-800">Nome</dt>
            <dd className="text-zinc-700">{dadosFormatados?.nome}</dd>
            <dt className="font-semibold text-red-800">CPF</dt>
            <dd className="text-zinc-700">{dadosFormatados?.cpf}</dd>
            <dt className="font-semibold text-red-800">E-mail</dt>
            <dd className="text-zinc-700">{dadosFormatados?.email}</dd>
            <dt className="font-semibold text-red-800">Perfil</dt>
            <dd className="text-zinc-700">{dadosFormatados?.perfil}</dd>
          </dl>

          <h2 className="mt-5 text-lg font-semibold text-zinc-900">Consentimentos</h2>
          <div className="mt-3 grid gap-3">
            {formatarConsentimentos(dados.consentimentos).map((item) => (
              <article key={`${item.finalidade}-${item.versaoTermo}`} className="rounded-xl border border-red-100 bg-rose-50/45 p-3 text-sm leading-relaxed text-zinc-700">
                <p><span className="font-semibold text-red-800">Finalidade:</span> {item.finalidade}</p>
                <p><span className="font-semibold text-red-800">Versao:</span> {item.versaoTermo}</p>
                <p><span className="font-semibold text-red-800">Base legal:</span> {item.baseLegal}</p>
                <p><span className="font-semibold text-red-800">Status:</span> {item.status}</p>
                <p><span className="font-semibold text-red-800">Concedido em:</span> {item.concedidoEm}</p>
                <p><span className="font-semibold text-red-800">Revogado em:</span> {item.revogadoEm}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {onVoltar && (
        <Button variant="ghost" className="mt-3" type="button" onClick={onVoltar}>Voltar</Button>
      )}
    </section>
  )
}
