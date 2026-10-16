import type { AgendaConfig, PeriodoAgenda } from '../types/agenda'

const LIMITES_NUMERICOS: Array<{
  campo: keyof Pick<
    AgendaConfig,
    'duracao_minutos' | 'capacidade' | 'antecedencia_minutos' | 'horizonte_dias' | 'cancelamento_minutos' | 'remarcacao_minutos'
  >
  minimo: number
  maximo: number
  rotulo: string
}> = [
  { campo: 'duracao_minutos', minimo: 5, maximo: 240, rotulo: 'Duração de cada horário' },
  { campo: 'capacidade', minimo: 1, maximo: 1000, rotulo: 'Vagas por horário' },
  { campo: 'antecedencia_minutos', minimo: 0, maximo: 10080, rotulo: 'Antecedência mínima para reservar' },
  { campo: 'horizonte_dias', minimo: 1, maximo: 180, rotulo: 'Horizonte de reservas' },
  { campo: 'cancelamento_minutos', minimo: 0, maximo: 10080, rotulo: 'Antecedência para cancelar' },
  { campo: 'remarcacao_minutos', minimo: 0, maximo: 10080, rotulo: 'Antecedência para remarcar' },
]

function minutosDoDia(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function dataValida(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, year, month, day] = match
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return parsed.getUTCFullYear() === Number(year)
    && parsed.getUTCMonth() === Number(month) - 1
    && parsed.getUTCDate() === Number(day)
}

function validarPeriodos(periodos: PeriodoAgenda[], duracao: number, rotulo: string): string[] {
  const errors: string[] = []
  const ordered = periodos
    .map((periodo, index) => ({
      periodo,
      index,
      inicio: minutosDoDia(periodo.inicio),
      fim: minutosDoDia(periodo.fim),
    }))
    .sort((a, b) => (a.inicio ?? -1) - (b.inicio ?? -1))

  for (const item of ordered) {
    const nome = `${rotulo} ${item.index + 1}`
    if (item.inicio === null || item.fim === null) {
      errors.push(`${nome}: informe horários válidos no formato HH:MM.`)
      continue
    }
    if (item.inicio >= item.fim) {
      errors.push(`${nome}: o fim deve ser posterior ao início no mesmo dia.`)
      continue
    }
    if ((item.fim - item.inicio) % duracao !== 0) {
      errors.push(`${nome}: o período deve conter um número inteiro de horários de ${duracao} minutos.`)
    }
  }

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]
    const current = ordered[index]
    if (previous.fim !== null && current.inicio !== null && previous.fim > current.inicio) {
      errors.push(`${rotulo}: os períodos não podem se sobrepor.`)
      break
    }
  }

  return errors
}

export function validarAgendaConfig(config: AgendaConfig): string[] {
  const errors: string[] = []

  for (const limite of LIMITES_NUMERICOS) {
    const value = config[limite.campo]
    if (!Number.isInteger(value) || value < limite.minimo || value > limite.maximo) {
      errors.push(`${limite.rotulo}: informe um número inteiro entre ${limite.minimo} e ${limite.maximo}.`)
    }
  }

  if (!config.fuso_horario || config.fuso_horario.length > 100) {
    errors.push('Informe um fuso horário IANA válido.')
  } else {
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: config.fuso_horario })
    } catch {
      errors.push('Informe um fuso horário IANA válido.')
    }
  }

  if (config.periodos.length < 1 || config.periodos.length > 28) {
    errors.push('Cadastre de 1 a 28 períodos semanais.')
  }

  for (const [index, periodo] of config.periodos.entries()) {
    if (!Number.isInteger(periodo.dia_semana) || periodo.dia_semana < 0 || periodo.dia_semana > 6) {
      errors.push(`Período semanal ${index + 1}: selecione um dia da semana válido.`)
    }
  }

  if (Number.isInteger(config.duracao_minutos) && config.duracao_minutos > 0) {
    for (let day = 0; day <= 6; day += 1) {
      const periods = config.periodos.filter(periodo => periodo.dia_semana === day)
      errors.push(...validarPeriodos(periods, config.duracao_minutos, `Período de ${['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'][day]}`))
    }

    for (const [index, exception] of config.excecoes.entries()) {
      if (exception.periodos.length > 4) {
        errors.push(`Exceção ${index + 1}: cadastre no máximo 4 períodos.`)
      }
      errors.push(...validarPeriodos(exception.periodos, config.duracao_minutos, `Período da exceção ${index + 1}`))
    }
  }

  if (config.excecoes.length > 366) {
    errors.push('Cadastre no máximo 366 feriados ou exceções.')
  }

  const dates = new Set<string>()
  for (const [index, exception] of config.excecoes.entries()) {
    if (!dataValida(exception.data)) {
      errors.push(`Exceção ${index + 1}: informe uma data válida.`)
      continue
    }
    if (dates.has(exception.data)) {
      errors.push(`A data ${exception.data} está repetida nas exceções.`)
    }
    dates.add(exception.data)
  }

  return errors
}
