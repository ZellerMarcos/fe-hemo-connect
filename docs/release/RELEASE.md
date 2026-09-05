# Release Frontend do Projeto Hemo Connect

## Data da release
- 2026-08-29

## Visão geral
O frontend do Hemo Connect foi estruturado para oferecer a base da experiência do usuário no sistema, cobrindo autenticação, validação de sessão e acesso à área logada. A aplicação foi desenvolvida em React com Vite e apresenta uma interface inicial para o fluxo principal do produto.

Nesta release, o foco principal foi consolidar o acesso do usuário, a validação de 2FA e a redirecionamento seguro para a área logada após autenticação bem-sucedida.

---

## Status atual do frontend

### Funcionalidades entregues
- Tela de login com e-mail e senha.
- Fluxo de autenticação em duas etapas (2FA).
- Mensagem de erro para credenciais inválidas.
- Feedback do backend com número de tentativas restantes antes do bloqueio.
- Bloqueio temporário do usuário após 5 tentativas inválidas em 15 minutos, com mensagem de 1 hora de espera.
- Tela de cadastro inicial do usuário.
- Redirecionamento para o login após expiração de sessão.
- Exibição da mensagem:
  "Sua sessao expirou, realize novamente seu login"
- Tela básica pós-login com os itens:
  - Marcar doacao
  - Meu Perfil
  - Histórico de Doacoes

### Estrutura atual
- App principal com controle de estado de navegação.
- Página de login.
- Página de cadastro.
- Página de verificação de código 2FA.
- Serviços para autenticação e integração com API.
- Estilos base para identidade visual da aplicação.

---

## Fluxo de autenticação implementado

### Login
- O usuário informa e-mail e senha.
- A aplicação envia a requisição para a API.
- Caso a credencial esteja correta, o sistema avança para a etapa de verificação em 2FA.
- Se a credencial estiver incorreta, o backend responde com as tentativas restantes antes do bloqueio e, quando alcançado o limite, exibe o aviso de conta bloqueada por 1 hora.

### Verificação em 2FA
- O usuário recebe um código de 6 dígitos.
- A aplicação valida o código informado.
- Se o código for válido, o usuário é levado à área logada.

### Sessão expirada
- Quando a sessão expira, a aplicação dispara o evento de sessão expirada.
- O sistema limpa o estado de usuário e retorna para a tela de login.
- A mensagem de aviso é exibida ao usuário para que ele realize login novamente.

---

## Tela pós-login
A área logada foi iniciada com uma interface funcional básica, contendo blocos de navegação para as ações principais do usuário:

- Marcar doacao
- Meu Perfil
- Histórico de Doacoes

Essa estrutura serve como base para a evolução do dashboard e das telas de produto.

---

## Componentes e módulos principais

### App
- Controle das telas: login, cadastro, 2FA e home.
- Centralização do estado da sessão.
- Tratamento de expiração da sessão.

### Login
- Formulário de autenticação.
- Feedback visual de erro.
- Navegação para cadastro.

### TwoFactor
- Entrada do código de verificação.
- Validação do código.
- Redirecionamento para a página principal após confirmação.

### Services
- Integração com a API de autenticação.
- Comunicação com endpoints de login e verificação 2FA.

### Styles
- Layout base para telas do sistema.
- Visual consistente com identidade da marca.
- Cards e elementos básicos para a área logada.

---

## Estado atual do frontend

### Concluído
- Fluxo básico de autenticação.
- Fluxo de 2FA.
- Redirecionamento por expiração de sessão.
- Proteção anti-bruteforce com bloqueio temporário após 5 tentativas inválidas.
- Mensagens de feedback no login para tentativas restantes e conta bloqueada.
- Tela inicial pós-login.
- Estrutura base para evolução da experiência do usuário.

### Em andamento
- Refinamento visual da área logada.
- Criação das telas de perfil e histórico.
- Desenvolvimento das ações de cada card de dashboard.
- Conexão mais robusta com o backend para ações reais do usuário.

---

## Observações
- O frontend foi validado por build, confirmando que a aplicação compila corretamente após as mudanças implementadas.
- A interface atual atende à necessidade de base funcional para a autenticação e navegação inicial do produto.

---
