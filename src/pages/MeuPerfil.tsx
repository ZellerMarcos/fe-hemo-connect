import { UserRound } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '../components/ui/button'
import { Privacidade } from './Privacidade'
import type { LoginUserResponse } from '../types/auth'

interface MeuPerfilProps {
  usuario: LoginUserResponse
  onVoltarHome: () => void
  onContaRemovida: () => void
}

// Consolida dados de perfil e direitos do titular no mesmo fluxo de autoatendimento.
export function MeuPerfil({ usuario, onVoltarHome, onContaRemovida }: MeuPerfilProps) {
  return (
    <section className="w-full max-w-5xl" aria-labelledby="meu-perfil-title">
      <header className="rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg shadow-red-100/30 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Meu Perfil</p>
            <h1 id="meu-perfil-title" className="mt-3 text-3xl font-semibold text-zinc-900 md:text-4xl">Dados e Privacidade</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">Consulte seus dados de conta e gerencie seus direitos do titular no mesmo lugar.</p>
          </div>
          <span className="hidden rounded-xl bg-red-50 p-2 text-red-700 md:inline-flex">
            <UserRound size={20} />
          </span>
        </div>
      </header>

      <motion.article
        aria-label="Resumo da conta"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="mt-4 rounded-2xl border border-red-100 bg-white/90 p-6 shadow-lg shadow-red-100/20"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Resumo da conta</h2>
        <dl className="mt-4 grid gap-2 text-sm md:grid-cols-[120px_1fr] md:text-base">
          <dt className="font-semibold text-red-800">Nome</dt>
          <dd className="text-zinc-700">{usuario.nome}</dd>
          <dt className="font-semibold text-red-800">E-mail</dt>
          <dd className="text-zinc-700">{usuario.email}</dd>
          <dt className="font-semibold text-red-800">Perfil</dt>
          <dd className="text-zinc-700">{usuario.perfil}</dd>
        </dl>
      </motion.article>

      <div className="mt-4 rounded-2xl border border-red-100 bg-white/90 p-3 shadow-lg shadow-red-100/20 md:p-4">
        <Privacidade email={usuario.email} onContaRemovida={onContaRemovida} embedded />
      </div>

      <footer className="mt-3 flex justify-end">
        <Button variant="ghost" onClick={onVoltarHome}>Voltar para Home</Button>
      </footer>
    </section>
  )
}
