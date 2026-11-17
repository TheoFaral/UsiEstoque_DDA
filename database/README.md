# Banco de dados do UsiEstoque DDA

O UsiEstoque DDA utiliza MySQL para armazenar usuários, cadastros auxiliares, itens, saldos e movimentações de estoque. O esquema oficial e suas regras de integridade estão definidos em `database/usiestoque_V2.sql`.

## Arquivo oficial e requisitos

- **Arquivo:** `database/usiestoque_V2.sql`.
- **Banco criado:** `usiestoque_dda`.
- **Versão mínima:** MySQL 8.0.16, necessária para a aplicação efetiva das restrições `CHECK` utilizadas no esquema.

O script contém sete tabelas, índices, quatro views, a procedure `sp_registrar_movimentacao` e duas triggers de proteção do histórico.

## Tabelas

- `usuarios`: dados de acesso, perfil Administrador ou Operador e situação ativa.
- `tipos_pastilha`: classificação das pastilhas industriais.
- `fabricantes`: cadastro de fabricantes.
- `fornecedores`: fornecedores utilizados nas entradas.
- `locais_armazenamento`: locais de armazenamento dos materiais.
- `itens`: código, descrição, vínculos com os cadastros auxiliares, estoque mínimo, saldo e situação ativa.
- `movimentacoes`: entradas, saídas, ajustes, quantidades, saldos anterior e posterior, usuário responsável, data e demais informações da operação.

Cada item está vinculado a um tipo de pastilha, um fabricante e um local de armazenamento. O histórico registra o usuário e o item envolvidos na movimentação.

## Movimentações e integridade

A procedure `sp_registrar_movimentacao` centraliza a inclusão de movimentações e a atualização de saldo.

Ela verifica a existência e a situação ativa do usuário e do item, restringe ajustes ao perfil Administrador, exige justificativa para ajustes, valida o fornecedor nas entradas e impede saídas acima do saldo disponível. O fornecedor deve ser informado nas entradas e não deve ser informado nas saídas ou nos ajustes.

A operação utiliza transação SQL, bloqueios `FOR UPDATE` e tratamento de falhas com `ROLLBACK`. O saldo do item e o registro de movimentação são atualizados dentro da mesma transação. A coluna `chave_requisicao` possui restrição de unicidade e é utilizada para reconhecer requisições já registradas.

Correções de saldo devem ocorrer por novas movimentações previstas pelo sistema, e não por edição direta do histórico.

## Proteção do histórico

As duas triggers abaixo impedem a alteração ou exclusão direta dos registros da tabela `movimentacoes`:

- `trg_movimentacoes_bloquear_alteracao`.
- `trg_movimentacoes_bloquear_exclusao`.

## Views

- `vw_saldo_estoque`: itens cadastrados e saldos, com indicação da situação de estoque.
- `vw_itens_criticos`: itens ativos com saldo igual ou inferior ao estoque mínimo.
- `vw_historico_movimentacoes`: movimentações relacionadas a itens, usuários e fornecedores.
- `vw_consumo_diario`: quantidade diária consumida por item, considerando saídas e ajustes de saída.

## Preparação inicial no MySQL Workbench

1. Inicie o MySQL e conecte-se ao servidor pelo MySQL Workbench.
2. Abra o arquivo `database/usiestoque_V2.sql`.
3. Confira se o arquivo foi carregado integralmente.
4. Execute o script completo em uma instalação nova.
5. Atualize a lista de schemas e confira o banco `usiestoque_dda`.
6. Confira a criação das tabelas e dos demais objetos.

**Atenção:** o arquivo oficial possui instruções `CREATE TABLE` e outros comandos de definição de estrutura. Ele não é um procedimento de migração para um banco já populado. Não o reaplique sobre dados existentes sem backup e plano de mudança aprovado.

## Consultas para conferência

Para listar separadamente as tabelas e as views do esquema:

```sql
SELECT TABLE_NAME, TABLE_TYPE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'usiestoque_dda'
ORDER BY TABLE_TYPE, TABLE_NAME;
```

A consulta deve permitir identificar sete tabelas do tipo `BASE TABLE` e quatro objetos do tipo `VIEW`, desde que o esquema oficial tenha sido criado integralmente.

Também é possível consultar os demais objetos:

```sql
SHOW PROCEDURE STATUS WHERE Db = 'usiestoque_dda';
SHOW TRIGGERS FROM usiestoque_dda;
```

Essas consultas identificam os objetos instalados, mas não substituem testes das regras de negócio.

## Configuração do backend

O backend usa Sequelize e o driver `mysql2` para acessar o banco. As variáveis de conexão estão documentadas em `backend/.env.example` e devem ser configuradas em `backend/.env` no ambiente local:

- `DB_HOST`: endereço do servidor.
- `DB_PORT`: porta do MySQL.
- `DB_NAME`: nome do banco, normalmente `usiestoque_dda` no ambiente local.
- `DB_USER`: usuário da conexão.
- `DB_PASSWORD`: senha correspondente.

Não publique o conteúdo do `.env` ou credenciais reais no GitHub. Em ambientes publicados, utilize credenciais e permissões adequadas ao serviço.

## Verificar a conexão

Com o banco criado e o backend configurado, execute na raiz do repositório:

```bash
npm --prefix backend run db:check
```

A saída esperada para uma conexão válida com as tabelas necessárias é:

```text
Conexão MySQL OK. Esquema usiestoque_V2 validado.
```

O comando executa `backend/src/database/checkConnection.js` e verifica a presença das sete tabelas principais. Ele não confirma, sozinho, o funcionamento de todas as views, triggers, procedimentos e operações da aplicação.

## Administrador inicial e dados de desenvolvimento

Para criar o Administrador inicial, configure `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` em `backend/.env` e execute:

```bash
npm --prefix backend run seed:admin
```

O script `backend/src/database/createAdmin.js` verifica se o e-mail informado já está cadastrado. Caso esteja, não cria uma segunda conta e não substitui automaticamente a senha existente.

O comando opcional abaixo prepara registros básicos de desenvolvimento:

```bash
npm --prefix backend run seed:dev
```

Ele executa `backend/src/database/seedDevelopment.js`, que inclui cadastros e um item de exemplo quando ainda não existem registros correspondentes. Verifique a base antes de executá-lo.

## Organização dos arquivos SQL

- `database/usiestoque_V2.sql`: criação do esquema oficial.
- `database/README.md`: documentação do banco e de sua preparação.
- `database/scripts/README.md`: orientações sobre scripts SQL complementares.
- `database/scripts/`: local reservado para scripts auxiliares, incluindo a futura carga de dados demonstrativos.

O SQL de dados demonstrativos deverá ser mantido separado do esquema oficial. Antes de sua execução, será necessário conferir o banco de destino, possíveis registros existentes e as regras de integridade. Movimentações de demonstração deverão respeitar a procedure de movimentações.

O backend não usa `sequelize.sync()` nem migrations para criar automaticamente o esquema. Alterações estruturais futuras deverão ser documentadas e compatibilizadas com os modelos e serviços da aplicação.

Repositório principal: https://github.com/TheoFaral/UsiEstoque_DDA
