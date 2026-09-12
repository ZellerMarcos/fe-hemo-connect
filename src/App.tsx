import { useEffect, useState } from 'react'
import { CalendarPlus2, Building2, HeartPulse, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { AuthFrame } from './components/layout/AuthFrame'
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
  const cards = [
    {
      title: 'Marcar doacao',
      description: 'Agende sua próxima doação e escolha a melhor janela de horário.',
      icon: CalendarPlus2,
      action: undefined,
    },
    {
      title: 'Meu Perfil',
      description: 'Consulte seus dados e direitos do titular em uma única tela.',
      icon: ShieldCheck,
      action: onAbrirPerfil,
    },
    {
      title: 'Historico de Doacoes',
      description: 'Acompanhe as doações realizadas e sua evolução como doador.',
      icon: HeartPulse,
      action: undefined,
    },
    {
      title: 'Hemocentros',
      description: 'Visualize unidades, endereços e horários de atendimento.',
      icon: Building2,
      action: undefined,
    },
  ]

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-orange-50 to-red-100 p-4 md:p-8" aria-labelledby="welcome-title">
      <div className="mx-auto grid min-h-[88vh] w-full max-w-6xl grid-rows-[auto_auto_1fr_auto] gap-5 rounded-2xl border border-red-100 bg-white/90 p-6 shadow-2xl shadow-red-200/30 md:p-10">
        <header className="flex flex-col justify-between gap-4 border-b border-red-100 pb-4 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Hemo Connect</p>
            <h1 id="welcome-title" className="mt-3 max-w-[14ch] text-4xl font-semibold leading-[0.95] text-zinc-900 md:text-6xl">
              Olá, {usuario.nome.split(' ')[0]}.
            </h1>
          </div>
          <div className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800">
            {usuario.email}
          </div>
        </header>

        <section className="grid max-w-3xl gap-4">
          <p className="text-base leading-relaxed text-zinc-700 md:text-lg">
            Centralize suas próximas ações de doação, acompanhe seus dados e acesse os direitos do titular no mesmo fluxo.
          </p>
          <div>
            <Button onClick={onAbrirPerfil} className="rounded-2xl px-6">
              Meu Perfil e Privacidade
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Atalhos do doador">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.button
                key={card.title}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.06 * index }}
                onClick={card.action}
                className="group rounded-2xl border border-red-100 bg-gradient-to-br from-white to-rose-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-100"
              >
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <Icon size={20} />
                </span>
                <p className="text-xl font-semibold text-zinc-900">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{card.description}</p>
              </motion.button>
            )
          })}
        </section>

        <footer className="mt-auto flex flex-col justify-between gap-2 border-t border-red-100 pt-4 text-xs font-medium text-zinc-500 md:flex-row">
          <span>Hemo Connect</span>
          <span>Doacao segura, dados sob controle</span>
        </footer>
      </div>
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
      <Route path="/login" element={<AuthFrame><Login onLoginSucesso={handleLoginSucesso} onTwoFactor={(email) => { setTwoFactorEmail(email); navigate('/two-factor') }} onIrParaCadastro={() => navigate('/cadastro')} onEsqueciSenha={() => navigate('/forgot-password')} mensagemSessaoExpirada={mensagemSessaoExpirada} /></AuthFrame>} />
      <Route path="/forgot-password" element={<AuthFrame><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/auth/forgot-password" element={<AuthFrame><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/reset-password" element={<AuthFrame><ResetPassword token={new URLSearchParams(location.search).get('token') ?? ''} onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/cadastro" element={<AuthFrame><Cadastro onCadastroSucesso={() => navigate('/login')} onIrParaLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/two-factor" element={<AuthFrame><TwoFactor email={twoFactorEmail} onSucesso={handleTwoFactorSuccess} onVoltar={() => { setTwoFactorEmail(''); navigate('/login') }} /></AuthFrame>} />
      <Route path="/index.html" element={<ResetPasswordEntry />} />
      <Route path="/home" element={usuario ? <AuthenticatedHome usuario={usuario} onAbrirPerfil={() => navigate('/perfil')} /> : <Navigate to="/login" replace />} />
      <Route path="/perfil" element={usuario ? <AuthFrame><MeuPerfil usuario={usuario} onVoltarHome={() => navigate('/home')} onContaRemovida={() => { setUsuario(null); navigate('/login', { replace: true }) }} /></AuthFrame> : <Navigate to="/login" replace />} />
      {/* Rota protegida da central de privacidade; sem sessao ativa redireciona para login. */}
      <Route path="/privacidade" element={usuario ? <Navigate to="/perfil" replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
