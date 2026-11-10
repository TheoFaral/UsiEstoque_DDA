# Scripts SQL complementares

Esta pasta contém scripts SQL auxiliares do UsiEstoque DDA. O esquema oficial do banco permanece em `database/usiestoque_V2.sql`.

## Carga de dados demonstrativos

Arquivo: `UsiEstoque_DDA_Dados_Demonstracao.sql`

O script prepara dados fictícios para demonstrar as funcionalidades do sistema, incluindo:

- 5 usuários: 1 Administrador, 3 Operadores ativos e 1 Operador inativo.
- 10 tipos de pastilhas.
- 5 fabricantes e 4 fornecedores.
- 5 locais de armazenamento.
- 16 itens de estoque.
- 29 movimentações de entrada, saída e ajuste.

Os tipos de pastilhas representam aplicações reais de usinagem. Os códigos `DEMO-*`, os saldos, as movimentações e os vínculos entre itens e fabricantes são demonstrativos.

## Pré-requisitos

1. Utilizar MySQL 8.0.16 ou superior.
2. Preparar um banco isolado com o esquema oficial do UsiEstoque DDA.
3. Confirmar a existência das sete tabelas, quatro views, uma procedure e dois triggers.
4. Verificar que as sete tabelas estão vazias.
5. Selecionar explicitamente o banco de demonstração antes de executar a carga.

O banco local preparado para a Etapa 8 é `usiestoque_e8_demo`.

## Execução

No MySQL Workbench, abrir `UsiEstoque_DDA_Dados_Demonstracao.sql` e confirmar que o banco selecionado é o banco demonstrativo.

Executar o script completo uma única vez, após conferir os pré-requisitos.

O arquivo não cria nem altera a estrutura do banco. As movimentações são registradas pela procedure `sp_registrar_movimentacao`, respeitando as regras de controle de saldo e histórico.

Se ocorrer algum erro durante a execução, interromper o procedimento, verificar os dados já registrados e não repetir a carga automaticamente.

## Conferência dos dados

Após a execução, verificar:

- Quantidade de registros nas tabelas.
- Saldos dos itens e situações de estoque.
- Histórico das entradas, saídas e ajustes.
- Funcionamento dos filtros e relatórios.
- Autenticação e permissões dos usuários demonstrativos.

Essas verificações devem ser realizadas antes de utilizar os dados na demonstração do sistema.

## Segurança e cuidados

- Não executar a carga em bancos com dados reais ou que precisem ser preservados.
- Não publicar senhas, tokens ou arquivos de credenciais no GitHub.
- O SQL contém hashes bcrypt das senhas, sem armazená-las em texto claro.
- As credenciais de demonstração devem permanecer em arquivo privado.
- Não executar novamente o esquema oficial para inserir dados demonstrativos.
- Não executar `seed:dev` sobre o banco demonstrativo sem avaliar previamente seus efeitos.

A carga demonstrativa destina-se exclusivamente à apresentação e verificação funcional do UsiEstoque DDA.
