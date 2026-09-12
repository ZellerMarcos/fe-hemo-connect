import { useState } from 'react'

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
import { downloadExportacaoTitularExcel } from '../utils/privacyExportExcel'

interface PrivacidadeProps {
  email: string
  onVoltar: () => void
  onContaRemovida: () => void
}

// Centraliza os fluxos de direitos do titular (consulta, exportacao, revogacao e exclusao).
export function Privacidade({ email, onVoltar, onContaRemovida }: PrivacidadeProps) {
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

  // Gera o arquivo XLSX com os dados tratados para portabilidade do titular.
  async function handleExportar() {
    setErro('')
    setMensagem('')
    setCarregando(true)
    try {
      const payload = await exportarMeusDados(email)
      await downloadExportacaoTitularExcel(payload)
      setMensagem('Download da exportacao concluido com sucesso.')
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
    <section className="auth-panel" aria-labelledby="privacy-title">
      <div className="panel-heading">
        <p className="eyebrow">Privacidade</p>
        <h1 id="privacy-title">Direitos do titular</h1>
        <p>Consulte, exporte, revogue consentimento e solicite exclusao dos seus dados.</p>
      </div>

      <div className="privacy-actions">
        <button type="button" onClick={handleConsultar} disabled={carregando}>Consultar meus dados</button>
        <button type="button" onClick={handleExportar} disabled={carregando}>Download</button>
      </div>

      <div className="privacy-revoke">
        <label>
          Finalidade do consentimento
          <input value={finalidade} onChange={(event) => setFinalidade(event.target.value)} />
        </label>
        <button type="button" onClick={handleRevogarConsentimento} disabled={carregando}>Revogar consentimento</button>
      </div>

      <button type="button" className="secondary-button" onClick={handleExcluirDados} disabled={carregando}>
        Excluir/anonimizar meus dados
      </button>

      {erro && <p className="feedback error" role="alert">{erro}</p>}
      {mensagem && <p className="feedback success" role="status">{mensagem}</p>}

      {dados && (
        <div className="privacy-result">
          <h2>Dados do titular</h2>
          <dl className="privacy-data-list">
            <div className="privacy-data-row">
              <dt>Nome</dt>
              <dd>{dadosFormatados?.nome}</dd>
            </div>
            <div className="privacy-data-row">
              <dt>CPF</dt>
              <dd>{dadosFormatados?.cpf}</dd>
            </div>
            <div className="privacy-data-row">
              <dt>E-mail</dt>
              <dd>{dadosFormatados?.email}</dd>
            </div>
            <div className="privacy-data-row">
              <dt>Perfil</dt>
              <dd>{dadosFormatados?.perfil}</dd>
            </div>
          </dl>

          <h2>Consentimentos</h2>
          <div className="privacy-consent-list">
            {formatarConsentimentos(dados.consentimentos).map((item) => (
              <article key={`${item.finalidade}-${item.versaoTermo}`} className="privacy-consent-card">
                <p><strong>Finalidade:</strong> {item.finalidade}</p>
                <p><strong>Versao:</strong> {item.versaoTermo}</p>
                <p><strong>Base legal:</strong> {item.baseLegal}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Concedido em:</strong> {item.concedidoEm}</p>
                <p><strong>Revogado em:</strong> {item.revogadoEm}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <button className="text-button" type="button" onClick={onVoltar}>Voltar</button>
    </section>
  )
}
