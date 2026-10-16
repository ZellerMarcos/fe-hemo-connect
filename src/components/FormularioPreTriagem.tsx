import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { PrivacyPolicyModal } from './PrivacyPolicyModal'
import { Button } from './ui/button'
import { erroResposta, limparRespostasOcultas, perguntasVisiveis } from '../services/questionario'
import type { CatalogoPreTriagem, RespostasQuestionario } from '../types/questionario'

interface Props {
  catalogo: CatalogoPreTriagem
  respostas: RespostasQuestionario
  confirmacoes: string[]
  onRespostas: (respostas: RespostasQuestionario) => void
  onConfirmacoes: (confirmacoes: string[]) => void
  disabled: boolean
}

export interface FormularioPreTriagemHandle {
  validar: () => boolean
}

const controle = 'min-h-11 w-full min-w-0 rounded-xl border border-red-200 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
const selecao = 'size-5 shrink-0 accent-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'

export const FormularioPreTriagem = forwardRef<FormularioPreTriagemHandle, Props>(function FormularioPreTriagem(
  { catalogo, respostas, confirmacoes, onRespostas, onConfirmacoes, disabled }, ref,
) {
  const [tentouValidar, setTentouValidar] = useState(false)
  const [politicaAberta, setPoliticaAberta] = useState(false)
  const [politicaLida, setPoliticaLida] = useState(false)
  const raiz = useRef<HTMLElement>(null)
  const visiveis = perguntasVisiveis(catalogo, respostas)
  const obrigatorias = visiveis.filter(item => item.obrigatoria)
  const concluidas = obrigatorias.filter(item => !erroResposta(item, respostas[item.id])).length
  const confirmadas = catalogo.confirmacoes.filter(item => confirmacoes.includes(item.id)).length
  const erros = [
    ...visiveis.flatMap(item => {
      const erro = erroResposta(item, respostas[item.id])
      return erro ? [{ chave: `pergunta-${item.id}`, texto: erro }] : []
    }),
    ...catalogo.confirmacoes.filter(item => !confirmacoes.includes(item.id))
      .map(item => ({ chave: `confirmacao-${item.id}`, texto: 'Marque esta confirmação para continuar.' })),
  ]

  useImperativeHandle(ref, () => ({
    validar() {
      setTentouValidar(true)
      if (!erros.length) return true
      requestAnimationFrame(() => {
        const primeiro = raiz.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        primeiro?.focus()
        primeiro?.scrollIntoView({ block: 'center' })
      })
      return false
    },
  }))

  function alterar(id: string, valores: string[]) {
    onRespostas(limparRespostasOcultas(catalogo, { ...respostas, [id]: valores }))
  }

  return <>
    <section ref={raiz} aria-labelledby="formulario-pre-triagem-title"
      className="min-w-0 space-y-4 rounded-xl border border-red-200 p-4">
      <div>
        <h2 id="formulario-pre-triagem-title" className="font-semibold">
          Formulario Pre Triagem <span className="text-sm text-red-800">— Obrigatório</span>
        </h2>
        <p className="text-sm">{concluidas} de {obrigatorias.length} perguntas obrigatórias respondidas · {confirmadas} de {catalogo.confirmacoes.length} confirmações</p>
      </div>
      <progress className="w-full accent-red-700" aria-label="Progresso da pré-triagem"
        value={concluidas + confirmadas} max={Math.max(1, obrigatorias.length + catalogo.confirmacoes.length)} />
      <div className="space-y-5 pt-4">
        <p className="whitespace-pre-wrap">{catalogo.aviso}</p>
        <p className="text-sm">As respostas não decidem sua aptidão para doar. A avaliação é presencial no hemocentro. Informe à equipe qualquer mudança de saúde até o atendimento.</p>
        <Button variant="secondary" onClick={() => setPoliticaAberta(true)}>Consultar política de privacidade</Button>
        {tentouValidar && erros.length > 0 && <p role="alert" className="text-red-800">Há {erros.length} pendência(s). Confira os campos indicados.</p>}
        <fieldset disabled={disabled} className="min-w-0 space-y-6">
          <legend className="sr-only">Perguntas e confirmações de pré-triagem</legend>
          {(['geral', 'confidencial'] as const).map(secao => <section key={secao} aria-labelledby={`secao-${secao}`} className="min-w-0 space-y-4">
            <h3 id={`secao-${secao}`} className="font-semibold">{secao === 'geral' ? 'Saúde e histórico' : 'Informações confidenciais'}</h3>
            {secao === 'confidencial' && <p className="text-sm">Nas alternativas previstas, você pode preferir conversar com o profissional, sem impedir a reserva.</p>}
            {visiveis.filter(item => item.secao === secao).map(pergunta => {
              const id = `pergunta-${pergunta.id}`
              const valores = respostas[pergunta.id] ?? []
              const erro = tentouValidar ? erros.find(item => item.chave === id)?.texto : undefined
              const desconhecido = valores[0] === 'desconhecido'
              const atributos = { 'aria-invalid': erro ? true as const : undefined, 'aria-describedby': erro ? `${id}-erro` : undefined }
              return <fieldset key={pergunta.id} className="min-w-0 space-y-2 rounded-lg bg-rose-50 p-3">
                <legend id={`${id}-rotulo`} className="font-medium">{pergunta.texto} <span className="text-sm">({pergunta.obrigatoria ? 'Obrigatória' : 'Opcional'})</span></legend>
                {pergunta.tipo === 'escolha' || pergunta.tipo === 'multipla'
                  ? pergunta.opcoes.map((opcao, index) => <label key={opcao.valor} className="flex min-h-11 items-center gap-3">
                    <input id={index === 0 ? id : `${id}-${index}`} className={selecao}
                      type={pergunta.tipo === 'multipla' ? 'checkbox' : 'radio'} name={id} value={opcao.valor}
                      checked={valores.includes(opcao.valor)} {...atributos}
                      onChange={event => {
                        if (pergunta.tipo === 'escolha') alterar(pergunta.id, [opcao.valor])
                        else if (!event.target.checked) alterar(pergunta.id, valores.filter(valor => valor !== opcao.valor))
                        else if (['nenhum', 'desconhecido', 'reservado'].includes(opcao.valor)) alterar(pergunta.id, [opcao.valor])
                        else alterar(pergunta.id, [...valores.filter(valor => !['nenhum', 'desconhecido', 'reservado'].includes(valor)), opcao.valor])
                      }} />{opcao.rotulo}
                  </label>)
                  : <>
                    {pergunta.tipo === 'texto'
                      ? <textarea id={id} className={controle} maxLength={2000} value={valores[0] ?? ''}
                        aria-labelledby={`${id}-rotulo`} {...atributos} onChange={event => alterar(pergunta.id, event.target.value ? [event.target.value] : [])} />
                      : <input id={id} className={controle} type={pergunta.tipo === 'data' ? 'date' : 'number'}
                        min={pergunta.tipo === 'numero' ? '0' : undefined}
                        max={pergunta.tipo === 'numero' ? '999.9' : new Date().toISOString().slice(0, 10)}
                        step={pergunta.tipo === 'numero' ? 'any' : undefined}
                        disabled={desconhecido} value={desconhecido ? '' : valores[0] ?? ''}
                        aria-labelledby={`${id}-rotulo`} {...atributos}
                        onChange={event => alterar(pergunta.id, event.target.value ? [event.target.value] : [])} />}
                    {(pergunta.tipo === 'numero' || pergunta.tipo === 'data') && <label className="flex min-h-11 items-center gap-3">
                      <input className={selecao} type="checkbox" checked={desconhecido} {...atributos}
                        onChange={event => alterar(pergunta.id, event.target.checked ? ['desconhecido'] : [])} />Não sei informar
                    </label>}
                  </>}
                {erro && <p id={`${id}-erro`} className="text-sm text-red-800">{erro}</p>}
              </fieldset>
            })}
          </section>)}
          <fieldset className="space-y-3">
            <legend className="font-semibold">Confirmações obrigatórias</legend>
            {catalogo.confirmacoes.map(item => {
              const id = `confirmacao-${item.id}`
              const erro = tentouValidar ? erros.find(erro => erro.chave === id)?.texto : undefined
              return <div key={item.id}>
                <label className="flex min-h-11 items-center gap-3">
                  <input id={id} className={selecao} type="checkbox" checked={confirmacoes.includes(item.id)}
                    aria-invalid={erro ? true : undefined} aria-describedby={erro ? `${id}-erro` : undefined}
                    onChange={event => onConfirmacoes(event.target.checked ? [...confirmacoes, item.id] : confirmacoes.filter(valor => valor !== item.id))} />
                  {item.texto}
                </label>
                {erro && <p id={`${id}-erro`} className="text-sm text-red-800">{erro}</p>}
              </div>
            })}
          </fieldset>
        </fieldset>
      </div>
    </section>
    <PrivacyPolicyModal open={politicaAberta} onClose={() => setPoliticaAberta(false)}
      readComplete={politicaLida} onReadComplete={() => setPoliticaLida(true)} />
  </>
})
