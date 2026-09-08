import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Cadastro } from './pages/Cadastro'
import { ForgotPassword } from './pages/ForgotPassword'
import { Login } from './pages/Login'
import { ResetPassword } from './pages/ResetPassword'
import { TwoFactor } from './pages/TwoFactor'
import type { LoginUserResponse } from './types/auth'

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessao expirou, realize novamente seu login'

function AuthenticatedHome({ usuario }: { usuario: LoginUserResponse }) {
  return (
    <main className="page-shell">
      <section className="welcome-panel dashboard-panel" aria-labelledby="welcome-title">
        <p className="eyebrow">Hemo Connect</p>
        <h1 id="welcome-title">Olá, {usuario.nome.split(' ')[0]}.</h1>
        <p className="description">Sua área de doador está pronta para os próximos passos.</p>
        <div className="dashboard-grid">
          <button type="button" className="dashboard-card"><span className="card-title">Marcar doacao</span><span className="card-description">Agende sua próxima doação.</span></button>
          <button type="button" className="dashboard-card"><span className="card-title">Meu Perfil</span><span className="card-description">Visualize e atualize seus dados.</span></button>
          <button type="button" className="dashboard-card"><span className="card-title">Histórico de Doacoes</span><span className="card-description">Acompanhe suas contribuições.</span></button>
        </div>
      </section>
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
      <Route path="/home" element={usuario ? <AuthenticatedHome usuario={usuario} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
