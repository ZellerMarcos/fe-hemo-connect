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
    <section className="profile-shell" aria-labelledby="meu-perfil-title">
      <header className="profile-header">
        <div>
          <p className="eyebrow">Meu Perfil</p>
          <h1 id="meu-perfil-title">Dados e Privacidade</h1>
          <p className="description">Consulte seus dados de conta e gerencie seus direitos do titular no mesmo lugar.</p>
        </div>
      </header>

      <article className="profile-card" aria-label="Resumo da conta">
        <h2>Resumo da conta</h2>
        <dl className="profile-data-list">
          <div className="profile-data-row">
            <dt>Nome</dt>
            <dd>{usuario.nome}</dd>
          </div>
          <div className="profile-data-row">
            <dt>E-mail</dt>
            <dd>{usuario.email}</dd>
          </div>
          <div className="profile-data-row">
            <dt>Perfil</dt>
            <dd>{usuario.perfil}</dd>
          </div>
        </dl>
      </article>

      <div className="profile-privacy">
        <Privacidade email={usuario.email} onContaRemovida={onContaRemovida} embedded />
      </div>

      <footer className="profile-footer">
        <button className="text-button" type="button" onClick={onVoltarHome}>Voltar para Home</button>
      </footer>
    </section>
  )
}
