# RELEASE - Requisito 3 (Criptografia e Comunicacao Segura)

## Resumo

Esta entrega formaliza os controles de transporte seguro no frontend e a documentacao de estrategia criptografica por camada.

## Itens implementados

### 3.1 Comunicacao protegida por TLS/HTTPS
- URL da API obrigatoria no startup.
- Em producao, o frontend aceita somente API em HTTPS.

### 3.2 Bloqueio de conexoes nao seguras
- Falha explicita quando `VITE_API_URL` estiver insegura em producao.
- Em desenvolvimento, excecao restrita a localhost/127.0.0.1.

### 3.3 Evidencia de trafego cifrado
- Procedimento de validacao documentado em `docs/SECURITY.md`.

### 3.4 Dados sensiveis em repouso
- Frontend evita persistencia de senha em armazenamento local.
- Armazenamento criptografico de credenciais permanece no backend.

### 3.5 Algoritmos criptograficos adequados
- Responsabilidade de hash/criptografia centralizada no backend.
- Transporte no frontend garantido por politica de HTTPS.

### 3.6 Chaves criptograficas protegidas
- Sem segredo hardcoded no frontend.
- Configuracoes sensiveis via variaveis de ambiente de deploy.

### 3.7 Estrategia de criptografia documentada
- Documento de seguranca consolidado em `docs/SECURITY.md`.

### 3.8 Justificativa tecnica das escolhas
- Justificativas e trade-offs registrados em `docs/SECURITY.md`.

## Validacao

- Build e lint do frontend sem erros.
- Teste manual dos fluxos login/2FA/forgot/reset com API HTTPS.

## Observacoes

- Headers de seguranca de borda dependem da configuracao do hosting/proxy.
