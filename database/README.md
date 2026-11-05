# Banco de dados — UsiEstoque DDA

O banco de dados do UsiEstoque DDA utiliza MySQL e armazena as informações necessárias ao controle de estoque de pastilhas industriais.

Sua estrutura contempla usuários, cadastros auxiliares, itens e movimentações de estoque. As regras de integridade são aplicadas por relacionamentos, restrições, índices, uma procedure transacional e triggers de proteção do histórico.

## Arquivo principal

O esquema oficial do banco está disponível em:

`database/usiestoque_V2.sql`

O script foi preparado para MySQL 8.0.16 ou superior, versão necessária para a aplicação efetiva das restrições `CHECK` utilizadas no modelo.

O banco criado pelo script recebe o nome:

`usiestoque_dda`

## Estrutura do banco de dados

O modelo contém sete tabelas principais.

A tabela `usuarios` armazena os usuários do sistema, seus perfis de acesso e a situação de ativação.

A tabela `tipos_pastilha` registra os tipos utilizados na classificação das pastilhas industriais.

A tabela `fabricantes` mantém as informações dos fabricantes dos itens.

A tabela `fornecedores` armazena os fornecedores utilizados nas entradas de estoque.

A tabela `locais_armazenamento` identifica os locais físicos onde os itens são armazenados.

A tabela `itens` mantém o cadastro dos materiais, seus vínculos com os cadastros auxiliares, o saldo atual e o estoque mínimo.

A tabela `movimentacoes` registra as entradas, saídas e ajustes de estoque, preservando os dados necessários ao histórico das operações.

Os itens possuem vínculos obrigatórios com tipo de pastilha, fabricante e local de armazenamento.

As movimentações registram o item, o tipo da operação, a quantidade, os saldos anterior e posterior, o usuário responsável, a data e hora e os demais campos aplicáveis.

O fornecedor é obrigatório nas entradas e não é utilizado nas saídas ou nos ajustes administrativos.

## Integridade das movimentações

As movimentações de estoque são processadas pela procedure `sp_registrar_movimentacao`.

Ela concentra as validações e a atualização transacional das operações de entrada, saída, ajuste de entrada e ajuste de saída.

Entre as regras aplicadas estão:

- Verificação da existência e da situação ativa do usuário.
- Restrição dos ajustes ao perfil Administrador.
- Exigência de justificativa nos ajustes administrativos.
- Verificação do fornecedor nas entradas.
- Validação da existência e da situação ativa do item.
- Bloqueio de saídas e ajustes de saída superiores ao saldo disponível.
- Atualização do saldo e registro do histórico na mesma transação.
- Reversão da operação em caso de falha.
- Utilização de chave única de requisição para evitar duplicações.

A procedure utiliza transações e bloqueio de registros com `FOR UPDATE`, para preservar a consistência das movimentações concorrentes.

## Proteção do histórico

O banco possui duas triggers responsáveis por impedir alterações e exclusões diretas de movimentações já registradas.

A trigger `trg_movimentacoes_bloquear_alteracao` impede a modificação dos registros existentes na tabela de movimentações.

A trigger `trg_movimentacoes_bloquear_exclusao` impede a exclusão desses registros.

Essas restrições preservam o histórico das operações. Correções de saldo devem ser realizadas por novas movimentações de ajuste, com a justificativa correspondente.

## Views disponíveis

O script também cria quatro views para consulta e consolidação das informações do estoque.

A view `vw_saldo_estoque` permite consultar os itens cadastrados e seus respectivos saldos.

A view `vw_itens_criticos` identifica os itens ativos cujo saldo é igual ou inferior ao estoque mínimo configurado.

A view `vw_historico_movimentacoes` reúne as informações das movimentações, incluindo os itens envolvidos e os usuários responsáveis.

A view `vw_consumo_diario` apresenta o consumo diário consolidado por item, considerando as movimentações de saída e ajuste de saída.

Essas views complementam as consultas realizadas pela aplicação.

## Preparação do ambiente

Antes de importar o esquema, é necessário ter o MySQL instalado e em funcionamento.

A importação pode ser feita por uma ferramenta de administração, como o MySQL Workbench, ou pelo cliente MySQL de linha de comando.

O procedimento abaixo considera uma instalação nova do banco.

### Importação pelo MySQL Workbench

1. Abra o MySQL Workbench.
2. Conecte-se ao servidor MySQL que será utilizado pelo projeto.
3. Acesse **File → Open SQL Script**.
4. Selecione o arquivo `database/usiestoque_V2.sql`.
5. Confira se o script foi carregado integralmente.
6. Execute o script completo.
7. Verifique se a execução foi concluída sem erros.
8. Atualize a lista de schemas e confirme a existência do banco `usiestoque_dda`.

O script contém os comandos de criação das tabelas e dos demais objetos necessários ao funcionamento do sistema.

Não é necessário executar a importação novamente quando o banco já estiver corretamente configurado.

Como o script contém instruções de criação de objetos, sua reexecução em um banco existente deve ser avaliada previamente. Não utilize esse procedimento como forma de corrigir problemas de conexão ou recuperar dados.

## Verificação das tabelas

Depois da importação, selecione o banco `usiestoque_dda` e confirme a existência das sete tabelas principais.

A consulta abaixo pode ser utilizada no MySQL Workbench:

```sql
USE usiestoque_dda;
SHOW TABLES;
```

O resultado deverá incluir as tabelas `usuarios`, `tipos_pastilha`, `fabricantes`, `fornecedores`, `locais_armazenamento`, `itens` e `movimentacoes`.

Também é possível conferir a existência da procedure, das triggers e das views por meio das respectivas áreas de objetos do MySQL Workbench.

## Configuração da aplicação

O backend utiliza o Sequelize com o driver `mysql2` para acessar o banco.

As informações de conexão devem ser configuradas no arquivo local:

`backend/.env`

O arquivo `backend/.env.example` fornece a estrutura das variáveis necessárias.

Os parâmetros relacionados ao banco são:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=usiestoque_dda
DB_USER=root
DB_PASSWORD=
```

Os valores devem ser ajustados conforme o servidor MySQL e as credenciais existentes no ambiente local.

O campo `DB_PASSWORD` deve conter a senha correspondente ao usuário configurado. Não é necessário utilizar o usuário `root` quando existir outro usuário do MySQL com as permissões adequadas.

Não publique credenciais reais no GitHub.

## Verificação da conexão pelo backend

Após importar o banco e configurar o arquivo `.env`, abra um terminal na raiz do projeto e execute:

```bash
npm --prefix backend run db:check
```

O comando executa o arquivo:

`backend/src/database/checkConnection.js`

Esse script tenta estabelecer a conexão com o MySQL e verifica a existência das sete tabelas exigidas pelo sistema.

Quando a verificação for concluída com sucesso, a mensagem esperada será:

```text
Conexão MySQL OK. Esquema usiestoque_V2 validado.
```

A mensagem confirma a conexão e a presença das tabelas principais. Ela não comprova, isoladamente, a execução de todas as regras da procedure ou o funcionamento completo da aplicação.

## Cadastro inicial e dados de demonstração

Após configurar o banco, é possível criar o Administrador inicial por meio do comando:

```bash
npm --prefix backend run seed:admin
```

Antes da execução, configure no arquivo `backend/.env` o nome, o e-mail e a senha do Administrador inicial.

O script verifica se já existe um usuário com o e-mail configurado. Quando esse usuário já existe, não cria outro registro nem atualiza automaticamente a senha.

Para um ambiente novo de desenvolvimento, existe também o comando:

```bash
npm --prefix backend run seed:dev
```

Esse script utiliza cadastros de demonstração para preparar dados básicos de tipos, fabricantes, fornecedores, locais e itens.

Sua execução é opcional e deve ser limitada aos ambientes de desenvolvimento ou demonstração. Antes de utilizá-lo, confira se os registros já existem e se a inclusão de dados de exemplo é apropriada.

## Organização dos arquivos

A pasta `database` contém o arquivo principal `usiestoque_V2.sql`, responsável pela definição do esquema do banco.

O arquivo `README.md` apresenta a documentação de preparação e configuração do banco de dados.

A pasta `diagrams` contém um arquivo `README.md` destinado à documentação dos diagramas relacionados ao banco.

A pasta `scripts` também possui um arquivo `README.md` destinado à organização de scripts complementares.

O arquivo `usiestoque_V2.sql` é a referência principal para a criação do esquema.

O backend utiliza os modelos Sequelize para acessar as tabelas existentes, mas não utiliza `sequelize.sync()` ou migrations para criar automaticamente a estrutura do banco.

Alterações futuras no esquema deverão ser documentadas e compatibilizadas com os modelos e serviços utilizados pela aplicação.

## Referência do projeto

Repositório principal:

https://github.com/TheoFaral/UsiEstoque_DDA
