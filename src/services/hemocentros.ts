import { request } from './api'
import type { Hemocentro, HemocentroCreate } from '../types/hemocentro'

export function listarHemocentros(signal?: AbortSignal) {
  return request<Hemocentro[]>('/hemocentros', { signal })
}

export function cadastrarHemocentro(data: HemocentroCreate) {
  return request<Hemocentro>('/hemocentros', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
