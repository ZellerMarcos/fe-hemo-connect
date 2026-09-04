import { useEffect, useState } from 'react'
import { Cadastro } from './pages/Cadastro'
import { CentralDoDoador } from './pages/CentralDoDoador'
import { ForgotPassword } from './pages/ForgotPassword'
import { HomePage } from './pages/HomePage'
import { Login } from './pages/Login'
import { ResetPassword } from './pages/ResetPassword'
import { TwoFactor } from './pages/TwoFactor'
import { ROUTES } from './routes'
import type { LoginUserResponse } from './types/auth'

type View = 'login' | 'cadastro' | 'two-factor' | 'forgot-password' | 'reset-password' | 'home'

// Mensagem compartilhada para qualquer fluxo em que a sessão foi invalidada pelo backend.
const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessao expirou, realize novamente seu login'

// A função resolve a tela ativa conforme o caminho atual, mantendo a navegação consistente com as rotas definidas pelo produto.
function resolveViewFromPath(pathname: string): View {
  if (pathname === ROUTES.home) return 'home'
  if (pathname === ROUTES.cadastro) return 'cadastro'
  if (pathname === ROUTES.resetPassword || new URLSearchParams(window.location.search).get('token')) {
    return 'reset-password'
  }
  if (pathname === ROUTES.forgotPassword) return 'forgot-password'
  if (pathname === ROUTES.login || pathname === ROUTES.auth || pathname === '/') return 'login'
  return 'login'
}

// O componente principal coordena a navegação em estado, os modais de autenticação e a área logada após o login.
function App() {
  // A home passa a ser a primeira tela exibida quando a aplicação inicia.
  const [view, setView] = useState<View>(() => {
    const initialPath = window.location.pathname
    if (initialPath === '/' || initialPath === '') return 'home'
    return resolveViewFromPath(initialPath)
  })
  // Usuário autenticado em memória para renderizar a área logada após o login ou 2FA.
  const [usuario, setUsuario] = useState<LoginUserResponse | null>(null)
  // O e-mail pendente vive apenas durante o fluxo atual; não é uma credencial persistente.
  const [twoFactorEmail, setTwoFactorEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  // Mensagem de sessão expirada exibida na tela de login após o backend bloquear o acesso.
  const [mensagemSessaoExpirada, setMensagemSessaoExpirada] = useState('')

  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (token) {
        setResetToken(token)
        setView('reset-password')
        return
      }

      const nextPath = window.location.pathname
      const nextView = nextPath === '/' || nextPath === '' ? 'home' : resolveViewFromPath(nextPath)
      setView(nextView)
    }

    // O backend dispara esse evento quando a sessão expira por inatividade.
    const handleSessionExpired = () => {
      // Limpa dados sensíveis da sessão e força o retorno à tela de autenticação.
      setUsuario(null)
      setTwoFactorEmail('')
      setMensagemSessaoExpirada(MENSAGEM_SESSAO_EXPIRADA)
      window.history.pushState({}, '', ROUTES.login)
      setView('login')
    }

    syncFromLocation()
    window.addEventListener('session-expired', handleSessionExpired)
    window.addEventListener('popstate', syncFromLocation)
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired)
      window.removeEventListener('popstate', syncFromLocation)
    }
  }, [])

  // A navegação centra a atualização do histórico do navegador e do estado interno para preservar a relação entre rota e tela.
  function navigateTo(path: string, nextView?: View) {
    window.history.pushState({}, '', path)
    setView(nextView ?? resolveViewFromPath(path))
  }

  // Centraliza a ação de sucesso no login para manter o estado consistente em toda a aplicação.
  // O sucesso no login grava o usuário autenticado em memória e envia o fluxo para a área logada.
  function handleLoginSucesso(loggedUser: LoginUserResponse) {
    setMensagemSessaoExpirada('')
    setUsuario(loggedUser)
    navigateTo(ROUTES.home, 'home')
  }

  // A renderização modal concentra a troca de telas de autenticação sem abandonar a camada visual da home.
  function renderModalContent() {
    if (view === 'login') {
      return (
        <div className="modal-backdrop">
          <Login
            onLoginSucesso={handleLoginSucesso}
            onTwoFactor={(email) => { setTwoFactorEmail(email); navigateTo(ROUTES.auth, 'two-factor') }}
            onIrParaCadastro={() => navigateTo(ROUTES.cadastro, 'cadastro')}
            onEsqueciSenha={() => navigateTo(ROUTES.forgotPassword, 'forgot-password')}
            mensagemSessaoExpirada={mensagemSessaoExpirada}
          />
        </div>
      )
    }

    if (view === 'cadastro') {
      return (
        <div className="modal-backdrop">
          <Cadastro onCadastroSucesso={() => navigateTo(ROUTES.login, 'login')} onIrParaLogin={() => navigateTo(ROUTES.login, 'login')} />
        </div>
      )
    }

    if (view === 'two-factor') {
      return (
        <div className="modal-backdrop">
          <TwoFactor
            email={twoFactorEmail}
            onSucesso={(nome) => {
              setMensagemSessaoExpirada('')
              setUsuario({
                id: 0,
                nome,
                email: twoFactorEmail,
                perfil: 'DOADOR',
                status: 'ATIVO',
                hemocentro_id: null,
              })
              navigateTo(ROUTES.home, 'home')
            }}
            onVoltar={() => { setTwoFactorEmail(''); navigateTo(ROUTES.login, 'login') }}
          />
        </div>
      )
    }

    if (view === 'forgot-password') {
      return (
        <div className="modal-backdrop">
          <ForgotPassword onVoltarAoLogin={() => navigateTo(ROUTES.login, 'login')} />
        </div>
      )
    }

    if (view === 'reset-password') {
      return (
        <div className="modal-backdrop">
          <ResetPassword
            token={resetToken}
            onVoltarAoLogin={() => {
              setResetToken('')
              navigateTo(ROUTES.login, 'login')
            }}
          />
        </div>
      )
    }

    return null
  }

  const nomeVisitante = usuario?.nome ?? 'Visitante'

  if (usuario) {
    return (
      <main className="page-shell page-shell--dashboard">
        <CentralDoDoador nome={usuario.nome} />
      </main>
    )
  }

  return (
    <main className="page-shell">
      <HomePage nome={nomeVisitante} onEntrar={() => navigateTo(ROUTES.login, 'login')} />
      {renderModalContent()}
    </main>
  )
}

export default App
