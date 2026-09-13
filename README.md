# Hemo Connect

## Descrição

Frontend do Hemo Connect, plataforma que facilita o agendamento de doações,
aproxima doadores dos hemocentros e incentiva uma frequência maior de doações.

## Sumario

- [Descrição](#descrição)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Execução](#execução)
- [Build](#build)
- [Scripts](#scripts)
- [Configuracao de ambiente](#configuracao-de-ambiente)
- [Funcionalidades atuais](#funcionalidades-atuais)
- [Rotas principais](#rotas-principais)
- [Seguranca](#seguranca)
- [Documentacao complementar](#documentacao-complementar)

## Tecnologias

- React
- TypeScript
- Vite
- npm
- Tailwind CSS
- Lucide React
- Motion
- PDFKit

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Configuracao de ambiente

Defina `VITE_API_URL` antes de iniciar a aplicacao.

- Em producao, a URL da API deve usar `https://`.
- Em desenvolvimento, `http://` e aceito apenas para `localhost` ou
	`127.0.0.1`.

Essa validacao e aplicada no cliente HTTP centralizado.

## Funcionalidades atuais

- autenticacao com login, 2FA e recuperacao de senha;
- cadastro com consentimento explicito para tratamento de dados;
- area logada com home, perfil e central de direitos do titular;
- exportacao de dados do titular em PDF;
- fluxo de revogacao de consentimento e exclusao/anonimizacao de conta.

## Rotas principais

| Rota | Finalidade |
| --- | --- |
| `/login` | Acesso principal da aplicacao. |
| `/cadastro` | Criacao de conta de doador. |
| `/forgot-password` | Solicitacao de link para redefinir senha. |
| `/reset-password` | Definicao de nova senha com token. |
| `/two-factor` | Confirmacao do segundo fator de autenticacao. |
| `/home` | Painel inicial da area logada. |
| `/perfil` | Dados da conta e direitos do titular (LGPD). |

## Seguranca

O requisito 3 (Criptografia e Comunicacao Segura) foi consolidado na
documentacao:

- `docs/SECURITY.md`
- `docs/releases/criptografia (requisito 3)/RELEASE_requisito_03.md`

## Documentacao complementar

- `docs/LGPD.md`
- `docs/releases/conformidade lgpd (requisito 4)/RELEASE_requisito_04.md`
