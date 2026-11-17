# ADR 001 - Estrutura inicial do projeto

## Situação

Definida para a primeira etapa.

## Motivo

O projeto será desenvolvido por Luiz e Theo em computadores diferentes. Para evitar que os dois alterem os mesmos arquivos ao mesmo tempo, o frontend e o backend ficarão separados dentro do mesmo repositório.

## Decisão

A estrutura inicial terá as pastas `frontend`, `backend`, `database` e `docs`.

A branch `main` ficará para versões estáveis. O desenvolvimento será reunido em `develop`. Cada atividade será feita em uma branch própria e enviada para revisão por pull request.

Nesta primeira etapa, o frontend será feito com React e Vite e o backend com Node.js e Express. A comunicação entre os dois será conferida pela rota `GET /api/health`.

## Efeito desta decisão

- Luiz e Theo podem trabalhar em partes diferentes do projeto.
- Frontend e backend podem ser executados separadamente.
- As alterações ficam registradas em commits e pull requests.
- Banco de dados, autenticação e regras de estoque serão acrescentados nas próximas etapas.
