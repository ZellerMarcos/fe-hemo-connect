import * as PDFKit from 'pdfkit'
import Helvetica from 'pdfkit/standard-fonts/Helvetica'

import type { ExportacaoTitular } from '../types/privacidade'
import { formatarConsentimentos, formatarDadosTitular, formatarDataHora } from './privacyFormatters'

const PDFDocument = PDFKit.default
const registerStdFonts = (PDFKit as unknown as { registerStdFonts?: (...fonts: unknown[]) => void }).registerStdFonts
if (registerStdFonts) {
  registerStdFonts(Helvetica)
}

function baixarArquivo(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function gerarNomeArquivo(data: Date): string {
  const yyyy = data.getFullYear()
  const mm = String(data.getMonth() + 1).padStart(2, '0')
  const dd = String(data.getDate()).padStart(2, '0')
  return `hemo-connect-privacidade-${yyyy}${mm}${dd}.pdf`
}

export async function downloadExportacaoTitularPdf(payload: ExportacaoTitular): Promise<void> {
  const fileName = gerarNomeArquivo(new Date())
  const titular = formatarDadosTitular(payload.titular)
  const consentimentos = formatarConsentimentos(payload.titular.consentimentos)

  await new Promise<void>((resolve) => {
    const doc = new PDFDocument({ margin: 48, size: 'A4' })
    const chunks: Uint8Array[] = []

    doc.on('data', (chunk: Uint8Array) => {
      chunks.push(chunk)
    })

    doc.fontSize(18).text('Hemo Connect - Direitos do Titular')
    doc.moveDown(0.5)
    doc.fontSize(11).fillColor('#4B5563').text(`Exportado em: ${formatarDataHora(payload.exportado_em)}`)
    doc.fillColor('#111827')
    doc.moveDown()

    doc.fontSize(14).text('Dados do titular')
    doc.moveDown(0.4)
    doc.fontSize(11)
    doc.text(`Nome: ${titular.nome}`)
    doc.text(`CPF: ${titular.cpf}`)
    doc.text(`E-mail: ${titular.email}`)
    doc.text(`Perfil: ${titular.perfil}`)
    doc.moveDown()

    doc.fontSize(14).text('Consentimentos')
    doc.moveDown(0.5)

    if (consentimentos.length === 0) {
      doc.fontSize(11).text('Nenhum consentimento registrado.')
    }

    consentimentos.forEach((item, index) => {
      doc.fontSize(11).text(`${index + 1}. Finalidade: ${item.finalidade}`)
      doc.text(`   Versao do termo: ${item.versaoTermo}`)
      doc.text(`   Base legal: ${item.baseLegal}`)
      doc.text(`   Status: ${item.status}`)
      doc.text(`   Concedido em: ${item.concedidoEm}`)
      doc.text(`   Revogado em: ${item.revogadoEm}`)
      doc.moveDown(0.5)
    })

    doc.on('end', () => {
      const blob = new Blob(chunks, { type: 'application/pdf' })
      baixarArquivo(blob, fileName)
      resolve()
    })

    doc.end()
  })
}