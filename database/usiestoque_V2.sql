-- UsiEstoque DDA - esquema de banco de dados V2
-- Requer MySQL 8.0.16 ou superior para aplicacao efetiva das restricoes CHECK.

CREATE DATABASE IF NOT EXISTS usiestoque_dda
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE usiestoque_dda;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('administrador', 'operador') NOT NULL DEFAULT 'operador',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE tipos_pastilha (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_tipos_pastilha_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE fabricantes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  contato VARCHAR(150),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_fabricantes_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE fornecedores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  contato VARCHAR(150),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_fornecedores_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE locais_armazenamento (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_locais_armazenamento_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE itens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  tipo_id INT UNSIGNED NOT NULL,
  fabricante_id INT UNSIGNED NOT NULL,
  local_id INT UNSIGNED NOT NULL,
  estoque_minimo INT UNSIGNED NOT NULL DEFAULT 0,
  saldo_atual INT UNSIGNED NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_itens_codigo UNIQUE (codigo),
  CONSTRAINT fk_itens_tipo FOREIGN KEY (tipo_id)
    REFERENCES tipos_pastilha (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_itens_fabricante FOREIGN KEY (fabricante_id)
    REFERENCES fabricantes (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_itens_local FOREIGN KEY (local_id)
    REFERENCES locais_armazenamento (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT chk_itens_estoque_minimo CHECK (estoque_minimo >= 0),
  CONSTRAINT chk_itens_saldo_atual CHECK (saldo_atual >= 0)
) ENGINE=InnoDB;

CREATE TABLE movimentacoes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  tipo ENUM('entrada', 'saida', 'ajuste_entrada', 'ajuste_saida') NOT NULL,
  quantidade INT UNSIGNED NOT NULL,
  saldo_anterior INT UNSIGNED NOT NULL,
  saldo_posterior INT UNSIGNED NOT NULL,
  fornecedor_id INT UNSIGNED NULL,
  usuario_id INT UNSIGNED NOT NULL,
  justificativa VARCHAR(500) NULL,
  chave_requisicao CHAR(36) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_movimentacoes_chave_requisicao UNIQUE (chave_requisicao),
  CONSTRAINT fk_movimentacoes_item FOREIGN KEY (item_id)
    REFERENCES itens (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_movimentacoes_fornecedor FOREIGN KEY (fornecedor_id)
    REFERENCES fornecedores (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_movimentacoes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT chk_movimentacoes_quantidade CHECK (quantidade > 0),
  CONSTRAINT chk_movimentacoes_fornecedor CHECK (
    (tipo = 'entrada' AND fornecedor_id IS NOT NULL)
    OR (tipo <> 'entrada' AND fornecedor_id IS NULL)
  ),
  CONSTRAINT chk_movimentacoes_justificativa CHECK (
    (tipo IN ('ajuste_entrada', 'ajuste_saida')
      AND CHAR_LENGTH(TRIM(COALESCE(justificativa, ''))) > 0)
    OR (tipo IN ('entrada', 'saida') AND justificativa IS NULL)
  )
) ENGINE=InnoDB;

CREATE INDEX idx_itens_consulta
  ON itens (ativo, tipo_id, fabricante_id, local_id);
CREATE INDEX idx_itens_descricao
  ON itens (descricao);
CREATE INDEX idx_movimentacoes_item_data
  ON movimentacoes (item_id, criado_em);
CREATE INDEX idx_movimentacoes_tipo_data
  ON movimentacoes (tipo, criado_em);
CREATE INDEX idx_movimentacoes_usuario_data
  ON movimentacoes (usuario_id, criado_em);
CREATE INDEX idx_movimentacoes_fornecedor_data
  ON movimentacoes (fornecedor_id, criado_em);

DELIMITER //

CREATE PROCEDURE sp_registrar_movimentacao (
  IN p_item_id INT UNSIGNED,
  IN p_tipo VARCHAR(20),
  IN p_quantidade INT UNSIGNED,
  IN p_fornecedor_id INT UNSIGNED,
  IN p_usuario_id INT UNSIGNED,
  IN p_justificativa VARCHAR(500),
  IN p_chave_requisicao CHAR(36)
)
proc: BEGIN
  DECLARE v_saldo_anterior INT UNSIGNED;
  DECLARE v_saldo_posterior INT UNSIGNED;
  DECLARE v_item_ativo BOOLEAN;
  DECLARE v_usuario_ativo BOOLEAN;
  DECLARE v_fornecedor_ativo BOOLEAN;
  DECLARE v_perfil VARCHAR(20);
  DECLARE v_movimentacao_existente BIGINT UNSIGNED;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_tipo NOT IN ('entrada', 'saida', 'ajuste_entrada', 'ajuste_saida') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de movimentacao invalido.';
  END IF;

  IF p_quantidade IS NULL OR p_quantidade = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade deve ser maior que zero.';
  END IF;

  IF p_chave_requisicao IS NULL OR CHAR_LENGTH(TRIM(p_chave_requisicao)) <> 36 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chave de requisicao invalida.';
  END IF;

  START TRANSACTION;

  SELECT MAX(id)
    INTO v_movimentacao_existente
    FROM movimentacoes
   WHERE chave_requisicao = p_chave_requisicao
   LIMIT 1;

  IF v_movimentacao_existente IS NOT NULL THEN
    COMMIT;
    SELECT v_movimentacao_existente AS movimentacao_id, 'ja_registrada' AS resultado;
    LEAVE proc;
  END IF;

  SELECT ativo, perfil
    INTO v_usuario_ativo, v_perfil
    FROM usuarios
   WHERE id = p_usuario_id
   FOR UPDATE;

  IF v_usuario_ativo IS NULL OR v_usuario_ativo = FALSE THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario inexistente ou inativo.';
  END IF;

  IF p_tipo IN ('ajuste_entrada', 'ajuste_saida') AND v_perfil <> 'administrador' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Somente administradores podem registrar ajustes.';
  END IF;

  IF p_tipo = 'entrada' AND p_fornecedor_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A entrada exige um fornecedor.';
  END IF;

  IF p_tipo <> 'entrada' AND p_fornecedor_id IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fornecedor somente pode ser informado em entradas.';
  END IF;

  IF p_tipo = 'entrada' THEN
    SELECT ativo
      INTO v_fornecedor_ativo
      FROM fornecedores
     WHERE id = p_fornecedor_id;

    IF v_fornecedor_ativo IS NULL OR v_fornecedor_ativo = FALSE THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fornecedor inexistente ou inativo.';
    END IF;
  END IF;

  IF p_tipo IN ('ajuste_entrada', 'ajuste_saida')
     AND CHAR_LENGTH(TRIM(COALESCE(p_justificativa, ''))) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O ajuste exige justificativa.';
  END IF;

  SELECT saldo_atual, ativo
    INTO v_saldo_anterior, v_item_ativo
    FROM itens
   WHERE id = p_item_id
   FOR UPDATE;

  IF v_item_ativo IS NULL OR v_item_ativo = FALSE THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item inexistente ou inativo.';
  END IF;

  IF p_tipo IN ('saida', 'ajuste_saida') THEN
    IF p_quantidade > v_saldo_anterior THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantidade superior ao saldo disponivel.';
    END IF;
    SET v_saldo_posterior = v_saldo_anterior - p_quantidade;
  ELSE
    SET v_saldo_posterior = v_saldo_anterior + p_quantidade;
  END IF;

  INSERT INTO movimentacoes (
    item_id, tipo, quantidade, saldo_anterior, saldo_posterior,
    fornecedor_id, usuario_id, justificativa, chave_requisicao
  ) VALUES (
    p_item_id, p_tipo, p_quantidade, v_saldo_anterior, v_saldo_posterior,
    p_fornecedor_id, p_usuario_id, NULLIF(TRIM(p_justificativa), ''), p_chave_requisicao
  );

  UPDATE itens
     SET saldo_atual = v_saldo_posterior
   WHERE id = p_item_id;

  SET v_movimentacao_existente = LAST_INSERT_ID();
  COMMIT;

  SELECT v_movimentacao_existente AS movimentacao_id,
         v_saldo_anterior AS saldo_anterior,
         v_saldo_posterior AS saldo_posterior,
         'registrada' AS resultado;
END//

CREATE TRIGGER trg_movimentacoes_bloquear_alteracao
BEFORE UPDATE ON movimentacoes
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Movimentacoes sao imutaveis; registre um ajuste corretivo.';
END//

CREATE TRIGGER trg_movimentacoes_bloquear_exclusao
BEFORE DELETE ON movimentacoes
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Movimentacoes nao podem ser excluidas; registre um ajuste corretivo.';
END//

DELIMITER ;

CREATE OR REPLACE VIEW vw_saldo_estoque AS
SELECT
  i.id,
  i.codigo,
  i.descricao,
  tp.nome AS tipo_pastilha,
  f.nome AS fabricante,
  la.nome AS local_armazenamento,
  i.estoque_minimo,
  i.saldo_atual,
  CASE
    WHEN i.saldo_atual <= i.estoque_minimo THEN 'critico'
    ELSE 'normal'
  END AS situacao,
  i.ativo
FROM itens i
JOIN tipos_pastilha tp ON tp.id = i.tipo_id
JOIN fabricantes f ON f.id = i.fabricante_id
JOIN locais_armazenamento la ON la.id = i.local_id;

CREATE OR REPLACE VIEW vw_itens_criticos AS
SELECT *
FROM vw_saldo_estoque
WHERE ativo = TRUE
  AND saldo_atual <= estoque_minimo;

CREATE OR REPLACE VIEW vw_historico_movimentacoes AS
SELECT
  m.id,
  m.criado_em,
  i.codigo AS item_codigo,
  i.descricao AS item_descricao,
  m.tipo,
  m.quantidade,
  m.saldo_anterior,
  m.saldo_posterior,
  u.nome AS usuario_responsavel,
  f.nome AS fornecedor,
  m.justificativa
FROM movimentacoes m
JOIN itens i ON i.id = m.item_id
JOIN usuarios u ON u.id = m.usuario_id
LEFT JOIN fornecedores f ON f.id = m.fornecedor_id;

CREATE OR REPLACE VIEW vw_consumo_diario AS
SELECT
  DATE(m.criado_em) AS data_consumo,
  m.item_id,
  i.codigo,
  i.descricao,
  SUM(m.quantidade) AS quantidade_consumida
FROM movimentacoes m
JOIN itens i ON i.id = m.item_id
WHERE m.tipo IN ('saida', 'ajuste_saida')
GROUP BY DATE(m.criado_em), m.item_id, i.codigo, i.descricao;
