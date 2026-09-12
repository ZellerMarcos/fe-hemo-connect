# Seguranca - Criptografia e Comunicacao Segura

Este documento consolida a estrategia do frontend para o requisito 3.

## 1. Escopo

O frontend e responsavel por:
- enviar dados apenas para endpoint seguro em producao;
- evitar persistencia desnecessaria de dados sensiveis no navegador;
- propagar erros de autenticacao de forma consistente;
- documentar as garantias de transporte em conjunto com backend e hosting.

## 2. Comunicacao segura (3.1, 3.2, 3.3)

- `VITE_API_URL` e obrigatoria.
- Em producao, a URL da API deve usar HTTPS.
- Em desenvolvimento, HTTP e permitido somente para localhost/127.0.0.1.
- O cliente centralizado (`src/services/api.ts`) aplica essa validacao no startup.

## 3. Dados sensiveis em repouso (3.4)

- Senhas de login/cadastro/reset ficam apenas em memoria de execucao durante o fluxo.
- O frontend nao grava senha em localStorage/sessionStorage.
- Hash e armazenamento definitivo de credenciais sao responsabilidade do backend.

## 4. Escolhas criptograficas (3.5)

- O frontend delega hash e validacoes criptograficas ao backend.
- O transporte cifrado e garantido por HTTPS/TLS no ambiente produtivo.
- Esta separacao reduz superficie de ataque no cliente e evita logica sensivel no browser.

## 5. Segredos e configuracao (3.6)

- Nao ha chaves secretas hardcoded no frontend.
- Variaveis de ambiente de build devem ser gerenciadas pela plataforma de deploy.
- Valores inseguros de API em producao devem falhar cedo no startup.

## 6. Estrategia documentada e justificativas (3.7, 3.8)

Justificativa principal:
- O browser e ambiente menos confiavel para segredos; por isso, criptografia de credenciais permanece no backend.
- O frontend aplica controles de transporte e valida entradas, enquanto a protecao criptografica forte permanece no servidor.

Trade-off:
- Fail-fast em URL insegura pode quebrar ambiente mal configurado, mas evita exposicao silenciosa de dados para endpoint sem TLS.

## 7. Evidencias operacionais

- Build/lint sem erro.
- Teste manual de fluxo de autenticacao e reset com API HTTPS.
- Verificacao de que a aplicacao nao inicia em producao quando `VITE_API_URL` nao for HTTPS.
