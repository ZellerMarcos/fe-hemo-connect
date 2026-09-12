import ExcelJS from 'exceljs'

import type { ExportacaoTitular } from '../types/privacidade'
import { formatarConsentimentos, formatarDadosTitular, formatarDataHora } from './privacyFormatters'

function baixarArquivo(buffer: BlobPart, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
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
  return `hemo-connect-privacidade-${yyyy}${mm}${dd}.xlsx`
}

export async function downloadExportacaoTitularExcel(payload: ExportacaoTitular): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hemo Connect'
  workbook.created = new Date()

  const titularSheet = workbook.addWorksheet('Dados do Titular')
  const titular = formatarDadosTitular(payload.titular)

  titularSheet.columns = [
    { header: 'Campo', key: 'campo', width: 28 },
    { header: 'Valor', key: 'valor', width: 52 },
  ]

  titularSheet.addRows([
    { campo: 'Nome', valor: titular.nome },
    { campo: 'CPF', valor: titular.cpf },
    { campo: 'E-mail', valor: titular.email },
    { campo: 'Perfil', valor: titular.perfil },
    { campo: 'Exportado em', valor: formatarDataHora(payload.exportado_em) },
  ])

  titularSheet.getRow(1).font = { bold: true }

  const consentimentosSheet = workbook.addWorksheet('Consentimentos')
  const consentimentos = formatarConsentimentos(payload.titular.consentimentos)

  consentimentosSheet.columns = [
    { header: 'Finalidade', key: 'finalidade', width: 24 },
    { header: 'Versao do termo', key: 'versaoTermo', width: 18 },
    { header: 'Base legal', key: 'baseLegal', width: 42 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Concedido em', key: 'concedidoEm', width: 20 },
    { header: 'Revogado em', key: 'revogadoEm', width: 20 },
  ]

  consentimentosSheet.addRows(consentimentos)
  consentimentosSheet.getRow(1).font = { bold: true }

  const fileName = gerarNomeArquivo(new Date())
  const buffer = await workbook.xlsx.writeBuffer()
  baixarArquivo(buffer, fileName)
}
