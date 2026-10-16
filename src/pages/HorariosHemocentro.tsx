import { useParams, useNavigate } from 'react-router-dom'

import { SeletorHorario } from '../components/SeletorHorario'
import { Button } from '../components/ui/button'

export function HorariosHemocentro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const centroId = Number(id)
  if (!Number.isSafeInteger(centroId) || centroId <= 0) return <p role="alert">Identificador de hemocentro inválido.</p>
  return <div className="space-y-5">
    <p className="text-zinc-600">Consulta de vagas da unidade {centroId}. A disponibilidade pode mudar até a confirmação da reserva.</p>
    <SeletorHorario centroId={centroId} />
    <Button variant="ghost" onClick={() => navigate('/home')}>Voltar para o painel</Button>
  </div>
}
