import { useEffect, useState } from 'react'
import { CalendarPlus2, Building2, HeartPulse, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './components/ui/button'
import { BrandLogo } from './components/BrandLogo'
import { AuthFrame } from './components/layout/AuthFrame'
import { Cadastro } from './pages/Cadastro'
import { ForgotPassword } from './pages/ForgotPassword'
import { Login } from './pages/Login'
import { MeuPerfil } from './pages/MeuPerfil'
import { ResetPassword } from './pages/ResetPassword'
import { TwoFactor } from './pages/TwoFactor'
import type { LoginUserResponse } from './types/auth'
import { AreaLogada } from './components/layout/AreaLogada'
import { Agendamentos } from './pages/Agendamentos'
import { Enfermagem } from './pages/Enfermagem'
import { Recepcao } from './pages/Recepcao'
import { TriagemEnfermagem } from './pages/TriagemEnfermagem'
import { UsersApprove } from './pages/UsersApprove'
import { Hemocentros } from './pages/Hemocentros'
import { AgendaHemocentro } from './pages/AgendaHemocentro'
import { HorariosHemocentro } from './pages/HorariosHemocentro'
import { confirmarNavegacao } from './hooks/useUnsavedChanges'
import { consultarSessao, sair } from './services/auth'
import { clearAccessToken, getAccessToken } from './services/session'

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessao expirou, realize novamente seu login'

function AuthenticatedHome({
  usuario,
  onAbrirPerfil,
  onAgendamentos,
  onSair,
}: {
  usuario: LoginUserResponse
  onAbrirPerfil: () => void
  onAgendamentos: () => void
  onSair: () => void
}) {
  const cards = [
    {
      title: 'Marcar doacao',
      description: 'Agende sua próxima doação e escolha a melhor janela de horário.',
      icon: CalendarPlus2,
      action: onAgendamentos,
    },
    {
      title: 'Meu Perfil',
      description: 'Consulte seus dados e direitos do titular em uma única tela.',
      icon: ShieldCheck,
      action: onAbrirPerfil,
    },
    {
      title: 'Histórico de atendimentos',
      description: 'Consulte os resultados das suas triagens.',
      icon: HeartPulse,
      action: onAgendamentos,
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
          <div className="min-w-0">
            <BrandLogo compact />
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
          <BrandLogo compact />
          <Button variant="ghost" onClick={onSair}>Sair</Button>
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
  const [restaurando, setRestaurando] = useState(() => !!getAccessToken())
  const [erroSessao, setErroSessao] = useState('')
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    let active = true
    if (getAccessToken()) {
      consultarSessao().then(user => {
        if (active) setUsuario(user)
      }).catch(error => {
        if (active) setErroSessao(error instanceof Error ? error.message : 'Não foi possível restaurar a sessão.')
      }).finally(() => { if (active) setRestaurando(false) })
    }
    return () => { active = false }
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      if (location.pathname === '/reset-password' || location.pathname === '/forgot-password') return
      setUsuario(null)
      clearAccessToken()
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
    setErroSessao('')
    navigate(loggedUser.perfil === 'ENFERMEIRO' ? '/enfermeiro' : '/home', { replace: true })
  }

  function confirmarSaidaDaTriagem() {
    if (!confirmarNavegacao()) return false
    return !location.pathname.startsWith('/enfermeiro/triagens/') || window.confirm('Antes de sair, confira se salvou a avaliação. Alterações não salvas serão descartadas. Continuar?')
  }

  async function handleLogout() {
    if (saindo || !confirmarSaidaDaTriagem()) return
    setSaindo(true); setErroSessao('')
    try {
      await sair()
      clearAccessToken(); setUsuario(null); setTwoFactorEmail('')
      navigate('/login', { replace: true })
    } catch (error) {
      setErroSessao(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão. Tente novamente.')
    } finally { setSaindo(false) }
  }

  function abrirPerfil() {
    if (confirmarSaidaDaTriagem()) navigate('/perfil')
  }

  function abrirHemocentros() {
    if (confirmarSaidaDaTriagem()) navigate('/hemocentros')
  }

  function contaRemovida() {
    clearAccessToken(); setUsuario(null)
    navigate('/login', { replace: true })
  }

  function area(titulo: string, content: React.ReactNode) {
    if (!usuario) return <Navigate to="/login" replace />
    return <AreaLogada usuario={usuario} titulo={titulo} onPerfil={abrirPerfil} onSair={() => void handleLogout()} onAprovacoes={() => { if (confirmarSaidaDaTriagem()) navigate('/users-approve') }} onHemocentros={abrirHemocentros} onAgenda={() => { if (confirmarSaidaDaTriagem()) navigate('/agenda') }}>{content}</AreaLogada>
  }

  const nurseArea = usuario?.perfil === 'ENFERMEIRO'
  const receptionArea = usuario && ['RECEPCIONISTA', 'RESPONSAVEL_HEMOCENTRO', 'ADMINISTRADOR'].includes(usuario.perfil)
  const acessoNegado = area('Acesso não autorizado', <p role="alert">Seu perfil não possui acesso a esta área.</p>)
  if (restaurando) return <AuthFrame><section className="w-full max-w-lg rounded-2xl bg-white p-6"><BrandLogo /><p role="status" className="mt-4">Validando sessão...</p></section></AuthFrame>

  return (
    <>
    {erroSessao && <p role="alert" className="border border-red-200 bg-red-50 p-4 text-red-800">{erroSessao}</p>}
    {saindo && <p role="status" className="p-4">Encerrando sessão...</p>}
    <Routes>
      <Route path="/login" element={<AuthFrame><Login onLoginSucesso={handleLoginSucesso} onTwoFactor={(email) => { setTwoFactorEmail(email); navigate('/two-factor') }} onIrParaCadastro={() => navigate('/cadastro')} onEsqueciSenha={() => navigate('/forgot-password')} mensagemSessaoExpirada={mensagemSessaoExpirada} /></AuthFrame>} />
      <Route path="/forgot-password" element={<AuthFrame><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/auth/forgot-password" element={<AuthFrame><ForgotPassword onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/reset-password" element={<AuthFrame><ResetPassword token={new URLSearchParams(location.search).get('token') ?? ''} onVoltarAoLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/cadastro" element={<AuthFrame><Cadastro onCadastroSucesso={() => navigate('/login')} onIrParaLogin={() => navigate('/login')} /></AuthFrame>} />
      <Route path="/two-factor" element={twoFactorEmail ? <AuthFrame><TwoFactor email={twoFactorEmail} onSucesso={handleLoginSucesso} onVoltar={() => { setTwoFactorEmail(''); navigate('/login') }} /></AuthFrame> : <Navigate to="/login" replace />} />
      <Route path="/index.html" element={<ResetPasswordEntry />} />
      <Route path="/home" element={usuario ? nurseArea ? <Navigate to="/enfermeiro" replace /> : receptionArea ? <Navigate to="/recepcao" replace /> : usuario.perfil === 'DOADOR' ? <AuthenticatedHome usuario={usuario} onAbrirPerfil={abrirPerfil} onAgendamentos={() => navigate('/agendamentos')} onSair={() => void handleLogout()} /> : area('Área profissional', <p>O módulo do seu perfil não está disponível nesta versão.</p>) : <Navigate to="/login" replace />} />
      <Route path="/enfermeiro" element={nurseArea ? area('Triagem de Doadores', <Enfermagem />) : acessoNegado} />
      <Route path="/enfermeiro/triagens" element={nurseArea ? area('Triagem de Doadores', <Enfermagem />) : acessoNegado} />
      <Route path="/enfermeiro/triagens/:id" element={nurseArea && usuario ? area('Atendimento de enfermagem', <TriagemEnfermagem usuario={usuario} />) : acessoNegado} />
      <Route path="/recepcao" element={receptionArea ? area('Recepção de Doadores', <Recepcao />) : acessoNegado} />
      <Route path="/users-approve" element={usuario?.perfil === 'ADMINISTRADOR' ? area('Aprovação de enfermeiros', <UsersApprove />) : acessoNegado} />
      <Route path="/hemocentros" element={usuario && ['ADMINISTRADOR', 'ENFERMEIRO'].includes(usuario.perfil) ? area('Hemocentros', <Hemocentros />) : acessoNegado} />
      <Route path="/agenda" element={usuario && ['ADMINISTRADOR', 'RESPONSAVEL_HEMOCENTRO'].includes(usuario.perfil) ? area('Agenda da unidade', <AgendaHemocentro usuario={usuario} />) : acessoNegado} />
      <Route path="/hemocentros/:id/horarios" element={usuario ? area('Horários da unidade', <HorariosHemocentro />) : acessoNegado} />
      <Route path="/agendamentos" element={usuario?.perfil === 'DOADOR' ? area('Agendamentos e histórico', <Agendamentos />) : acessoNegado} />
      <Route path="/perfil" element={usuario ? <AuthFrame><MeuPerfil usuario={usuario} onVoltarHome={() => navigate('/home')} onContaRemovida={contaRemovida} /></AuthFrame> : <Navigate to="/login" replace />} />
      {/* Rota protegida da central de privacidade; sem sessao ativa redireciona para login. */}
      <Route path="/privacidade" element={usuario ? <Navigate to="/perfil" replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  )
}

export default App
