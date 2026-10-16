import { request } from './api'
import type { CatalogoPreTriagem, Pergunta, QuestionarioEnvio, RespostasQuestionario, UltimoQuestionario } from '../types/questionario'

export function consultarQuestionario(signal?: AbortSignal) {
  return request<CatalogoPreTriagem>('/questionario-pre-triagem', { signal })
}

export function consultarUltimaResposta(hemocentroId: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ hemocentro_id: String(hemocentroId) })
  return request<UltimoQuestionario>(`/questionario-pre-triagem/ultima-resposta?${params}`, { signal })
}

export function perguntasVisiveis(catalogo: CatalogoPreTriagem, respostas: RespostasQuestionario): Pergunta[] {
  const perguntas = new Map(catalogo.perguntas.map(item => [item.id, item]))
  function visivel(pergunta: Pergunta, caminho: Set<string>): boolean {
    if (caminho.has(pergunta.id)) return false
    if (!pergunta.depende_de) return true
    const pai = perguntas.get(pergunta.depende_de.id)
    return !!pai && visivel(pai, new Set([...caminho, pergunta.id]))
      && (respostas[pai.id] ?? []).some(valor => pergunta.depende_de!.valores.includes(valor))
  }
  return catalogo.perguntas.filter(item => visivel(item, new Set()))
}

export function limparRespostasOcultas(catalogo: CatalogoPreTriagem, respostas: RespostasQuestionario): RespostasQuestionario {
  return Object.fromEntries(perguntasVisiveis(catalogo, respostas)
    .filter(item => respostas[item.id]?.length)
    .map(item => [item.id, respostas[item.id]]))
}

export function erroResposta(pergunta: Pergunta, valores: string[] = []): string | null {
  if (!valores.length || valores.every(valor => !valor.trim())) {
    return pergunta.obrigatoria ? 'Responda esta pergunta.' : null
  }
  if (pergunta.tipo !== 'multipla' && valores.length !== 1) return 'Informe apenas uma resposta.'
  if (pergunta.tipo === 'escolha' || pergunta.tipo === 'multipla') {
    if (valores.some(valor => !pergunta.opcoes.some(opcao => opcao.valor === valor))
      || new Set(valores).size !== valores.length) return 'Selecione uma alternativa válida.'
    if (valores.length > 1 && valores.some(valor => ['nenhum', 'desconhecido', 'reservado'].includes(valor))) {
      return 'Esta alternativa deve ser selecionada sozinha.'
    }
  }
  const valor = valores[0]
  if (pergunta.tipo === 'texto' && valor.length > 2000) return 'Use no máximo 2000 caracteres.'
  if (pergunta.tipo === 'numero' && valor !== 'desconhecido'
    && (!/^\d+(\.\d+)?$/.test(valor) || Number(valor) <= 0 || Number(valor) > 999.9)) {
    return 'Informe um número maior que zero e até 999,9, ou marque Não sei informar.'
  }
  if (pergunta.tipo === 'data' && valor !== 'desconhecido') {
    const data = new Date(`${valor}T00:00:00.000Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || !Number.isFinite(data.getTime())
      || data.toISOString().slice(0, 10) !== valor || valor > new Date().toISOString().slice(0, 10)) {
      return 'Informe uma data válida até hoje (UTC), ou marque Não sei informar.'
    }
  }
  return null
}

export function montarQuestionario(catalogo: CatalogoPreTriagem, respostas: RespostasQuestionario, confirmacoes: string[]): QuestionarioEnvio {
  return {
    versao: catalogo.versao,
    versao_aviso: catalogo.versao_aviso,
    respostas: perguntasVisiveis(catalogo, respostas)
      .filter(item => respostas[item.id]?.some(valor => valor.trim()))
      .map(item => ({
        id: item.id,
        valores: item.tipo === 'escolha' || item.tipo === 'multipla'
          ? item.opcoes.filter(opcao => respostas[item.id].includes(opcao.valor)).map(opcao => opcao.valor)
          : respostas[item.id].map(valor => valor.trim()),
      })),
    confirmacoes: catalogo.confirmacoes.filter(item => confirmacoes.includes(item.id)).map(item => item.id),
  }
}
