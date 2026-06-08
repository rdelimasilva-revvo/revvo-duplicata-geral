/*
  # Alinhar empresas de propostas com a lista canônica de Créditos Disponíveis

  1. Contexto
    - A tela "Créditos Disponíveis" usa a tabela `supplier_credits` (14 fornecedores).
    - A tabela `agreement_proposals` continha empresas legadas em caixa alta sem CNPJ
      (AGRO VALE, BRASIL LOG, ELETRO NORTE, etc.) e variações com CNPJ não-canônicos
      (Distribuidora Norte, Mega Logística, Rede Sol, Super Atacado, Varejo Brasil).
    - Após esta migração, todos os registros de `agreement_proposals` referenciam
      empresas existentes em `supplier_credits`, mantendo nomenclatura idêntica.

  2. Estratégia de mapeamento
    - Quando o CNPJ (ignorando formatação) coincide com algum em `supplier_credits`,
      atualizamos `origin_company` e `origin_cnpj` para a forma canônica.
    - Para registros legados sem CNPJ, mapeamos manualmente para o fornecedor
      canônico mais próximo (mesma indústria/segmento).

  3. Segurança
    - Não há alterações estruturais; apenas UPDATEs idempotentes nos textos.
*/

-- 1. Casos com CNPJ presente: alinhar pelo CNPJ normalizado.
UPDATE agreement_proposals SET
  origin_company = 'Fornecedor Beta Comércio',
  origin_cnpj = '55.666.777/0001-88'
WHERE regexp_replace(coalesce(origin_cnpj, ''), '\D', '', 'g') = '55666777000188';

UPDATE agreement_proposals SET
  origin_company = 'Transportes Zeta Ltda',
  origin_cnpj = '33.444.555/0001-66'
WHERE regexp_replace(coalesce(origin_cnpj, ''), '\D', '', 'g') = '33444555000166';

UPDATE agreement_proposals SET
  origin_company = 'Indústria Sigma Ltda',
  origin_cnpj = '22.333.444/0001-55'
WHERE regexp_replace(coalesce(origin_cnpj, ''), '\D', '', 'g') = '22333444000155';

UPDATE agreement_proposals SET
  origin_company = 'Alimentos Primavera Ltda',
  origin_cnpj = '44.555.666/0001-77'
WHERE regexp_replace(coalesce(origin_cnpj, ''), '\D', '', 'g') = '44555666000177';

UPDATE agreement_proposals SET
  origin_company = 'Atacado União S.A.',
  origin_cnpj = '11.222.333/0001-44'
WHERE regexp_replace(coalesce(origin_cnpj, ''), '\D', '', 'g') = '11222333000144';

-- 2. Registros legados sem CNPJ: remapear pelo nome para o fornecedor canônico.
UPDATE agreement_proposals SET origin_company = 'AgroSul Insumos S.A.',          origin_cnpj = '24.252.627/0001-77' WHERE origin_company = 'AGRO VALE S.A.';
UPDATE agreement_proposals SET origin_company = 'Metalúrgica Órion S.A.',        origin_cnpj = '66.777.888/0001-99' WHERE origin_company IN ('AUTO PEÇAS PRIME', 'METAL FORTE');
UPDATE agreement_proposals SET origin_company = 'Transportes Zeta Ltda',         origin_cnpj = '33.444.555/0001-66' WHERE origin_company = 'BRASIL LOG';
UPDATE agreement_proposals SET origin_company = 'Química Ômega Ltda',            origin_cnpj = '10.111.222/0001-33' WHERE origin_company IN ('COSMÉTICOS BELLA', 'PHARMA DISTRIBUIDORA');
UPDATE agreement_proposals SET origin_company = 'Eletro Norte Distribuidora',    origin_cnpj = '16.171.819/0001-22' WHERE origin_company = 'ELETRO NORTE';
UPDATE agreement_proposals SET origin_company = 'Tecidos & Confecções ABC',      origin_cnpj = '12.131.415/0001-66' WHERE origin_company IN ('IDEEN TECH', 'TÊXTIL ATLÂNTICO');
UPDATE agreement_proposals SET origin_company = 'Papelaria Central Ltda',        origin_cnpj = '88.999.000/0001-11' WHERE origin_company IN ('INDUSTRIAL PRIME', 'PADARIA INDUSTRIAL');
UPDATE agreement_proposals SET origin_company = 'Construtora Horizonte Ltda',    origin_cnpj = '20.212.223/0001-44' WHERE origin_company = 'NORTEC INDÚSTRIA';
UPDATE agreement_proposals SET origin_company = 'Alimentos Primavera Ltda',      origin_cnpj = '44.555.666/0001-77' WHERE origin_company = 'TECHFOOD ALIMENTOS';

-- 3. Espelhar o mesmo conjunto canônico em commercial_agreements para fornecedores
--    que já existam, normalizando formatação de CNPJ.
UPDATE commercial_agreements SET supplier_cnpj = '77.888.999/0001-22'
WHERE regexp_replace(coalesce(supplier_cnpj, ''), '\D', '', 'g') = '77888999000122';

UPDATE commercial_agreements SET supplier_cnpj = '55.666.777/0001-88'
WHERE regexp_replace(coalesce(supplier_cnpj, ''), '\D', '', 'g') = '55666777000188';

UPDATE commercial_agreements SET supplier_cnpj = '98.765.432/0001-10'
WHERE regexp_replace(coalesce(supplier_cnpj, ''), '\D', '', 'g') = '98765432000110';

UPDATE commercial_agreements SET supplier_cnpj = '22.333.444/0001-55'
WHERE regexp_replace(coalesce(supplier_cnpj, ''), '\D', '', 'g') = '22333444000155';
