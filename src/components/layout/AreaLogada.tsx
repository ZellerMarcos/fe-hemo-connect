import type { ReactNode } from 'react'

import { Button } from '../ui/button'
import { BrandLogo } from '../BrandLogo'
import type { LoginUserResponse } from '../../types/auth'

interface Props {
  usuario: LoginUserResponse
  titulo: string
  children: ReactNode
  onPerfil: () => void
  onSair: () => void
  onAprovacoes?: () => void
  onHemocentros?: () => void
  onAgenda?: () => void
}

export function AreaLogada({ usuario, titulo, children, onPerfil, onSair, onAprovacoes, onHemocentros, onAgenda }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-red-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5 rounded-2xl border border-red-100 bg-white/95 p-5 shadow-xl md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-red-100 pb-4">
          <div className="min-w-0 w-full md:w-auto">
            <BrandLogo compact />
            <h1 className="mt-2 text-3xl font-semibold">{titulo}</h1>
            <p className="mt-2 text-zinc-600">Olá, {usuario.nome}.</p>
          </div>
          <nav aria-label="Conta" className="flex flex-wrap gap-2">
            {['ADMINISTRADOR', 'RESPONSAVEL_HEMOCENTRO'].includes(usuario.perfil) && onAgenda && <Button variant="secondary" onClick={onAgenda}>Gerenciar agendas</Button>}
            {['ADMINISTRADOR', 'ENFERMEIRO'].includes(usuario.perfil) && onHemocentros && <Button variant="secondary" onClick={onHemocentros}>Hemocentros</Button>}
            {usuario.perfil === 'ADMINISTRADOR' && onAprovacoes && <Button variant="secondary" onClick={onAprovacoes}>Aprovar enfermeiros</Button>}
            <Button variant="secondary" onClick={onPerfil}>Meu perfil</Button>
            <Button variant="ghost" onClick={onSair}>Sair</Button>
          </nav>
        </header>
        {children}
      </div>
    </main>
  )
}
