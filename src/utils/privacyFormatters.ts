import type { Consentimento, DadosTitular } from '../types/privacidade'

export interface DadosTitularFormatados {
  nome: string
  cpf: string
  email: string
  perfil: string
}

function somenteDigitos(value: string): string {
  return value.replace(/\D/g, '')
}

export function mascararCpf(cpf: string): string {
  const digitos = somenteDigitos(cpf)
  if (digitos.length !== 11) {
    return cpf
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
    .replace(/\d/g, '*')
}

export function formatarDataHora(value: string | null): string {
  if (!value) {
    return '-'
  }
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data)
}

export function formatarStatusConsentimento(concedido: boolean): string {
  return concedido ? 'Concedido' : 'Revogado'
}

export function formatarDadosTitular(dados: DadosTitular): DadosTitularFormatados {
  return {
    nome: dados.nome,
    cpf: mascararCpf(dados.cpf),
    email: dados.email,
    perfil: dados.perfil,
  }
}

export function formatarConsentimentos(consentimentos: Consentimento[]) {
  return consentimentos.map((item) => ({
    finalidade: item.finalidade,
    versaoTermo: item.versao_termo,
    baseLegal: item.base_legal,
    status: formatarStatusConsentimento(item.concedido),
    concedidoEm: formatarDataHora(item.concedido_em),
    revogadoEm: formatarDataHora(item.revogado_em),
  }))
}
