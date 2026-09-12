# LGPD - Inventario e Governanca de Dados (Frontend)

Este documento consolida a base de conformidade do Requisito 4 para o frontend.

## 1. Escopo

- Sistema: Hemo Connect Frontend
- Repositorio: fe-hemo-connect
- Modulos avaliados: cadastro, login, 2FA, recuperacao e reset

## 2. Inventario de dados pessoais coletados no cliente (4.1)

| Campo | Tela/fluxo | Classificacao | Persistencia no cliente |
|---|---|---|---|
| nome | Cadastro | Dado pessoal comum | Estado em memoria durante a sessao |
| cpf | Cadastro | Dado pessoal de identificacao civil | Estado em memoria durante a sessao |
| email | Cadastro, login, forgot password, 2FA | Dado pessoal comum | Estado em memoria durante a sessao |
| senha | Cadastro, login, reset | Credencial | Estado em memoria durante a sessao |
| confirmacaoSenha | Cadastro e reset | Credencial derivada para validacao local | Estado em memoria durante a sessao |
| token (query string) | Reset de senha | Dado temporario de seguranca | URL e envio ao backend |

## 3. Associacao dado -> finalidade (4.2)

| Campo | Finalidade principal | Observacao |
|---|---|---|
| nome, cpf, email | Cadastrar e identificar doador | Envio ao backend de cadastro |
| senha e confirmacao | Validar e enviar credencial de acesso | Confirmacao usada apenas no cliente |
| email e code 2FA | Confirmar autenticacao forte | Envio ao backend de verificacao |
| token reset | Autorizar redefinicao de senha | Envio ao backend de reset |

## 4. Evidencia de minimizacao de dados (4.3)

- o frontend nao armazena senha em localStorage/sessionStorage;
- confirmacao de senha e usada apenas para validacao local;
- respostas de autenticacao nao carregam `senha` ou `senha_hash`;
- dados sensiveis sao enviados somente aos endpoints necessarios.

Lacunas para proxima fase:
- adicionar consentimento explicito no formulario de cadastro;
- adicionar central de privacidade para titular consultar/exportar/excluir dados;
- registrar versao do termo no fluxo de aceite.

## 5. Fluxo documentado de atendimento aos direitos (4.11)

No frontend, o fluxo deve oferecer:
1. entrada de solicitacao do titular em area de privacidade;
2. autenticacao reforcada antes de acao critica;
3. feedback visual de protocolo, status e conclusao;
4. acesso ao historico de solicitacoes do titular.

## 6. Estado atual da implementacao

- cadastro com consentimento explicito obrigatorio;
- envio de finalidades e versao do termo para persistencia no backend;
- central de privacidade para consultar, exportar, revogar consentimento e excluir/anonimizar dados;
- feedback visual de sucesso e erro em todas as operacoes LGPD.

Risco residual conhecido:
- a robustez final do controle de titular depende da evolucao do mecanismo de sessao/autorizacao no backend.
