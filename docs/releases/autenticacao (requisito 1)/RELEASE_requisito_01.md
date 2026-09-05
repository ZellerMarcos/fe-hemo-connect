# Release Frontend do Projeto Hemo Connect

## Data da release
- 2026-08-29

## Visão geral
O frontend do projeto Hemo Connect foi estruturado em React com Vite para atender ao fluxo de autenticação, validação em duas etapas, controle da sessão e acesso à área logada do sistema.

Nesta release, o foco principal foi consolidar a experiência de entrada do usuário, o feedback das validações de segurança e o redirecionamento seguro entre as telas da aplicação.

---

## Status atual do projeto

### Frontend
- Aplicação desenvolvida em React com Vite e TypeScript.
- Tela de login com e-mail e senha.
- Fluxo de autenticação em duas etapas (2FA).
- Tela de cadastro inicial do usuário.
- Redirecionamento para a área logada após a validação do 2FA.
- Redirecionamento para o login quando a sessão expira.
- Exibição da mensagem: "Sua sessao expirou, realize novamente seu login".
- Feedback de erro para credenciais inválidas.
- Exibição das tentativas restantes antes do bloqueio temporário da conta.
- Exibição da mensagem de bloqueio por 1 hora após o limite de tentativas.
- Tela básica pós-login com opções:
  - Marcar doacao
  - Meu Perfil
  - Histórico de Doacoes

---

## Funcionalidades implementadas

### 1. Autenticação e segurança
- Formulário de login com validação local dos campos obrigatórios.
- Integração com o endpoint de autenticação do backend.
- Encaminhamento para a tela de 2FA quando as credenciais são válidas.
- Exibição da mensagem retornada pelo backend para credenciais inválidas.
- Exibição da quantidade de tentativas restantes antes do bloqueio de 1 hora.
- Exibição do aviso de conta temporariamente bloqueada.
- Limpeza do estado de autenticação ao ocorrer expiração da sessão.

### 2. Controle de sessão
- Tratamento global de respostas 401 nas rotas protegidas.
- Disparo do evento de sessão expirada para centralizar o logout no frontend.
- Retorno automático à tela de login após a sessão ser invalidada pelo backend.
- Manutenção do usuário autenticado em memória durante a navegação.

### 3. Experiência do usuário
- Mensagens de feedback para sucesso e erro.
- Navegação entre login, cadastro, 2FA e área logada.
- Dashboard inicial com ações principais do usuário.
- Estados de carregamento durante as requisições de autenticação.

---

## Regras de negócio em vigor

### Login e 2FA
- O usuário informa e-mail e senha na primeira etapa.
- Com credenciais válidas, a aplicação direciona o usuário para a confirmação do código 2FA.
- Após o código correto, a aplicação direciona o usuário à área logada.

### Bloqueio temporário
- O backend controla a contagem de tentativas inválidas.
- O frontend apresenta o número de tentativas restantes informado pela API.
- Após 5 tentativas inválidas em uma janela de 15 minutos, o frontend apresenta o bloqueio temporário de 1 hora.

### Sessão expirada
- Quando uma rota protegida retorna 401, a aplicação limpa o usuário em memória.
- O usuário é redirecionado para a tela de login.
- A mensagem apresentada é: "Sua sessao expirou, realize novamente seu login".

---

## Estrutura principal do projeto

### Frontend
- src/
  - App.tsx
  - pages/
    - Login.tsx
    - Cadastro.tsx
    - TwoFactor.tsx
  - services/
    - api.ts
    - auth.ts
  - types/
  - index.css

---

## Estado atual

### Em andamento
- Refinamento visual da área logada.
- Expansão dos módulos de navegação e ações do usuário.
- Aperfeiçoamento da experiência final para o fluxo de doação.

### Concluído até o momento
- Estrutura base da aplicação frontend.
- Fluxo de login com 2FA.
- Feedback de tentativas restantes e bloqueio temporário.
- Sessão expirada por inatividade.
- Redirecionamento para login com mensagem de expiração.
- Dashboard inicial com ações principais.

---

## Observações
- O frontend foi validado por build para confirmar a compilação da aplicação.
- O frontend depende das respostas e regras de segurança implementadas pelo backend.

---
