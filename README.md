# UsiEstoque DDA

O UsiEstoque DDA é um sistema web para controle de estoque de pastilhas industriais utilizadas em processos de usinagem. O projeto foi desenvolvido no Projeto Aplicado IV do curso de Análise e Desenvolvimento de Sistemas do Centro Universitário SENAI Santa Catarina, a partir de uma demanda da DDA Usinagem Industrial Ltda.

A aplicação reúne cadastros, movimentações, consulta de saldos, acompanhamento de estoque mínimo e relatórios em um único ambiente.

## Funcionalidades

- Cadastro, edição, consulta e inativação de itens.
- Manutenção de tipos de pastilha, fabricantes, fornecedores e locais de armazenamento.
- Busca de itens por código ou descrição e filtros por tipo, fabricante, local e situação.
- Registro de entradas com identificação do fornecedor.
- Registro de saídas com verificação do saldo disponível.
- Ajustes de entrada e saída, restritos ao Administrador e com justificativa obrigatória.
- Consulta do histórico de movimentações, com filtros por item, tipo e período.
- Estoque mínimo por item e identificação de materiais em situação crítica.
- Painel com indicadores e movimentações recentes.
- Relatórios de saldos, consumo, movimentações detalhadas e necessidade de reposição.

O sistema utiliza dois perfis de acesso:

- **Administrador:** gerencia usuários, itens e cadastros auxiliares; registra movimentações e ajustes; consulta painel e relatórios.
- **Operador:** consulta itens, registra entradas e saídas e acessa histórico, painel e relatórios. Não administra cadastros nem executa ajustes.

A autenticação é realizada por JWT. O frontend verifica a validade da sessão, trata respostas de não autorização e redireciona para o login quando a sessão expira. As páginas internas exigem autenticação.

## Tecnologias e organização

- **Frontend:** React, Vite, React Router e Axios.
- **Backend:** Node.js, Express e API REST.
- **Banco de dados:** MySQL, com acesso pelo Sequelize e pelo driver mysql2.
- **Autenticação:** JWT e bcryptjs.
- **Testes:** Jest e Supertest no backend; ESLint e build Vite no frontend.
- **Versionamento:** Git e GitHub.

O fluxo principal da aplicação é: interface React, requisições Axios, API Express, regras de negócio e banco MySQL. As movimentações são processadas pela procedure `sp_registrar_movimentacao`, responsável pelas validações e pela atualização do saldo e do histórico na mesma transação.

## Estrutura do repositório

A árvore abaixo apresenta os diretórios e arquivos principais, sem listar todos os arquivos internos.

```text
UsiEstoque_DDA/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── database/
│   ├── scripts/
│   │   └── README.md
│   ├── usiestoque_V2.sql
│   └── README.md
├── docs/
│   └── decisoes/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

As orientações específicas do banco estão em [`database/README.md`](database/README.md). A pasta [`database/scripts`](database/scripts) é reservada para scripts complementares. As decisões técnicas ficam em `docs/decisoes`.

## Requisitos para execução local

- Node.js 24 e npm compatível.
- MySQL 8.0.16 ou superior.
- Git para obter e atualizar o projeto.

O projeto foi executado em ambientes macOS e Windows.

## Obter o código

```bash
git clone https://github.com/TheoFaral/UsiEstoque_DDA.git
cd UsiEstoque_DDA
git switch develop
```

A branch `develop` reúne as funcionalidades integradas durante o desenvolvimento. A branch `main` é reservada para a linha estável.

## Instalar as dependências

Na raiz do repositório, execute:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Preparar o banco de dados

O esquema oficial está em `database/usiestoque_V2.sql`. Ele cria o banco `usiestoque_dda`, sete tabelas, índices, quatro views, uma procedure e duas triggers de proteção do histórico.

Para uma instalação nova:

1. Inicie o servidor MySQL e abra uma conexão no MySQL Workbench.
2. Abra `database/usiestoque_V2.sql`.
3. Execute o arquivo completo.
4. Confirme a criação do banco e dos objetos esperados.

**Atenção:** o script é destinado à preparação inicial do esquema. Não o execute novamente sobre um banco com dados sem backup e avaliação prévia. Consulte os detalhes em [`database/README.md`](database/README.md).

## Configurar o backend

Crie `backend/.env` a partir de `backend/.env.example` e ajuste os parâmetros locais:

- `NODE_ENV` e `PORT`: ambiente e porta da API.
- `FRONTEND_URL`: origem autorizada do frontend.
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`: conexão MySQL.
- `JWT_SECRET` e `JWT_EXPIRES_IN`: assinatura e validade dos tokens.
- `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`: cadastro do Administrador inicial, quando necessário.

Use uma chave JWT própria para cada ambiente. O arquivo `.env` não deve ser versionado, pois pode conter credenciais.

O frontend utiliza `frontend/.env.example` como referência. Quando necessário, crie `frontend/.env` e configure `VITE_API_URL`. No ambiente local, o endereço previsto é `http://localhost:3000/api`.

## Verificar o banco e criar o Administrador inicial

Com o MySQL configurado, execute:

```bash
npm --prefix backend run db:check
```

Em caso de sucesso, a saída esperada é:

```text
Conexão MySQL OK. Esquema usiestoque_V2 validado.
```

Esse comando verifica a conexão e a presença das sete tabelas principais. Ele não executa todos os cenários funcionais do sistema.

Em uma instalação nova, configure antes as variáveis `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`, depois execute:

```bash
npm --prefix backend run seed:admin
```

O script cria o Administrador se ainda não existir uma conta com o e-mail informado. Se a conta já existir, a senha não será substituída automaticamente.

Para dados básicos de desenvolvimento, há também o comando opcional:

```bash
npm --prefix backend run seed:dev
```

Esse comando utiliza registros de exemplo definidos no backend. Verifique os dados existentes antes de executá-lo e não o utilize indiscriminadamente em ambientes com informações reais.

## Iniciar a aplicação

Abra dois terminais na raiz do projeto.

No primeiro:

```bash
npm run dev:backend
```

A API utiliza, por padrão, a porta `3000`. A rota de verificação é `http://localhost:3000/api/health`.

No segundo:

```bash
npm run dev:frontend
```

A interface utiliza, por padrão, `http://localhost:5173`. Os dois processos devem permanecer ativos durante o uso local.

## Testes e verificações

Na raiz do repositório:

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

O primeiro comando executa os testes Jest do backend. Os demais verificam o código e geram o build do frontend. A aprovação desses comandos não substitui a conferência das funcionalidades no ambiente utilizado.

## Controle de versões

O trabalho é integrado na branch `develop`, por meio de branches específicas e Pull Requests. Antes de iniciar uma alteração, atualize a cópia local do repositório e confira o estado da árvore de trabalho.

Repositório principal: https://github.com/TheoFaral/UsiEstoque_DDA
