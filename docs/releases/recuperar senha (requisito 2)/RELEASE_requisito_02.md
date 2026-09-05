# Release Frontend do Projeto Hemo Connect

## Data da release
- 2026-09-05

## Visão geral
O frontend do projeto Hemo Connect recebeu o fluxo de recuperação e redefinição de senha, permitindo que o usuário solicite um link por e-mail e cadastre uma nova senha por meio de um token temporário.

Nesta release, o foco principal foi disponibilizar uma experiência completa para recuperação de acesso, com validações no formulário, integração com a API e mensagens de retorno para os estados de sucesso e erro.

---

## Status atual do projeto

### Frontend
- Link "Esqueci minha senha" disponível na tela de login.
- Tela de recuperação de senha com solicitação por e-mail.
- Integração com o endpoint `/auth/forgot-password`.
- Mensagem neutra após a solicitação para não revelar se o e-mail está cadastrado.
- Tela de redefinição de senha acessível por token recebido no link.
- Integração com o endpoint `/auth/reset-password`.
- Validação de senha obrigatória, tamanho mínimo e confirmação igual.
- Mensagens de sucesso e erro para o usuário.
- Opção de retorno à tela de login após a operação.

---

## Funcionalidades implementadas

### 1. Solicitação de recuperação
- O usuário acessa a opção "Esqueci minha senha" na tela de login.
- A aplicação apresenta um formulário para informar o e-mail.
- O frontend valida se o campo foi preenchido antes de enviar a requisição.
- A solicitação é enviada ao backend pelo serviço `solicitarResetSenha`.
- Após o envio, a aplicação informa que o link será enviado caso o e-mail esteja cadastrado.
- A mensagem também orienta o usuário a verificar a caixa de spam.
- O formulário limpa o e-mail após uma solicitação concluída.

### 2. Redefinição de senha
- O token recebido no link é utilizado pela tela de nova senha.
- O usuário informa a nova senha e sua confirmação.
- O frontend impede o envio de campos vazios.
- A senha deve possuir pelo menos 8 caracteres.
- A confirmação deve ser igual à nova senha.
- A aplicação envia o token e a nova senha ao backend pelo serviço `redefinirSenha`.
- Após o sucesso, os campos são limpos e o usuário é informado de que já pode entrar novamente.

### 3. Tratamento de respostas
- Respostas de erro da API são convertidas em mensagens exibidas na tela.
- Mensagens de sucesso são exibidas com estado visual próprio.
- O botão de envio é desabilitado durante o processamento para evitar requisições duplicadas.
- O usuário pode retornar ao login a qualquer momento.

---

## Regras de negócio em vigor

### Recuperação de senha
- A solicitação não revela ao usuário se o e-mail existe no banco de dados.
- O backend é responsável por gerar o token, controlar sua validade e enviar o link.
- O frontend apenas encaminha o e-mail e apresenta a resposta neutra da operação.

### Redefinição de senha
- O token é obrigatório para concluir a operação.
- O token é validado pelo backend e não é armazenado pelo frontend como credencial permanente.
- A nova senha precisa ter no mínimo 8 caracteres.
- A confirmação da senha deve coincidir com a nova senha.
- Tokens inválidos ou expirados são apresentados como erro ao usuário.
- Após a redefinição, o usuário retorna ao fluxo normal de login.

---

## Estrutura principal do projeto

### Frontend
- src/
  - App.tsx
  - pages/
    - Login.tsx
    - ForgotPassword.tsx
    - ResetPassword.tsx
  - services/
    - api.ts
    - auth.ts
  - types/
    - auth.ts
  - routes.ts

---

## Fluxo da funcionalidade

1. O usuário seleciona "Esqueci minha senha" na tela de login.
2. O frontend solicita o e-mail e envia a requisição para a API.
3. O backend processa a solicitação e envia o link de redefinição quando aplicável.
4. O usuário acessa o link recebido com o token temporário.
5. O frontend exibe a tela para criação e confirmação da nova senha.
6. A API valida o token e atualiza a senha.
7. O frontend informa o sucesso e permite retornar ao login.

---

## Estado atual

### Concluído até o momento
- Link de recuperação na tela de login.
- Tela de solicitação de recuperação.
- Tela de redefinição de senha.
- Validações de preenchimento, tamanho e confirmação.
- Integração com os endpoints de recuperação e redefinição.
- Mensagens de sucesso, erro e carregamento.
- Retorno ao login após a conclusão.

### Em andamento
- Integração visual com o serviço real de e-mail em diferentes ambientes.
- Refinamento visual das telas de recuperação e redefinição.
- Evolução de políticas adicionais de segurança de senha.

---

## Observações
- O frontend não expõe tokens em mensagens ou respostas visuais além do uso necessário no link de redefinição.
- A validade, o uso único e a atualização da senha são responsabilidades do backend.
- A funcionalidade depende da existência dos endpoints correspondentes e da configuração do serviço de e-mail.

---
