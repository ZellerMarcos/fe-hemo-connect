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
  aviso: string
  confirmacoes: { id: string; texto: string }[]
  perguntas: Pergunta[]
}

export type RespostasQuestionario = Record<string, string[]>

export interface UltimoQuestionario {
  encontrado: boolean
  compativel: boolean
  versao: string | null
  versao_aviso: string | null
  enviado_em: string | null
  respostas: { id: string; valores: string[] }[]
}

export interface QuestionarioEnvio {
  versao: string
  versao_aviso: string
  respostas: { id: string; valores: string[] }[]
  confirmacoes: string[]
}
