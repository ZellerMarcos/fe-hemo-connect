interface CentralDoDoadorProps {
  nome: string
}

// Os atalhos da central agrupam as ações mais recorrentes do doador em um painel rápido e visualmente consistente.
const atalhos = [
  {
    titulo: 'Agendar doação',
    descricao: 'Planeje sua próxima doação com praticidade e segurança.',
    accent: 'primary',
  },
  {
    titulo: 'Meu histórico',
    descricao: 'Acompanhe suas doações anteriores e evolução contínua.',
    accent: 'rose',
  },
  {
    titulo: 'Perfil do doador',
    descricao: 'Atualize seus dados e mantenha seu cadastro sempre em dia.',
    accent: 'sand',
  },
  {
    titulo: 'Hemocentros',
    descricao: 'Consulte unidades, horários e pontos de atendimento próximos de você.',
    accent: 'neutral',
  },
]

// A central do doador consolida a área logada do sistema e favorece navegação rápida por tarefas do cotidiano.
export function CentralDoDoador({ nome }: CentralDoDoadorProps) {
  return (
    <section className="dashboard-shell" aria-labelledby="central-title">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Hemo Connect</p>
          <h1 id="central-title">Central do Doador</h1>
        </div>
        <div className="user-pill">Olá, {nome}</div>
      </header>

      <div className="dashboard-grid">
        {atalhos.map((item) => (
          <button key={item.titulo} type="button" className={`dashboard-card dashboard-card--${item.accent}`}>
            <span className="card-title">{item.titulo}</span>
            <span className="card-description">{item.descricao}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
