export interface Pergunta {
  id: string
  texto: string
  secao: 'geral' | 'confidencial'
  tipo: 'escolha' | 'numero' | 'texto' | 'data' | 'multipla'
  obrigatoria: boolean
  opcoes: { valor: string; rotulo: string }[]
  depende_de: { id: string; valores: string[] } | null
}

export interface CatalogoPreTriagem {
  versao: string
  versao_aviso: string
  publicado: boolean
  aviso: string
  confirmacoes: { id: string; texto: string }[]
  perguntas: Pergunta[]
}

export type RespostasQuestionario = Record<string, string[]>

export interface QuestionarioEnvio {
  versao: string
  versao_aviso: string
  respostas: { id: string; valores: string[] }[]
  confirmacoes: string[]
}
