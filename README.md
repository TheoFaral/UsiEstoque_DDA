# UsiEstoque DDA

Projeto desenvolvido na disciplina Projeto Aplicado IV para a DDA Usinagem Industrial Ltda.

O objetivo do sistema é controlar o estoque de pastilhas industriais, registrando entradas, saídas, saldo disponível, estoque mínimo e localização dos itens.

## Tecnologias usadas no projeto

- React e Vite no frontend
- Node.js e Express no backend
- MySQL no banco de dados
- Axios para comunicação com a API
- Jest e Supertest nos testes do backend

## Organização das pastas

- `frontend/` - interface do sistema
- `backend/` - API
- `database/` - diagramas e scripts do banco
- `docs/` - decisões e anotações técnicas

## Branches

- `main` - versão estável
- `develop` - integração do desenvolvimento
- branches de trabalho - usadas para cada atividade antes do pull request

## Executar o projeto

Instale as dependências do backend:

```bash
cd backend
npm install
```

Depois instale as dependências do frontend:

```bash
cd ../frontend
npm install
```

Na raiz do projeto, abra dois terminais.

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Endereços usados nesta etapa:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api/health`

## Repositório

https://github.com/TheoFaral/UsiEstoque_DDA
