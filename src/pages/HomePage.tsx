interface HomePageProps {
  nome: string
  onEntrar: () => void
}

// A landing page funciona como a primeira tela pública do produto, com foco em apresentar a marca e conduzir o acesso ao login.
export function HomePage({ nome, onEntrar }: HomePageProps) {
  const primeiroNome = (nome || 'Visitante').split(' ')[0] || 'Visitante'

  return (
    <section className="home-landing" aria-labelledby="welcome-title">
      <div className="home-brand">Hemo Connect</div>

      <h1 id="welcome-title">Olá, {primeiroNome}.</h1>

      <p className="description home-description">
        A sua jornada de doação começa aqui. Acompanhe agendamentos, veja seu histórico e mantenha seu perfil sempre atualizado.
      </p>

      <div className="home-actions">
        <button type="button" className="primary-button home-enter-button" onClick={onEntrar}>
          Entrar
        </button>
      </div>
    </section>
  )
}
