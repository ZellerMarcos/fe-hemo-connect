# Release DevSecOps Pipeline - Hemo Connect

Data de referencia da entrega: 12/11/2026.

## Resumo

Release documental da esteira DevSecOps basica do Hemo Connect: varredura de
segredos (TruffleHog), analise de dependencias (Trivy) e analise estatica de
seguranca (Semgrep OSS), executadas pelo arquivo
`.github/workflows/devsecops-pipeline.yml` nos repositorios backend e frontend.

**Status: preparada somente localmente. Nenhuma tag, release ou publicacao
no GitHub foi criada. A data de 12/11/2026 e a referencia da entrega, nao
uma publicacao realizada.**

Pela regra da atividade, a release publicada deve existir com pelo menos 24
horas de antecedencia da entrega na pasta de Projetos. Se a entrega ocorrer em
12/11/2026, a publicacao deve acontecer ate 11/11/2026 no mesmo horario.

## Conteudo

- `docs/RELATORIO_TECNICO_DEVSECOPS.md` e `docs/Relatorio_Tecnico_DevSecOps_Hemo_Connect.pdf`:
  relatorio tecnico com identificacao dos integrantes.
- Workflows `devsecops-pipeline.yml` no backend e no frontend, sem alteracao
  nesta release.
- Atualizacao do Vite para 7.3.7 no frontend (CVE-2026-112942), ja integrada
  em `main` antes desta release.

## Integrantes

- Marcos Vinicius Frazao Zeller - RA 11241103648.
- William Donizetti Balbino de Morais - RA 11241102384.

## Evidencias verificadas

- Execucoes aprovadas dos quatro jobs em pull request e em `main` nos dois
  repositorios (consulta a API do GitHub em 05/11/2026).
- Bloqueio real do Trivy no frontend (vite 7.3.6, HIGH), corrigido.
- Teste local controlado reproduzindo o bloqueio do Trivy com saida 1.
- Quatro prints reais do Job Green (PR e `main`, backend e frontend) em
  `docs/evidencias/pipeline-basico`, inseridos na secao 5 do relatorio.
- Ruleset `proteger-main` ativo nos dois repositorios (Pull Request e checks
  obrigatorios, confirmado pela API publica em 05/11/2026), com os prints em
  `docs/evidencias/pipeline-basico` inseridos na secao 6 do relatorio.

## Pendencias antes da entrega

1. Confirmar que `docs/Requisitos.pdf` e o documento citado como "Requisitos 1.pdf".
2. Versionar estes arquivos, publicar a release com antecedencia minima de
   24 horas e anexar o PDF.
3. Enviar individualmente o link do repositorio e o PDF pelo Teams e
   disponibilizar o material do grupo na pasta de Projetos.

## Limites

A esteira nao certifica seguranca nem conformidade com a LGPD. O TruffleHog
esta configurado com `--only-verified` e pode nao reportar segredos que nao
possam ser verificados externamente. O Semgrep OSS usa `ERROR` como nivel
bloqueante, que nao e equivalente oficial a ALTA ou CRITICA.
