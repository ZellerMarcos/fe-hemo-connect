import { useEffect, useRef } from 'react'

import { Button } from './ui/button'

interface ConfirmarCancelamentoModalProps {
  dataReserva: string
  ocupado: boolean
  onConfirmar: () => void
  onFechar: () => void
}

export function ConfirmarCancelamentoModal({
  dataReserva,
  ocupado,
  onConfirmar,
  onFechar,
}: ConfirmarCancelamentoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  function fecharSePossivel() {
    if (!ocupado) onFechar()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cancelar-reserva-title"
      aria-describedby="cancelar-reserva-description"
      onCancel={event => {
        event.preventDefault()
        fecharSePossivel()
      }}
      onClick={event => {
        if (event.target === event.currentTarget) fecharSePossivel()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/60"
    >
      <section className="space-y-5 p-5 sm:p-6">
        <header className="space-y-2">
          <h2 id="cancelar-reserva-title" className="text-xl font-semibold">Cancelar esta reserva?</h2>
          <p id="cancelar-reserva-description" className="text-sm leading-relaxed text-zinc-700">
            Você está prestes a cancelar a reserva de <strong>{dataReserva}</strong>.
            A vaga será liberada para outra pessoa, mas o registro da reserva será preservado.
          </p>
        </header>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={ocupado} onClick={onFechar}>
            Manter reserva
          </Button>
          <Button type="button" disabled={ocupado} onClick={onConfirmar}>
            {ocupado ? 'Cancelando...' : 'Confirmar cancelamento'}
          </Button>
        </div>
      </section>
    </dialog>
  )
}
