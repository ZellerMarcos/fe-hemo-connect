export const ROUTES = {
  auth: '/auth',
  login: '/login',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/reset-password',
  home: '/home',
  cadastro: '/cadastro',
  // Rota da central de privacidade com funcionalidades LGPD do titular.
  privacidade: '/privacidade',
} as const

export const PAGE_INFO = {
  auth: { name: 'Autenticacao', path: ROUTES.auth },
  login: { name: 'Login Page', path: ROUTES.login },
  forgotPassword: { name: 'Esqueci minha senha', path: ROUTES.forgotPassword },
  resetPassword: { name: 'Redefinir Senha', path: ROUTES.resetPassword },
  home: { name: 'Home Page', path: ROUTES.home },
  cadastro: { name: 'Cadastro', path: ROUTES.cadastro },
  privacidade: { name: 'Privacidade', path: ROUTES.privacidade },
} as const

export const PAGE_NAMES = Object.values(PAGE_INFO).map((page) => page.name)
