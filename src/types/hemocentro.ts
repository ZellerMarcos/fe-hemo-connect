export type HemocentroStatus = 'ATIVO' | 'INATIVO'

export interface HemocentroCreate {
  nome: string
  endereco: string
  telefone: string
  status: HemocentroStatus
}

export interface Hemocentro extends HemocentroCreate {
  id: number
}
