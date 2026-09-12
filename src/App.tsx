import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Cadastro } from './pages/Cadastro'
import { ForgotPassword } from './pages/ForgotPassword'
import { Login } from './pages/Login'
import { MeuPerfil } from './pages/MeuPerfil'
import { ResetPassword } from './pages/ResetPassword'
import { TwoFactor } from './pages/TwoFactor'
import type { LoginUserResponse } from './types/auth'

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessao expirou, realize novamente seu login'

function AuthenticatedHome({
  usuario,
  onAbrirPerfil,
}: {
  usuario: LoginUserResponse
  onAbrirPerfil: () => void
}) {
  return (
    <main className="app-shell" aria-labelledby="welcome-title">
      <header className="app-header">
        <div>
          <p className="eyebrow">Hemo Connect</p>
          <h1 id="welcome-title">Olá, {usuario.nome.split(' ')[0]}.</h1>
        </div>
        <div className="user-pill">{usuario.email}</div>
      </header>

      <section className="home-hero">
        <p className="description">
          Centralize suas próximas ações de doação, acompanhe seus dados e acesse os direitos do titular no mesmo fluxo.
        </p>
        <button type="button" className="primary-button" onClick={onAbrirPerfil}>
          Meu Perfil e Privacidade
        </button>
      </section>

      <section className="home-grid" aria-label="Atalhos do doador">
        <button type="button" className="dashboard-card dashboard-card--primary">
          <span className="card-title">Marcar doacao</span>
          <span className="card-description">Agende sua próxima doação e escolha a melhor janela de horário.</span>
        </button>

        <button type="button" className="dashboard-card dashboard-card--sand" onClick={onAbrirPerfil}>
          <span className="card-title">Meu Perfil</span>
          <span className="card-description">Consulte seus dados e a área de direitos do titular em uma única tela.</span>
        </button>

        <button type="button" className="dashboard-card dashboard-card--rose">
          <span className="card-title">Historico de Doacoes</span>
          <span className="card-description">Acompanhe as doações realizadas e sua evolução como doador.</span>
        </button>

        <button type="button" className="dashboard-card dashboard-card--neutral">
          <span className="card-title">Hemocentros</span>
          <span className="card-description">Visualize unidades, endereços e horários de atendimento.</span>
        </button>
      </section>

      <footer className="app-footer">
        <span>Hemo Connect</span>
        <span>Doacao segura, dados sob controle</span>
      </footer>
    </main>
  )
}

function ResetPasswordEntry() {
  const location = useLocation()
  const token = new URLSearchParams(location.search).get('token')

  if (token) {
    return <Navigate to={`/reset-password${location.search}`} replace />
  }

  return <Navigate to="/login" replace />
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [usuario, setUsuario] = useState<LoginUserResponse | null>(null)
  const [twoFactorEmail, setTwoFactorEmail] = useState('')
  const [mensagemSessaoExpirada, setMensagemSessaoExpirada] = useState('')

  useEffect(() => {
    const handleSessionExpired = () => {
      if (location.pathname === '/reset-password' || location.pathname === '/forgot-password') return
      setUsuario(null)
      setTwoFactorEmail('')
      setMensagemSessaoExpirada(MENSAGEM_SESSAO_EXPIRADA)
      navigate('/login', { replace: true })
    }

    window.addEventListener('session-expired', handleSessionExpired)
    return () => window.removeEventListener('session-expired', handleSessionExpired)
  }, [location.pathname, navigate])

  function handleLoginSucesso(loggedUser: LoginUserResponse) {
    setMensagemSessaoExpirada('')
    setUsuario(loggedUser)
    navigate('/home', { replace: true })
  }

  function handleTwoFactorSuccess() {
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
    navigate('/home', { replace: true })
  }

  return (
    <Routes>
      <Route path="/login" element={<main className="page-shell"><Login onLoginSucesso={handleLoginSucesso} onTwoFactor={(email) => { setTwoFactorEmail(email); navigate('/two-factor') }} onIrParaCadastro={() => navigate('/cadastro')} onEsqueciSenha={() => navigate('/forgot-password')} mensagemSessaoExpirada={mensagemSessaoExpirada} /></main>} />
      <Route path="/forgot-password" element={<main className="page-shell"><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></main>} />
      <Route path="/auth/forgot-password" element={<main className="page-shell"><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></main>} />
      <Route path="/reset-password" element={<main className="page-shell"><ResetPassword token={new URLSearchParams(location.search).get('token') ?? ''} onVoltarAoLogin={() => navigate('/login')} /></main>} />
      <Route path="/cadastro" element={<main className="page-shell"><Cadastro onCadastroSucesso={() => navigate('/login')} onIrParaLogin={() => navigate('/login')} /></main>} />
      <Route path="/two-factor" element={<main className="page-shell"><TwoFactor email={twoFactorEmail} onSucesso={handleTwoFactorSuccess} onVoltar={() => { setTwoFactorEmail(''); navigate('/login') }} /></main>} />
      <Route path="/index.html" element={<ResetPasswordEntry />} />
      <Route path="/home" element={usuario ? <AuthenticatedHome usuario={usuario} onAbrirPerfil={() => navigate('/perfil')} /> : <Navigate to="/login" replace />} />
      <Route path="/perfil" element={usuario ? <main className="page-shell"><MeuPerfil usuario={usuario} onVoltarHome={() => navigate('/home')} onContaRemovida={() => { setUsuario(null); navigate('/login', { replace: true }) }} /></main> : <Navigate to="/login" replace />} />
      {/* Rota protegida da central de privacidade; sem sessao ativa redireciona para login. */}
      <Route path="/privacidade" element={usuario ? <Navigate to="/perfil" replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
