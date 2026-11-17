-- UsiEstoque DDA - Carga para popular as tabelas - gerado pelo ChatGpt
-- Falha deliberadamente se a sessão não selecionou um banco ou se há dados existentes.


CREATE TEMPORARY TABLE _seed_demo_validacao (ok TINYINT NOT NULL, CONSTRAINT chk_seed_demo_vazio CHECK (ok = 1));
INSERT INTO _seed_demo_validacao (ok) SELECT IF(DATABASE() IS NOT NULL AND
 (SELECT COUNT(*) FROM usuarios)=0 AND (SELECT COUNT(*) FROM tipos_pastilha)=0 AND
 (SELECT COUNT(*) FROM fabricantes)=0 AND (SELECT COUNT(*) FROM fornecedores)=0 AND
 (SELECT COUNT(*) FROM locais_armazenamento)=0 AND (SELECT COUNT(*) FROM itens)=0 AND
 (SELECT COUNT(*) FROM movimentacoes)=0, 1, 0);
DROP TEMPORARY TABLE _seed_demo_validacao;

START TRANSACTION;
-- Contas didáticas: hash bcrypt (custo 12). Senhas individuais no arquivo separado.
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
  ('Administrador Banca', 'admin.banca@demo.usiestoque.invalid', '$2b$12$loUutQPV7sJleuK8Q4HkNuwmpt0jhyJOptfeBlSotqpjTG4XJqr/e', 'administrador', 1),
  ('Operador Banca 01', 'op1@usi.com', '$2b$12$d5esvb7D2DDQTLFqBhaImedJ1stlm2wU4h/RGOdHZd7VIxkOrXNCC', 'operador', 1),
  ('Operador Banca 02', 'op2@usi.com', '$2b$12$./jIUcqJ5REIvQE9TGCZs.QZS38zCdfmGsioSgJXdw58WOTLOaiAe', 'operador', 1),
  ('Operador Banca 03', 'op3@usi.com', '$2b$12$NXBNJKI2VN4W.6lHuAzkjO.qHWGhWLcLcfh4h9YHs9SgMC.AbhuXq', 'operador', 1),
  ('Operador Inativo Demo', 'operador.inativo@demo.usiestoque.invalid', '$2b$12$jwHgPggThQSUjRptZ.3hU.fRvvGpa9K.YaW.Kquciyrl27Gxohlpy', 'operador', 0);

INSERT INTO tipos_pastilha (nome, descricao) VALUES
  ('Torneamento externo - desbaste', 'Insertos de torneamento para desbaste em aço (ISO P).'),
  ('Torneamento externo - acabamento', 'Insertos para acabamento e perfilamento.'),
  ('Torneamento de aço inoxidável', 'Insertos para torneamento de inox (ISO M).'),
  ('Torneamento de ferro fundido', 'Insertos para ferro fundido (ISO K).'),
  ('Torneamento de alumínio', 'Insertos para materiais não ferrosos (ISO N).'),
  ('Fresamento de ombro 90 graus', 'Insertos intercambiáveis para fresamento de cantos e ombros.'),
  ('Fresamento de faceamento', 'Insertos intercambiáveis para faceamento.'),
  ('Canais e corte', 'Insertos para abertura de canais e corte de peças.'),
  ('Rosqueamento', 'Insertos para roscamento externo ou interno.'),
  ('Furação com insertos', 'Insertos substituíveis para brocas de pastilhas.');
INSERT INTO fabricantes (nome, contato) VALUES
  ('Sandvik Coromant', 'Cadastro demonstrativo - confirmar catálogo'),
  ('Kennametal', 'Cadastro demonstrativo - confirmar catálogo'),
  ('Seco Tools', 'Cadastro demonstrativo - confirmar catálogo'),
  ('ISCAR', 'Cadastro demonstrativo - confirmar catálogo'),
  ('Walter Tools', 'Cadastro demonstrativo - confirmar catálogo');
INSERT INTO fornecedores (nome, contato) VALUES
  ('Thijan Ferramentas', 'Distribuidor - Joinville/SC; cadastro demonstrativo'),
  ('Repatri', 'Distribuidor - Criciúma/SC; cadastro demonstrativo'),
  ('ToolSet', 'Distribuidor - Rio de Janeiro/RJ; cadastro demonstrativo'),
  ('Sandi Ferramentas', 'Distribuidor; cadastro demonstrativo');
INSERT INTO locais_armazenamento (nome, descricao) VALUES
  ('A01 - Torneamento', 'Armário de insertos de torneamento'),
  ('A02 - Fresamento', 'Armário de insertos de fresamento'),
  ('A03 - Canais e Roscas', 'Armário de canais e rosqueamento'),
  ('A04 - Furação', 'Armário de insertos para furação'),
  ('Q01 - Quarentena', 'Material indisponível para uso; simulação de item inativo');

-- Saldos começam em ZERO. Movimentações posteriores formarão o saldo correto.
INSERT INTO itens (codigo, descricao, tipo_id, fabricante_id, local_id, estoque_minimo, saldo_atual, ativo) VALUES
  ('DEMO-CNMG-P', 'CNMG 120408 - referência didática: torneamento de aço / desbaste', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento externo - desbaste'), (SELECT id FROM fabricantes WHERE nome = 'Sandvik Coromant'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 8, 0, 1),
  ('DEMO-WNMG-P', 'WNMG 080408 - referência didática: desbaste de aço', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento externo - desbaste'), (SELECT id FROM fabricantes WHERE nome = 'Kennametal'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 6, 0, 1),
  ('DEMO-CCMT-F', 'CCMT 09T304 - referência didática: acabamento de aço', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento externo - acabamento'), (SELECT id FROM fabricantes WHERE nome = 'Seco Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 5, 0, 1),
  ('DEMO-VCMT-F', 'VCMT 160404 - referência didática: perfilamento / acabamento', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento externo - acabamento'), (SELECT id FROM fabricantes WHERE nome = 'ISCAR'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 10, 0, 1),
  ('DEMO-CNMG-M', 'CNMG 120404 - referência didática: torneamento de inox', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento de aço inoxidável'), (SELECT id FROM fabricantes WHERE nome = 'Sandvik Coromant'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 12, 0, 1),
  ('DEMO-TNMG-K', 'TNMG 160408 - referência didática: torneamento de ferro fundido', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento de ferro fundido'), (SELECT id FROM fabricantes WHERE nome = 'Walter Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 4, 0, 1),
  ('DEMO-DCGT-N', 'DCGT 11T304 - referência didática: torneamento de alumínio', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento de alumínio'), (SELECT id FROM fabricantes WHERE nome = 'Kennametal'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 0, 0, 1),
  ('DEMO-APKT-90', 'APKT 1604 - referência didática: fresamento de ombro 90 graus', (SELECT id FROM tipos_pastilha WHERE nome = 'Fresamento de ombro 90 graus'), (SELECT id FROM fabricantes WHERE nome = 'ISCAR'), (SELECT id FROM locais_armazenamento WHERE nome = 'A02 - Fresamento'), 7, 0, 1),
  ('DEMO-R390-90', 'R390 - referência de família: fresamento de ombro 90 graus', (SELECT id FROM tipos_pastilha WHERE nome = 'Fresamento de ombro 90 graus'), (SELECT id FROM fabricantes WHERE nome = 'Sandvik Coromant'), (SELECT id FROM locais_armazenamento WHERE nome = 'A02 - Fresamento'), 7, 0, 1),
  ('DEMO-SEKT-FC', 'SEKT 1204 - referência didática: fresamento de faceamento', (SELECT id FROM tipos_pastilha WHERE nome = 'Fresamento de faceamento'), (SELECT id FROM fabricantes WHERE nome = 'Seco Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A02 - Fresamento'), 8, 0, 1),
  ('DEMO-GROOVE', 'Inserto de canal 3 mm - referência didática: canal e corte', (SELECT id FROM tipos_pastilha WHERE nome = 'Canais e corte'), (SELECT id FROM fabricantes WHERE nome = 'Walter Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A03 - Canais e Roscas'), 3, 0, 1),
  ('DEMO-THREAD', 'Inserto 60 graus - referência didática: rosca métrica', (SELECT id FROM tipos_pastilha WHERE nome = 'Rosqueamento'), (SELECT id FROM fabricantes WHERE nome = 'Kennametal'), (SELECT id FROM locais_armazenamento WHERE nome = 'A03 - Canais e Roscas'), 4, 0, 1),
  ('DEMO-DRILL', 'Inserto de furação - referência didática: broca intercambiável', (SELECT id FROM tipos_pastilha WHERE nome = 'Furação com insertos'), (SELECT id FROM fabricantes WHERE nome = 'Sandvik Coromant'), (SELECT id FROM locais_armazenamento WHERE nome = 'A04 - Furação'), 5, 0, 1),
  ('DEMO-INATIVO', 'Inserto separado para análise - item inativo demonstrativo', (SELECT id FROM tipos_pastilha WHERE nome = 'Fresamento de ombro 90 graus'), (SELECT id FROM fabricantes WHERE nome = 'ISCAR'), (SELECT id FROM locais_armazenamento WHERE nome = 'Q01 - Quarentena'), 3, 0, 0),
  ('DEMO-ALU-FR', 'Inserto para fresamento de alumínio - referência didática', (SELECT id FROM tipos_pastilha WHERE nome = 'Fresamento de faceamento'), (SELECT id FROM fabricantes WHERE nome = 'Seco Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A02 - Fresamento'), 6, 0, 1),
  ('DEMO-INOX-F', 'Inserto para acabamento de inox - referência didática', (SELECT id FROM tipos_pastilha WHERE nome = 'Torneamento de aço inoxidável'), (SELECT id FROM fabricantes WHERE nome = 'Walter Tools'), (SELECT id FROM locais_armazenamento WHERE nome = 'A01 - Torneamento'), 4, 0, 1);
COMMIT;

-- Movimentações simuladas em múltiplas datas. MySQL SET TIMESTAMP ajusta NOW()
-- apenas nesta sessão; ao concluir, SET TIMESTAMP = 0 restaura relógio normal.
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CNMG-P'), 'entrada', 20,
  (SELECT id FROM fornecedores WHERE nome = 'Thijan Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '860abf55-8eb5-58cc-b8e4-672541a57333');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-WNMG-P'), 'entrada', 12,
  (SELECT id FROM fornecedores WHERE nome = 'Repatri'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, '23ddb07e-bb0f-5310-8001-bd926f5abf6b');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CCMT-F'), 'entrada', 9,
  (SELECT id FROM fornecedores WHERE nome = 'ToolSet'), (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, '168a926d-6bf5-500e-9ad6-443b3f933afa');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-VCMT-F'), 'entrada', 15,
  (SELECT id FROM fornecedores WHERE nome = 'Sandi Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '267c1812-910b-5e0c-98d3-ab3920832ccb');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CNMG-M'), 'entrada', 40,
  (SELECT id FROM fornecedores WHERE nome = 'Thijan Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, 'e762d4f6-354d-50c9-b4ec-266fa959ac1c');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-TNMG-K'), 'entrada', 7,
  (SELECT id FROM fornecedores WHERE nome = 'Repatri'), (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, '9e0cb529-ec96-5a7e-a5be-eb4c5573f79c');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-APKT-90'), 'entrada', 18,
  (SELECT id FROM fornecedores WHERE nome = 'ToolSet'), (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '70c8b029-66ab-54b4-b036-5918cebebeea');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-R390-90'), 'entrada', 11,
  (SELECT id FROM fornecedores WHERE nome = 'Sandi Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, 'b42c171d-0b65-5b8b-a64b-d2770ca34c51');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-SEKT-FC'), 'entrada', 40,
  (SELECT id FROM fornecedores WHERE nome = 'Thijan Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, '04e7200a-f0d2-56d3-acbd-e0ba55d53890');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-GROOVE'), 'entrada', 5,
  (SELECT id FROM fornecedores WHERE nome = 'Repatri'), (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '45179c43-9aee-5208-a373-aa83cf843eb9');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-DRILL'), 'entrada', 18,
  (SELECT id FROM fornecedores WHERE nome = 'ToolSet'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, '06837667-9dbb-58e6-8ca3-213b6c91096e');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-ALU-FR'), 'entrada', 12,
  (SELECT id FROM fornecedores WHERE nome = 'Sandi Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, 'dd53634e-059c-5b99-b90e-e5beac8b5077');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-06 09:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-INOX-F'), 'entrada', 6,
  (SELECT id FROM fornecedores WHERE nome = 'Thijan Ferramentas'), (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '149fa8f0-35ad-5d69-8c19-56b06491d2a0');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-17 14:10:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CNMG-P'), 'entrada', 10,
  (SELECT id FROM fornecedores WHERE nome = 'Repatri'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, 'b8d867d9-7002-5d5b-8eda-dbec9c8de46d');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-17 14:10:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-ALU-FR'), 'entrada', 3,
  (SELECT id FROM fornecedores WHERE nome = 'Repatri'), (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, 'afd32c96-7fbb-5da9-a835-c0cab06ac79f');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CNMG-P'), 'saida', 6,
  NULL, (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '3862f4a4-6c3a-5430-a03a-e218675fa5ed');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-WNMG-P'), 'saida', 9,
  NULL, (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, '2181c407-e764-5f02-99a2-1db901aba16e');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CCMT-F'), 'saida', 9,
  NULL, (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, 'e5c04aaa-3923-5f34-9d8f-2e99e8275eab');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-VCMT-F'), 'saida', 5,
  NULL, (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, 'fd107958-1567-591c-bd86-599a93919669');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-CNMG-M'), 'saida', 4,
  NULL, (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, 'c54691d8-b5cb-5da7-b439-dcf7b6fab1fa');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-TNMG-K'), 'saida', 5,
  NULL, (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, '3a5ed73f-1dd8-56a6-b577-c1c274af6f22');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-APKT-90'), 'saida', 2,
  NULL, (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, 'b5203ae5-d10f-524e-b392-17b4f297ad8f');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-R390-90'), 'saida', 4,
  NULL, (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, '99c816a7-22ba-52e8-930e-70fb3a382997');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-GROOVE'), 'saida', 4,
  NULL, (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, 'fbda5992-2f37-52fc-a33f-e9b1a3397fb9');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-DRILL'), 'saida', 4,
  NULL, (SELECT id FROM usuarios WHERE email = 'op1@usi.com'),
  NULL, '2768665c-20ae-5c56-a7ad-4a03b5444f21');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-ALU-FR'), 'saida', 2,
  NULL, (SELECT id FROM usuarios WHERE email = 'op2@usi.com'),
  NULL, '19dde27c-efd6-50f3-9751-da4b0498e4bd');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-10-28 11:20:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-INOX-F'), 'saida', 2,
  NULL, (SELECT id FROM usuarios WHERE email = 'op3@usi.com'),
  NULL, 'b43531e4-eaff-5c87-bf6a-bc582a368462');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-11-03 08:30:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-SEKT-FC'), 'ajuste_saida', 2,
  NULL, (SELECT id FROM usuarios WHERE email = 'admin.banca@demo.usiestoque.invalid'),
  'Contagem física: duas unidades avariadas (demonstração)', '69c9aba5-b4f2-5240-8218-0f79a8e9eb43');
SET TIMESTAMP = UNIX_TIMESTAMP('2026-11-07 15:00:00');
CALL sp_registrar_movimentacao(
  (SELECT id FROM itens WHERE codigo = 'DEMO-SEKT-FC'), 'ajuste_entrada', 2,
  NULL, (SELECT id FROM usuarios WHERE email = 'admin.banca@demo.usiestoque.invalid'),
  'Recontagem física: duas unidades localizadas (demonstração)', 'e7f4caea-4944-5e85-ba3e-5560c473bf00');
SET TIMESTAMP = 0;

-- Consultas de conferência: nenhum resultado pressupõe execução bem-sucedida.
SELECT perfil, ativo, COUNT(*) AS quantidade FROM usuarios GROUP BY perfil, ativo ORDER BY perfil, ativo;
SELECT codigo, estoque_minimo, saldo_atual, situacao, ativo FROM vw_saldo_estoque WHERE codigo LIKE 'DEMO-%' ORDER BY codigo;
SELECT tipo, COUNT(*) AS total FROM movimentacoes GROUP BY tipo ORDER BY tipo;
SELECT COUNT(*) AS total_movimentacoes FROM movimentacoes;
SELECT DATE(criado_em) AS data, COUNT(*) AS total FROM movimentacoes GROUP BY DATE(criado_em) ORDER BY data;
