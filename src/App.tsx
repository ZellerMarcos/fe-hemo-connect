import { useEffect, useState } from 'react'
import { Cadastro } from './pages/Cadastro'
import { Login } from './pages/Login'
import { TwoFactor } from './pages/TwoFactor'
import type { LoginUserResponse } from './types/auth'

type View = 'login' | 'cadastro' | 'two-factor' | 'home'

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessao expirou, realize novamente seu login'

function App() {
  const [view, setView] = useState<View>('login')
  const [usuario, setUsuario] = useState<LoginUserResponse | null>(null)
  // O e-mail pendente vive apenas durante o fluxo atual; não é uma credencial.
  const [twoFactorEmail, setTwoFactorEmail] = useState('')
  const [mensagemSessaoExpirada, setMensagemSessaoExpirada] = useState('')

  useEffect(() => {
    const handleSessionExpired = () => {
      setUsuario(null)
      setTwoFactorEmail('')
      setMensagemSessaoExpirada(MENSAGEM_SESSAO_EXPIRADA)
      setView('login')
    }

    window.addEventListener('session-expired', handleSessionExpired)
    return () => window.removeEventListener('session-expired', handleSessionExpired)
  }, [])

  function handleLoginSucesso(loggedUser: LoginUserResponse) {
    setMensagemSessaoExpirada('')
    setUsuario(loggedUser)
    setView('home')
  }

  if (view === 'cadastro') {
    return (
      <main className="page-shell">
        <Cadastro onCadastroSucesso={() => setView('login')} onIrParaLogin={() => setView('login')} />
      </main>
    )
  }

  if (view === 'two-factor') {
    return (
      <main className="page-shell">
        <TwoFactor
          email={twoFactorEmail}
          onSucesso={() => {
            const nome = twoFactorEmail.split('@')[0] || 'Usuário'
            setMensagemSessaoExpirada('')
            setUsuario({
              id: 0,
              nome,
              email: twoFactorEmail,
              perfil: 'DOADOR',
              status: 'ATIVO',
              hemocentro_id: null,
            })
            setView('home')
          }}
          onVoltar={() => { setTwoFactorEmail(''); setView('login') }}
        />
      </main>
    )
  }

  if (view === 'home' && usuario) {
    return (
      <main className="page-shell">
        <section className="welcome-panel dashboard-panel" aria-labelledby="welcome-title">
          <p className="eyebrow">Hemo Connect</p>
          <h1 id="welcome-title">Olá, {usuario.nome.split(' ')[0]}.</h1>
          <p className="description">Sua área de doador está pronta para os próximos passos.</p>

          <div className="dashboard-grid">
            <button type="button" className="dashboard-card">
              <span className="card-title">Marcar doacao</span>
              <span className="card-description">Agende sua próxima doação.</span>
            </button>
            <button type="button" className="dashboard-card">
              <span className="card-title">Meu Perfil</span>
              <span className="card-description">Visualize e atualize seus dados.</span>
            </button>
            <button type="button" className="dashboard-card">
              <span className="card-title">Histórico de Doacoes</span>
              <span className="card-description">Acompanhe suas contribuições.</span>
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <Login
        onLoginSucesso={handleLoginSucesso}
        onTwoFactor={(email) => { setTwoFactorEmail(email); setView('two-factor') }}
        onIrParaCadastro={() => setView('cadastro')}
        mensagemSessaoExpirada={mensagemSessaoExpirada}
      />
    </main>
  )
}

export default App
