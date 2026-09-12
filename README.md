# Hemo Connect

## Descrição

Frontend do Hemo Connect, plataforma que facilita o agendamento de doações,
aproxima doadores dos hemocentros e incentiva uma frequência maior de doações.

## Tecnologias

- React
- TypeScript
- TSX
- Vite
- npm

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

## Seguranca

O requisito 3 (Criptografia e Comunicacao Segura) foi consolidado na
documentacao:

- `docs/SECURITY.md`
- `docs/releases/criptografia (requisito 3)/RELEASE_requisito_03.md`
