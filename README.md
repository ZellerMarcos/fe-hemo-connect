# lib.tech - Frontend

Frontend da biblioteca inteligente e inclusiva para instituicoes de ensino.
Este projeto foi criado para uma atividade academica e utiliza uma interface
React com TypeScript, preparada para evoluir junto com a API do sistema.

## Tecnologias

- React
- TypeScript
- TSX
- Vite
- npm

## Pre-requisitos

- Node.js instalado.
- npm disponivel no terminal.

## Instalacao

Execute os comandos a partir desta pasta (`fe-lib-tech`):

```powershell
npm install
```

## Desenvolvimento

```powershell
npm run dev
```

O Vite normalmente disponibiliza a aplicacao em `http://localhost:5173`.

## Scripts disponiveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Verifica problemas de lint. |
| `npm run lint:fix` | Corrige problemas de lint quando possivel. |
| `npm run build` | Valida o TypeScript e gera o build de producao. |
| `npm run preview` | Exibe localmente o build gerado. |

## Build de producao

```powershell
npm run build
```

## Estrutura principal

```text
fe-lib-tech/
|-- src/
|   |-- components/             # Componentes reutilizaveis
|   |-- pages/                  # Paginas da aplicacao
|   |-- services/               # Comunicacao com servicos externos
|   |-- types/                  # Tipos TypeScript
|   |-- App.tsx                 # Componente principal
|   |-- main.tsx                # Ponto de entrada
|-- index.html
|-- package.json                # Dependencias e scripts
|-- vite.config.ts              # Configuracao do Vite
```

## Comunicacao com o backend

O frontend e o backend sao projetos separados e devem se comunicar por uma API
HTTP. Nesta etapa, a API disponibiliza o endpoint `/health`; a integracao de
telas com esse endpoint e com as futuras funcionalidades sera feita de forma
incremental.
