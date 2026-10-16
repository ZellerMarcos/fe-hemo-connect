export const ROUTES = {
  auth: '/auth',
  login: '/login',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/reset-password',
  home: '/home',
  perfil: '/perfil',
  cadastro: '/cadastro',
  // Rota da central de privacidade com funcionalidades LGPD do titular.
  privacidade: '/privacidade',
  enfermeiro: '/enfermeiro',
  triagens: '/enfermeiro/triagens',
  recepcao: '/recepcao',
  agendamentos: '/agendamentos',
  usersApprove: '/users-approve',
  hemocentros: '/hemocentros',
  agenda: '/agenda',
  horariosHemocentro: '/hemocentros/:id/horarios',
} as const

export const PAGE_INFO = {
  auth: { name: 'Autenticacao', path: ROUTES.auth },
  login: { name: 'Login Page', path: ROUTES.login },
  forgotPassword: { name: 'Esqueci minha senha', path: ROUTES.forgotPassword },
  resetPassword: { name: 'Redefinir Senha', path: ROUTES.resetPassword },
  home: { name: 'Home Page', path: ROUTES.home },
  perfil: { name: 'Meu Perfil', path: ROUTES.perfil },
  cadastro: { name: 'Cadastro', path: ROUTES.cadastro },
  privacidade: { name: 'Privacidade', path: ROUTES.privacidade },
  enfermeiro: { name: 'Enfermagem', path: ROUTES.enfermeiro },
  triagens: { name: 'Triagens', path: ROUTES.triagens },
  recepcao: { name: 'Recepção', path: ROUTES.recepcao },
  agendamentos: { name: 'Agendamentos', path: ROUTES.agendamentos },
  usersApprove: { name: 'Aprovação de enfermeiros', path: ROUTES.usersApprove },
  hemocentros: { name: 'Hemocentros', path: ROUTES.hemocentros },
  agenda: { name: 'Agenda da unidade', path: ROUTES.agenda },
  horariosHemocentro: { name: 'Horários da unidade', path: ROUTES.horariosHemocentro },
} as const

export const PAGE_NAMES = Object.values(PAGE_INFO).map((page) => page.name)
