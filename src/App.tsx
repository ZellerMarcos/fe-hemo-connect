import { useState } from 'react'
import { Cadastro } from './pages/Cadastro'
import { Login } from './pages/Login'
import type { LoginResponse } from './types/auth'

type View = 'login' | 'cadastro' | 'home'

function App() {
  const [view, setView] = useState<View>('login')
  const [usuario, setUsuario] = useState<LoginResponse | null>(null)

  if (view === 'cadastro') {
    return (
      <main className="page-shell">
        <Cadastro onCadastroSucesso={() => setView('login')} onIrParaLogin={() => setView('login')} />
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
      <Login onLoginSucesso={(loggedUser) => { setUsuario(loggedUser); setView('home') }} onIrParaCadastro={() => setView('cadastro')} />
    </main>
  )
}

export default App
