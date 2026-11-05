# UsiEstoque DDA

Sistema web desenvolvido como parte do Projeto Aplicado IV do curso de Análise e Desenvolvimento de Sistemas do Centro Universitário SENAI Santa Catarina, a partir de uma demanda da DDA Usinagem Industrial Ltda.

O projeto tem como objetivo melhorar o controle de estoque de pastilhas industriais utilizadas nos processos de usinagem, substituindo registros em planilhas por uma aplicação que centraliza cadastros, movimentações, saldos e informações para acompanhamento e reposição dos materiais.

## Funcionalidades

O sistema possui dois perfis de acesso: Administrador e Operador de Estoque.

O Administrador pode gerenciar usuários, itens, tipos de pastilha, fabricantes, fornecedores e locais de armazenamento. Também pode registrar entradas, saídas e ajustes de estoque, sendo obrigatória a justificativa para os ajustes.

O Operador pode consultar itens, registrar entradas e saídas, acompanhar o histórico de movimentações e acessar o painel e os relatórios. Não possui permissão para administrar cadastros ou registrar ajustes de estoque.

As principais funcionalidades incluem:

- Cadastro, edição e inativação de itens e cadastros auxiliares.
- Busca de itens por código ou descrição e utilização de filtros combináveis.
- Registro de entradas com identificação do fornecedor.
- Registro de saídas com validação do saldo disponível.
- Ajustes administrativos de entrada e saída, com justificativa.
- Histórico de movimentações com filtros por item, tipo e período.
- Definição de estoque mínimo individual por item.
- Identificação de itens com estoque crítico ou sem estoque.
- Painel com indicadores e as dez movimentações mais recentes.
- Relatórios de saldo atual, consumo, movimentações detalhadas e necessidade de reposição.

O registro das movimentações utiliza uma procedure no MySQL, responsável pelas validações e pela atualização do saldo e do histórico na mesma transação.

## Tecnologias utilizadas

O projeto utiliza as seguintes tecnologias:

- Frontend: React, Vite, JavaScript, React Router e Axios.
- Backend: Node.js, Express e JavaScript.
- Banco de dados: MySQL, Sequelize e mysql2.
- Autenticação: JWT e bcryptjs.
- Testes: Jest e Supertest.
- Versionamento: Git e GitHub.

A aplicação segue uma arquitetura cliente-servidor, com comunicação entre o frontend e a API REST. O backend organiza suas responsabilidades em rotas, controllers, services, models e middlewares.

## Organização do projeto

A estrutura principal está organizada da seguinte forma:

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
│   └── tests/
├── database/
│   ├── diagrams/
│   ├── scripts/
│   └── usiestoque_V2.sql
├── docs/
├── frontend/
│   └── src/
└── README.md
```

## Requisitos para execução local

Para executar o projeto localmente, são necessários:

- Node.js 24, conforme a configuração dos arquivos `package.json`.
- npm compatível com a versão instalada do Node.js.
- MySQL 8.0.16 ou superior.
- Git, para obter e atualizar o repositório.

O sistema foi desenvolvido e validado em ambientes macOS e Windows.

## Obter o projeto

O repositório principal está disponível em:

https://github.com/TheoFaral/UsiEstoque_DDA

Para clonar o projeto:

```bash
git clone https://github.com/TheoFaral/UsiEstoque_DDA.git
cd UsiEstoque_DDA
git switch develop
```

A branch `develop` reúne as funcionalidades integradas durante o desenvolvimento. A branch `main` é destinada às versões estáveis do projeto.

## Instalar as dependências

Na raiz do projeto, execute:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Esses comandos instalam as dependências utilizadas pelo backend e pelo frontend.

## Preparar o banco de dados

O banco oficial do projeto está definido no arquivo `database/usiestoque_V2.sql`.

Antes de iniciar a aplicação, o servidor MySQL deve estar instalado e em funcionamento.

O script cria o banco `usiestoque_dda`, as tabelas, os relacionamentos, os índices, as views, a procedure de movimentações e as triggers de proteção do histórico.

Para importar o banco pelo MySQL Workbench:

1. Abra o MySQL Workbench e conecte-se ao servidor MySQL local.
2. Abra o arquivo `database/usiestoque_V2.sql`.
3. Execute o script completo.
4. Confira a criação do banco `usiestoque_dda` e das sete tabelas principais.

A importação deve ser realizada em uma instalação nova ou em um ambiente de desenvolvimento preparado para essa finalidade. Não execute novamente o script sobre um banco que já contenha dados sem avaliar previamente seus efeitos.

As instruções específicas do banco também estão disponíveis em `database/README.md`.

## Configurar as variáveis de ambiente

O backend utiliza variáveis de ambiente para configurar a conexão com o banco, a autenticação e a porta da API.

Na pasta `backend`, faça uma cópia do arquivo `.env.example` com o nome `.env`.

Configure os campos de acordo com o ambiente local.

As variáveis utilizadas são:

`NODE_ENV`: identifica o ambiente de execução.

`PORT`: define a porta utilizada pela API.

`FRONTEND_URL`: informa o endereço do frontend autorizado a acessar a API.

`DB_HOST`: informa o endereço do servidor MySQL.

`DB_PORT`: define a porta utilizada pelo MySQL.

`DB_NAME`: informa o nome do banco de dados.

`DB_USER`: identifica o usuário utilizado na conexão com o banco.

`DB_PASSWORD`: informa a senha desse usuário.

`JWT_SECRET`: contém a chave utilizada para assinar os tokens de autenticação.

`JWT_EXPIRES_IN`: define o tempo de expiração dos tokens.

`SEED_ADMIN_NAME`: define o nome do Administrador inicial.

`SEED_ADMIN_EMAIL`: define o e-mail do Administrador inicial.

`SEED_ADMIN_PASSWORD`: define a senha do Administrador inicial.

A variável `JWT_SECRET` deve receber uma chave própria e segura para o ambiente utilizado.

O arquivo `.env` contém informações locais e não deve ser publicado no repositório.

O frontend utiliza o arquivo `frontend/.env.example` como referência para a variável `VITE_API_URL`, cujo endereço local padrão é `http://localhost:3000/api`.

## Verificar a conexão com o banco

Com o MySQL em funcionamento e o backend configurado, execute na raiz do projeto:

```bash
npm --prefix backend run db:check
```

Quando a conexão e as tabelas esperadas estiverem disponíveis, o script deverá apresentar:

```text
Conexão MySQL OK. Esquema usiestoque_V2 validado.
```

Essa verificação confirma a conexão e a presença das tabelas principais, mas não substitui a validação funcional das operações do sistema.

## Criar o Administrador inicial

Em uma instalação nova, configure as variáveis `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` no arquivo `backend/.env`.

Depois execute:

```bash
npm --prefix backend run seed:admin
```

O script cria o Administrador caso não exista um usuário com o e-mail configurado.

Se o usuário já existir, o script informa sua existência e não substitui automaticamente sua senha.

O cadastro inicial não precisa ser repetido quando o banco já possui um Administrador válido.

## Dados para demonstração

O backend também possui o comando:

```bash
npm --prefix backend run seed:dev
```

Esse script cadastra dados básicos de desenvolvimento, utilizando verificações para evitar a recriação de determinados registros já existentes.

Seu uso é opcional e deve ocorrer apenas em ambientes preparados para desenvolvimento ou demonstração, após conferir os dados existentes.

## Executar o sistema

Após configurar o banco e instalar as dependências, abra dois terminais na raiz do projeto.

No primeiro terminal, inicie o backend:

```bash
npm run dev:backend
```

A API estará disponível, por padrão, em:

`http://localhost:3000`

Para verificar o funcionamento básico da API, acesse:

`http://localhost:3000/api/health`

No segundo terminal, inicie o frontend:

```bash
npm run dev:frontend
```

A interface estará disponível, por padrão, em:

`http://localhost:5173`

Os dois processos devem permanecer em execução durante a utilização do sistema.

## Executar as verificações automatizadas

Os testes existentes do backend são executados com:

```bash
npm --prefix backend test
```

Para verificar a qualidade estática do frontend:

```bash
npm --prefix frontend run lint
```

Para gerar o build do frontend:

```bash
npm --prefix frontend run build
```

Na última regressão documentada pela equipe, realizada sobre a branch `develop` no commit `0eace58`, foram aprovados 24 testes Jest distribuídos em cinco suítes. A execução do ESLint e a geração do build também foram concluídas sem erros.

Esses resultados correspondem à versão verificada em outubro de 2026 e não substituem novas verificações após alterações no código.

## Controle de versão

O desenvolvimento utiliza Git e GitHub, com a branch `develop` destinada à integração das funcionalidades e a `main` destinada às versões estáveis.

As atividades foram desenvolvidas em branches específicas e integradas por meio de pull requests.

Os commits e pull requests permitem acompanhar as contribuições de Luiz e Theo durante as etapas do projeto.

## Repositório

Repositório principal:

https://github.com/TheoFaral/UsiEstoque_DDA

O código-fonte, o histórico de desenvolvimento e os testes automatizados estão disponíveis no repositório.
