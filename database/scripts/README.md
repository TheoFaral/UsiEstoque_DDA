# Scripts SQL complementares

Esta pasta é destinada a scripts SQL auxiliares do UsiEstoque DDA. O esquema oficial do banco permanece em `database/usiestoque_V2.sql`, fora desta pasta.

## Finalidade

Os scripts aqui armazenados poderão ser utilizados para preparar dados de demonstração e realizar verificações específicas em ambientes controlados. Eles não substituem o esquema oficial nem os scripts de inicialização existentes no backend.

A carga SQL de demonstração será definida na Etapa 8. Quando o arquivo for criado e validado, este README deverá registrar seu nome, finalidade, pré-requisitos, ordem de execução e cuidados para evitar dados duplicados.

## Cuidados antes da execução

- Confirme o servidor e o banco de destino antes de executar qualquer script.
- Não utilize scripts de demonstração diretamente sobre bancos com dados reais.
- Verifique se já existem cadastros ou movimentações que possam ser duplicados.
- Não inclua senhas, tokens, credenciais ou informações reais da empresa nos arquivos versionados.
- Movimentações que alterem saldos devem seguir as regras da procedure `sp_registrar_movimentacao`.
- Não execute novamente o esquema `usiestoque_V2.sql` para inserir dados de demonstração.

Para os registros básicos de desenvolvimento existentes no backend, o projeto também disponibiliza o comando `npm --prefix backend run seed:dev`. Consulte o README principal antes de utilizá-lo.
