# Hemo Connect

## Descrição

Frontend do Hemo Connect, plataforma que facilita o agendamento de doações,
aproxima doadores dos hemocentros e incentiva uma frequência maior de doações.

O icone da guia do navegador (favicon) utiliza
[`images/favicon.png`](images/favicon.png), configurado no
[`index.html`](index.html). Essa versao de 64 x 64 pixels remove as margens
transparentes para o simbolo ocupar o espaco da guia, mantendo a proporcao.
A imagem original [`images/Site Logo Nav.png`](images/Site%20Logo%20Nav.png)
permanece preservada.

### Identidade visual

O logo oficial para fundos claros esta em
[`images/logo-hemo-connect-para-fundo-claro.png`](images/logo-hemo-connect-para-fundo-claro.png).
O componente [`BrandLogo`](src/components/BrandLogo.tsx) centraliza sua exibicao
nas telas de autenticacao, paineis, perfil/privacidade e telas legadas.
A exportacao de dados em PDF utiliza o mesmo arquivo.

Use `<BrandLogo />` em formularios e `<BrandLogo compact />` em cabecalhos.
As dimensoes intrinsecas de 1760 x 440 reservam espaco antes do carregamento;
o CSS preserva a proporcao e limita a largura ao container. O texto alternativo
inclui a marca e o slogan. Nao aplique filtros, distorcoes nem fundos escuros:
esta versao foi desenhada para superficies claras. O slogan faz parte do PNG
e nao deve substituir instrucoes ou outros textos essenciais da interface.

O Vite importa o logo como asset versionado, incluindo-o no build de producao
com URL gerenciada. O favicon permanece com o simbolo compacto, mais legivel
na guia do navegador do que a assinatura horizontal.

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
- cadastro como doador ou solicitacao de enfermagem com COREN/UF e conta
  inativa ate conferencia e aprovacao administrativa;
- painel administrativo de aprovacao com selecao de hemocentro ativo e
  confirmacao explicita da conferencia profissional e de identidade;
- cadastro e listagem de hemocentros nas areas de administrador e enfermeiro;
- area logada com home, perfil e central de direitos do titular;
- exportacao de dados do titular em PDF;
- fluxo de revogacao de consentimento e exclusao/anonimizacao de conta.
- area de enfermagem com indicadores reais, fila, filtros, consulta de
  pre-triagem/historico, avaliacao e finalizacao;
- agendas por unidade e reserva de vagas, com cancelamento, remarcacao e historico;
- confirmacao de chegada pela recepcao com protecao contra lista desatualizada.

## Rotas principais

| Rota | Finalidade |
| --- | --- |
| `/login` | Acesso principal da aplicacao. |
| `/cadastro` | Cadastro de doador ou solicitacao de enfermagem com COREN e UF. |
| `/users-approve` | Administrador: conferir e aprovar enfermeiros pendentes. |
| `/hemocentros` | Administrador e enfermeiro: listar unidades e cadastrar novos hemocentros. |
| `/agenda` | Administrador ou responsavel da propria unidade: configurar/publicar agenda. |
| `/hemocentros/:id/horarios` | Autenticado: consultar disponibilidade da unidade. |
| `/forgot-password` | Solicitacao de link para redefinir senha. |
| `/reset-password` | Definicao de nova senha com token. |
| `/two-factor` | Confirmacao do segundo fator de autenticacao. |
| `/home` | Painel inicial da area logada. |
| `/perfil` | Dados da conta e direitos do titular (LGPD). |
| `/enfermeiro` | Painel e fila de triagens do hemocentro vinculado. |
| `/enfermeiro/triagens` | Lista de triagens com filtros e paginacao. |
| `/enfermeiro/triagens/:id` | Consulta, inicio, avaliacao e resultado da triagem. |
| `/recepcao` | Confirmacao de chegada de doadores. |
| `/agendamentos` | Doador: escolher vaga, revisar, reservar, cancelar/remarcar e consultar historico. |

## Como usar a agenda

1. Administrador: abra **Gerenciar agendas**, selecione o hemocentro e configure
   fuso IANA, duracao, capacidade, antecedencia, horizonte, prazos, expediente e
   excecoes. O responsavel institucional gerencia somente sua unidade.
2. Revise as reservas legadas exibidas. Salvar concilia as compativeis; conflitos
   impedem salvar e precisam ser resolvidos sem cancelar registros silenciosamente.
3. Marque a publicacao e salve. Uma unidade cadastrada, mas sem agenda publicada,
   nao aceita reservas; suspender a publicacao nao cancela as reservas existentes.
4. Doador: abra **Agendamentos**, selecione unidade, data e horario, revise o
   resumo e confirme. As vagas sao revalidadas no backend na confirmacao.
5. Nas reservas pendentes, use **Cancelar** ou **Remarcar** dentro dos prazos
   exibidos. A remarcacao e para a mesma unidade; uma falha preserva a vaga original.

Horarios e prazos usam o fuso da unidade, nao o do dispositivo. Reservas cheias,
indisponibilidade e erros aparecem explicitamente; atualize antes de repetir em
caso de conflito. A mesma tentativa usa UUID estavel para evitar duplicidade.
O historico mostra reserva, remarcacao, cancelamento e conciliacao, tambem na
central de privacidade e no PDF. Reservas antigas sem conciliacao nao podem ser
remarcadas ate serem vinculadas a horarios validos. Chegada confirmada bloqueia
alteracoes pelo doador. Nao ha lembretes automaticos neste MVP.

O editor avisa sobre alteracoes nao salvas ao sair pelo menu ou fechar/recarregar
a pagina; o seletor de horarios oferece estados de carregamento, vazio e erro.

## Seguranca

O botao **Hemocentros** aparece no cabecalho para administradores e enfermeiros.
O cadastro exige nome, endereco, telefone e situacao (`ATIVO` ou `INATIVO`).
O backend valida a permissao e os limites dos campos; cadastrar uma unidade
nao altera o vinculo institucional do usuario nem concede edicao ou exclusao
ao enfermeiro. Publique o backend atualizado junto com este frontend para
liberar a nova permissao de criacao.

O perfil real e o token de sessao sao retornados pelo backend apos o 2FA.
O cliente guarda o token em `sessionStorage`, envia `Authorization: Bearer`
e valida a identidade em `/auth/me` ao recarregar. `X-User-Email` nao autentica.
As rotas e os dados sao autorizados pelo backend por perfil, hemocentro e autoria.

Publique este frontend junto do backend atualizado e aplique as migrations
documentadas em `docs/VISAO_ENFERMEIRO.md` no repositorio `be-hemo-connect`.
Clientes antigos precisam efetuar novo login.
Para as reservas, aplique tambem `sql/003_agenda_reservas.sql` no backend
e restaure suas dependencias antes de publicar ambos os projetos. O contrato de
reserva agora usa `horario_id`/UUID, e a recepcao envia `versao` ao confirmar.
Homologue concorrencia/migration em PostgreSQL com `TEST_POSTGRES_URL`;
os testes SQLite nao substituem essa validacao.

Para este cadastro, aplique tambem `sql/002_cadastro_enfermeiro_coren.sql`
no backend antes do deploy. O numero informado e sua UF nao equivalem a
validacao oficial: o administrador confere externamente a habilitacao
e a identidade, vincula o hemocentro e aprova. Nao ha consulta automatica
ao COREN nem e-mail automatico de aprovacao. Enfermeiros pendentes nao
podem realizar login; doadores mantem o cadastro ativo.
A politica de privacidade v1.2 informa a coleta e finalidade profissional;
COREN/UF constam na central de privacidade e na exportacao PDF.

O formulario de enfermagem registra observacoes e resultado; nao cria regras
clinicas. O questionario oficial, a coleta/doacao
e a visao medica nao fazem parte desta base.

O requisito 3 (Criptografia e Comunicacao Segura) foi consolidado na
documentacao:

- `docs/SECURITY.md`
- `docs/releases/criptografia (requisito 3)/RELEASE_requisito_03.md`

## Documentacao complementar

- `docs/LGPD.md`
- `docs/releases/conformidade lgpd (requisito 4)/RELEASE_requisito_04.md`
