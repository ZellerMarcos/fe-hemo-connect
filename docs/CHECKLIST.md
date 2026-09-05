# Checklist do Projeto — Hemo Connect Frontend

Este checklist organiza os requisitos de segurança e experiência do usuário implementados no frontend do projeto Hemo Connect e facilita a conferência do que foi desenvolvido, documentado e validado.

## 1. Autenticação e Gestão de Credenciais

| Requisito | Implementação | Status |
|---|---|---|
| 1.1 — Tela de login | Formulário de e-mail e senha integrado à API | Concluído |
| 1.2 — Validação local | Campos obrigatórios validados antes do envio | Concluído |
| 1.3 — Autenticação em dois fatores | Navegação para a tela de 2FA após credenciais válidas | Concluído |
| 1.4 — Validação do 2FA | Código enviado ao backend para confirmação | Concluído |
| 1.5 — Fluxo de autenticação | Login, 2FA, área logada e retorno ao login | Concluído |
| 1.6 — Feedback de credenciais | Mensagem de erro retornada pela API exibida no login | Concluído |
| 1.7 — Tentativas restantes | Mensagem com o número de tentativas antes do bloqueio | Concluído |
| 1.8 — Bloqueio temporário | Aviso de bloqueio por 1 hora retornado pelo backend | Concluído |
| 1.9 — Sessão expirada | Evento global redireciona o usuário ao login | Concluído |
| 1.10 — Mensagem de logout | Exibição de "Sua sessao expirou, realize novamente seu login" | Concluído |
| 1.11 — Área pós-login | Dashboard inicial com ações do usuário | Concluído |
| 1.12 — Build da aplicação | Projeto compilado com TypeScript e Vite | Concluído |

---

## 2. Recuperação de Senha

| Requisito | Implementação | Status |
|---|---|---|
| 2.1 — Funcionalidade implementada | Telas de recuperação e redefinição de senha | Concluído |
| 2.2 — Acesso pela tela de login | Link "Esqueci minha senha" integrado ao fluxo de navegação | Concluído |
| 2.3 — Solicitação por e-mail | Formulário integrado ao endpoint `/auth/forgot-password` | Concluído |
| 2.4 — Resposta neutra | Mensagem não revela se o e-mail está cadastrado | Concluído |
| 2.5 — Redefinição por token | Token recebido na URL encaminhado ao endpoint de redefinição | Concluído |
| 2.6 — Validação da nova senha | Campos obrigatórios e mínimo de 8 caracteres | Concluído |
| 2.7 — Confirmação da senha | Nova senha e confirmação precisam coincidir | Concluído |
| 2.8 — Token inválido ou expirado | Mensagem de erro retornada pela API exibida na tela | Concluído |
| 2.9 — Sucesso da redefinição | Mensagem de sucesso e opção de retorno ao login | Concluído |
| 2.10 — Estado de carregamento | Botões desabilitados durante o envio da requisição | Concluído |
| 2.11 — Integração com serviços | Funções para solicitação e redefinição em `services/auth.ts` | Concluído |
| 2.12 — Justificativas técnicas | Regras descritas na release do requisito 2 | Concluído |

---

## 3. Funcionalidades verificadas

### Cadastro e login

- [x] Acesso à tela de login
- [x] Validação dos campos obrigatórios
- [x] Envio de credenciais para a API
- [x] Redirecionamento para o 2FA
- [x] Redirecionamento para a área logada
- [x] Exibição de erro de credenciais
- [x] Exibição de tentativas restantes
- [x] Exibição de bloqueio temporário

### Autenticação em dois fatores

- [x] Exibição da tela de 2FA
- [x] Entrada do código de 6 dígitos
- [x] Envio do código para a API
- [x] Exibição de erro para código inválido
- [x] Redirecionamento para a área logada após sucesso

### Sessões

- [x] Tratamento de respostas 401 em rotas protegidas
- [x] Disparo do evento `session-expired`
- [x] Limpeza do usuário em memória
- [x] Redirecionamento para a tela de login
- [x] Exibição da mensagem de sessão expirada

### Recuperação de senha

- [x] Link de recuperação na tela de login
- [x] Tela de solicitação por e-mail
- [x] Validação de preenchimento do e-mail
- [x] Mensagem neutra após a solicitação
- [x] Tela de nova senha
- [x] Leitura do token recebido na URL
- [x] Validação de senha mínima
- [x] Validação da confirmação
- [x] Tratamento de token inválido ou expirado
- [x] Mensagem de sucesso após redefinição
- [x] Retorno ao login

### Qualidade da aplicação

- [x] Estados de carregamento nos formulários
- [x] Mensagens de sucesso e erro
- [x] Componentes separados por responsabilidade
- [x] Integração centralizada no serviço de API
- [x] Build validado com `npm run build`

---

## 4. Evidências

A validação técnica do frontend pode ser reproduzida pelos comandos:

```text
npm run build
```

A evidência automatizada principal é a compilação TypeScript e Vite sem erros. Capturas de tela dos fluxos podem ser organizadas em:

```text
docs/evidencias/
```

Sugestões de evidências visuais:

- `login.png` — tela de login;
- `login_erro_tentativas_restantes.png` — aviso de tentativas restantes;
- `conta_bloqueada.png` — aviso de bloqueio temporário;
- `dois_fatores.png` — tela de confirmação do 2FA;
- `sessao_expirada.png` — retorno ao login após expiração;
- `recuperacao_senha.png` — solicitação de recuperação;
- `redefinicao_senha.png` — criação da nova senha;
- `redefinicao_sucesso.png` — redefinição concluída;
- `token_invalido.png` — tratamento de token inválido ou expirado.

---

## 5. Documentação

A documentação detalhada das entregas está disponível em:

```text
docs/releases/autenticacao (requisito 1)/RELEASE_requisito_01.md
docs/releases/recuperar senha (requisito 2)/RELEASE_requisito_02.md
```

Esses arquivos descrevem os fluxos de tela, as integrações com a API, as mensagens exibidas e as regras de negócio relacionadas ao frontend.

---

## 6. Situação atual

**Requisito 1 — Autenticação e Gestão de Credenciais: CONCLUÍDO**

**Requisito 2 — Recuperação de Senha: CONCLUÍDO**

O código-fonte, a documentação e a validação de build referentes aos requisitos estão organizados no repositório do frontend.

> A segurança do hash, da validade e do uso único dos tokens é responsabilidade do backend; o frontend apresenta os estados e encaminha os dados aos endpoints correspondentes.
