import { useState } from 'react'
import { Cadastro } from './pages/Cadastro'
import { Login } from './pages/Login'
import { TwoFactor } from './pages/TwoFactor'
import type { LoginUserResponse } from './types/auth'

type View = 'login' | 'cadastro' | 'two-factor' | 'home'

function App() {
  const [view, setView] = useState<View>('login')
  const [usuario, setUsuario] = useState<LoginUserResponse | null>(null)
  // O e-mail pendente vive apenas durante o fluxo atual; não é uma credencial.
  const [twoFactorEmail, setTwoFactorEmail] = useState('')

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
          onSucesso={() => setView('home')}
          onVoltar={() => { setTwoFactorEmail(''); setView('login') }}
        />
      </main>
    )
  }

  if (view === 'home' && usuario) {
    return (
      <main className="page-shell">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <p className="eyebrow">Hemo Connect</p>
          <h1 id="welcome-title">Olá, {usuario.nome.split(' ')[0]}.</h1>
          <p className="description">Sua área de doador está pronta para os próximos passos.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <Login
        onLoginSucesso={(loggedUser) => { setUsuario(loggedUser); setView('home') }}
        onTwoFactor={(email) => { setTwoFactorEmail(email); setView('two-factor') }}
        onIrParaCadastro={() => setView('cadastro')}
      />
    </main>
  )
}

export default App
