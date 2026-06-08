import { Bill } from '../types/bill';

export const mockBills: Bill[] = [
  {
    id: '24907001',
    type: 'Duplicata Mercantil',
    iud: 'DM240907001BR2024',
    issueDate: '15/08/2024',
    dueDate: '10/06/2024',
    currentDueDate: '10/06/2024',
    dueDateUpdateDate: '15/08/2024',
    amount: 54000.00,
    sacador: {
      name: 'Fornecedor ABC LTDA',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - São Paulo/SP'
    },
    sacado: {
      name: 'Empresa Compradora XYZ S.A.',
      cnpj: '98.765.432/0001-11',
      address: 'Av. Comercial, 456 - São Paulo/SP'
    },
    discountValue: 540.00,
    discountReason: 'Desconto concedido por pagamento antecipado conforme acordo comercial',
    updateValue: 0.00,
    lastUpdateDate: '01/09/2024',
    valueUpdateDate: '01/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '23793.38128 60000.000003 00000.000400 1 84340000054000',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'BB-2024-00012345'
    },
    status: 'Alteração de Domicílio de Pgto',
    manifestation: 'Alteração de Domicílio de Pgto',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '20/09/2024',
    manifestacaoHora: '09:15',
    manifestacaoUsuario: 'automação',
    ressalvaValor: 2700.00,
    ressalvaMotivo: 'Divergência parcial de quantidade entregue',
    ressalvaJustificativa: 'Foram entregues 450 unidades de 500 solicitadas. Diferença de R$ 2.700,00 referente às 50 unidades faltantes conforme NF 000123456.',
    ressalvaData: '05/09/2024',
    newReceiver: {
      name: 'Fator XYZ S.A.',
      account: '99.888.777/0001-11 CC: 88888-9'
    },
    settlementLocation: 'Transferência - Banco Safra - Ag: 0099 CC: 88888-9',
    diasPendente: -180,
    diasParaManifestacao: 0,
    notaFiscal: {
      numero: '000123456',
      serie: '1',
      dataEmissao: '15/08/2024',
      chave: '35240812345678000190550010001234561123456789'
    },
    parcelas: [
      { numero: 1, valor: 18000.00, vencimento: '10/06/2024' },
      { numero: 2, valor: 18000.00, vencimento: '10/07/2024' },
      { numero: 3, valor: 18000.00, vencimento: '10/08/2024' }
    ],
    numeroNota: '000123456',
    duplicatas: [
      { item: '047', numero: 1, dataEmissao: '15/08/2024', dataVencimento: '10/06/2024', valor: 18000.00, iud: 'DM240907001BR2024-01' },
      { item: '012', numero: 2, dataEmissao: '15/08/2024', dataVencimento: '10/07/2024', valor: 18000.00, iud: 'DM240907001BR2024-02' },
      { item: '083', numero: 3, dataEmissao: '15/08/2024', dataVencimento: '10/08/2024', valor: 18000.00, iud: 'DM240907001BR2024-03' }
    ],
    erp: {
      documentoContabil: '5100012345',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '22860009',
    type: 'Duplicata de Serviço',
    iud: 'DS228609BR2024',
    issueDate: '20/09/2024',
    dueDate: '05/10/2024',
    currentDueDate: '05/10/2024',
    amount: 7222.22,
    sacador: {
      name: 'Distribuidora XYZ S.A.',
      cnpj: '98.765.432/0001-10',
      address: 'Av. Paulista, 1000 - São Paulo/SP'
    },
    sacado: {
      name: 'Indústria Nacional LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 789 - Guarulhos/SP'
    },
    discountValue: 72.22,
    discountReason: 'Abatimento por devolução parcial de mercadoria',
    updateValue: 144.44,
    lastUpdateDate: '25/09/2024',
    valueUpdateDate: '25/09/2024',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'CNPJ',
      chavePix: '98.765.432/0001-10'
    },
    notaFiscal: {
      numero: '000987654',
      serie: '2',
      dataEmissao: '20/09/2024',
      chave: '35240898765432000110550020009876541987654321'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_manual',
    manifestacaoData: '22/09/2024',
    manifestacaoHora: '14:32',
    manifestacaoUsuario: 'Carlos Silva',
    diasPendente: 1,
    diasParaManifestacao: 8,
    numeroNota: '000987654',
    duplicatas: [
      { item: '029', numero: 1, dataEmissao: '20/09/2024', dataVencimento: '05/10/2024', valor: 7222.22, iud: 'DS228609BR2024' }
    ],
    erp: {
      documentoContabil: '5100098765',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '11383001',
    type: 'Duplicata Mercantil',
    iud: 'DM113831BR2024',
    issueDate: '27/08/2024',
    dueDate: '11/09/2024',
    currentDueDate: '11/09/2024',
    amount: 8000.00,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    sacado: {
      name: 'Comércio Varejista ABC',
      cnpj: '55.666.777/0001-88',
      address: 'Rua do Comércio, 100 - São Paulo/SP'
    },
    discountValue: 0.00,
    updateValue: 80.00,
    lastUpdateDate: '05/09/2024',
    valueUpdateDate: '05/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '341 - Itaú Unibanco S.A.',
      agencia: '0001',
      conta: '12345',
      digitoConta: '6'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '16/09/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -86,
    diasParaManifestacao: 0,
    numeroNota: 'NF-113831',
    notaFiscal: {
      numero: 'NF-113831',
      serie: '1',
      dataEmissao: '27/08/2024',
      chave: '35240811222333000144550010001138311113830001'
    },
    duplicatas: [
      { item: '031', numero: 1, dataEmissao: '27/08/2024', dataVencimento: '11/09/2024', valor: 8000.00, iud: 'DM113831BR2024' }
    ],
    erp: {
      documentoContabil: '5100113831',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '11383002',
    type: 'Duplicata Mercantil',
    iud: 'DM113832BR2024',
    issueDate: '27/08/2024',
    dueDate: '11/10/2024',
    currentDueDate: '11/10/2024',
    amount: 8000.00,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    sacado: {
      name: 'Comércio Varejista ABC',
      cnpj: '55.666.777/0001-88'
    },
    discountValue: 0.00,
    updateValue: 0.00,
    lastUpdateDate: '27/08/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '341 - Itaú Unibanco S.A.',
      agencia: '0001',
      conta: '12345',
      digitoConta: '6'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '16/10/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -56,
    diasParaManifestacao: 0,
    numeroNota: 'NF-113831',
    notaFiscal: {
      numero: 'NF-113831',
      serie: '1',
      dataEmissao: '27/08/2024',
      chave: '35240811222333000144550010001138321113830002'
    },
    duplicatas: [
      { item: '032', numero: 2, dataEmissao: '27/08/2024', dataVencimento: '11/10/2024', valor: 8000.00, iud: 'DM113832BR2024' }
    ],
    erp: {
      documentoContabil: '5100113831',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '11383003',
    type: 'Duplicata Mercantil',
    iud: 'DM113833BR2024',
    issueDate: '27/08/2024',
    dueDate: '11/11/2024',
    currentDueDate: '11/11/2024',
    amount: 8000.00,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    sacado: {
      name: 'Comércio Varejista ABC',
      cnpj: '55.666.777/0001-88'
    },
    discountValue: 160.00,
    updateValue: 0.00,
    lastUpdateDate: '27/08/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '341 - Itaú Unibanco S.A.',
      agencia: '0001',
      conta: '12345',
      digitoConta: '6'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '16/11/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -25,
    diasParaManifestacao: 0,
    numeroNota: 'NF-113831',
    notaFiscal: {
      numero: 'NF-113831',
      serie: '1',
      dataEmissao: '27/08/2024',
      chave: '35240811222333000144550010001138331113830003'
    },
    duplicatas: [
      { item: '033', numero: 3, dataEmissao: '27/08/2024', dataVencimento: '11/11/2024', valor: 8000.00, iud: 'DM113833BR2024' }
    ],
    erp: {
      documentoContabil: '5100113831',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '33445001',
    type: 'Duplicata de Serviço',
    iud: 'DS334451BR2024',
    issueDate: '01/09/2024',
    dueDate: '15/12/2025',
    currentDueDate: '15/12/2025',
    amount: 12500.00,
    sacador: {
      name: 'Comercial QWE EIRELI',
      cnpj: '55.666.777/0001-88',
      address: 'Rua Comercial, 789 - Rio de Janeiro/RJ'
    },
    sacado: {
      name: 'Holding Brasil S.A.',
      cnpj: '12.345.678/0001-90'
    },
    discountValue: 250.00,
    updateValue: 125.00,
    lastUpdateDate: '10/09/2024',
    valueUpdateDate: '10/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '10491.12345 67890.123456 78901.234567 8 12340000012500',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'CEF-2024-00056789'
    },
    status: 'Alteração de Domicílio de Pgto',
    manifestation: 'Alteração de Domicílio de Pgto',
    statusManifestacao: 'em_fila_analise_manual',
    newReceiver: {
      name: 'Crédito Fácil LTDA',
      account: '33.222.111/0001-99'
    },
    settlementLocation: 'PIX - Chave: credito@facil.com.br',
    diasPendente: 401,
    diasParaManifestacao: 10,
    numeroNota: 'NF-334451',
    notaFiscal: {
      numero: 'NF-334451',
      serie: '1',
      dataEmissao: '01/09/2024',
      chave: '35240855666777000188550010003344511334450001'
    },
    duplicatas: [
      { item: '041', numero: 1, dataEmissao: '01/09/2024', dataVencimento: '15/12/2025', valor: 12500.00, iud: 'DS334451BR2024' }
    ],
    erp: {
      documentoContabil: '5100334451',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '33445002',
    type: 'Duplicata de Serviço',
    iud: 'DS334452BR2024',
    issueDate: '01/09/2024',
    dueDate: '20/12/2025',
    currentDueDate: '20/12/2025',
    amount: 12500.00,
    sacador: {
      name: 'Comercial QWE EIRELI',
      cnpj: '55.666.777/0001-88',
      address: 'Rua Comercial, 789 - Rio de Janeiro/RJ'
    },
    sacado: {
      name: 'Holding Brasil S.A.',
      cnpj: '12.345.678/0001-90'
    },
    discountValue: 250.00,
    updateValue: 0.00,
    lastUpdateDate: '01/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '10491.12345 67890.123456 78901.234567 9 12340000012500',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'CEF-2024-00056790'
    },
    status: 'Alteração de Domicílio de Pgto',
    manifestation: 'Alteração de Domicílio de Pgto',
    statusManifestacao: 'em_fila_analise_manual',
    newReceiver: {
      name: 'Capital Investimentos LTDA',
      account: '44.333.222/0001-77'
    },
    settlementLocation: 'Boleto - Santander - Ag: 5566 CC: 77889-3',
    diasPendente: 406,
    diasParaManifestacao: 10,
    numeroNota: 'NF-334451',
    notaFiscal: {
      numero: 'NF-334451',
      serie: '1',
      dataEmissao: '01/09/2024',
      chave: '35240855666777000188550010003344521334450002'
    },
    duplicatas: [
      { item: '042', numero: 2, dataEmissao: '01/09/2024', dataVencimento: '20/12/2025', valor: 12500.00, iud: 'DS334452BR2024' }
    ],
    erp: {
      documentoContabil: '5100334451',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '77641001',
    type: 'Duplicata Mercantil',
    iud: 'DM776411BR2024',
    issueDate: '03/09/2024',
    dueDate: '17/09/2024',
    currentDueDate: '17/09/2024',
    amount: 7200.00,
    sacador: {
      name: 'Atacadista JKL S.A.',
      cnpj: '33.444.555/0001-66',
      address: 'Av. Atacadista, 321 - Belo Horizonte/MG'
    },
    sacado: {
      name: 'Supermercados Norte S.A.',
      cnpj: '77.888.999/0001-00'
    },
    discountValue: 0.00,
    updateValue: 360.00,
    lastUpdateDate: '15/09/2024',
    valueUpdateDate: '15/09/2024',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'Email',
      chavePix: 'atacadista@jkl.com.br'
    },
    status: 'Recusada',
    manifestation: 'Recusado',
    statusManifestacao: 'recusa_manual',
    manifestacaoData: '18/09/2024',
    manifestacaoHora: '11:45',
    manifestacaoUsuario: 'Ana Rodrigues',
    diasPendente: -79,
    diasParaManifestacao: 0,
    numeroNota: 'NF-776411',
    notaFiscal: {
      numero: 'NF-776411',
      serie: '1',
      dataEmissao: '03/09/2024',
      chave: '35240833444555000166550010007764111776410001'
    },
    duplicatas: [
      { item: '044', numero: 1, dataEmissao: '03/09/2024', dataVencimento: '17/09/2024', valor: 7200.00, iud: 'DM776411BR2024' }
    ],
    erp: {
      documentoContabil: '5100776411',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '74293001',
    type: 'Duplicata Mercantil',
    iud: 'DM742931BR2024',
    issueDate: '14/09/2024',
    dueDate: '28/09/2024',
    currentDueDate: '28/09/2024',
    amount: 7200.00,
    sacador: {
      name: 'Distribuidora MNO LTDA',
      cnpj: '77.888.999/0001-00',
      address: 'Rua Distribuição, 654 - Porto Alegre/RS'
    },
    sacado: {
      name: 'Rede Varejista Sul LTDA',
      cnpj: '22.333.444/0001-55'
    },
    discountValue: 144.00,
    updateValue: 0.00,
    lastUpdateDate: '14/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '237 - Bradesco S.A.',
      agencia: '7890',
      conta: '12345',
      digitoConta: '7'
    },
    status: 'Recusada',
    manifestation: 'Recusado',
    statusManifestacao: 'recusa_manual',
    manifestacaoData: '26/09/2024',
    manifestacaoHora: '16:20',
    manifestacaoUsuario: 'Pedro Santos',
    diasPendente: -68,
    diasParaManifestacao: 0,
    numeroNota: 'NF-742931',
    notaFiscal: {
      numero: 'NF-742931',
      serie: '1',
      dataEmissao: '14/09/2024',
      chave: '35240877888999000100550010007429311742930001'
    },
    duplicatas: [
      { item: '045', numero: 1, dataEmissao: '14/09/2024', dataVencimento: '28/09/2024', valor: 7200.00, iud: 'DM742931BR2024' }
    ],
    erp: {
      documentoContabil: '5100742931',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '89012001',
    type: 'Duplicata de Serviço',
    iud: 'DS890121BR2024',
    issueDate: '06/09/2024',
    dueDate: '20/09/2024',
    currentDueDate: '20/09/2024',
    amount: 15750.00,
    sacador: {
      name: 'Indústria RST LTDA',
      cnpj: '12.345.678/0001-99',
      address: 'Distrito Industrial, 987 - Campinas/SP'
    },
    sacado: {
      name: 'Comércio e Serviços Centro LTDA',
      cnpj: '66.777.888/0001-99'
    },
    discountValue: 315.00,
    updateValue: 157.50,
    lastUpdateDate: '18/09/2024',
    valueUpdateDate: '18/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '03399.12345 67890.123456 78901.234567 1 12340000015750',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'SAN-2024-00078901'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '25/09/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    ressalvaValor: 1575.00,
    ressalvaMotivo: 'Serviço prestado parcialmente - pendência na entrega final',
    ressalvaJustificativa: 'Etapa 3 do projeto de consultoria não foi concluída. Abatimento proporcional de 10% sobre o valor total do contrato.',
    ressalvaData: '20/09/2024',
    diasPendente: -76,
    diasParaManifestacao: 0,
    numeroNota: 'NF-890121',
    notaFiscal: {
      numero: 'NF-890121',
      serie: '1',
      dataEmissao: '06/09/2024',
      chave: '35240812345678000199550010008901211890120001'
    },
    duplicatas: [
      { item: '046', numero: 1, dataEmissao: '06/09/2024', dataVencimento: '20/09/2024', valor: 15750.00, iud: 'DS890121BR2024' }
    ],
    erp: {
      documentoContabil: '5100890121',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '89012002',
    type: 'Duplicata de Serviço',
    iud: 'DS890122BR2024',
    issueDate: '06/09/2024',
    dueDate: '20/10/2024',
    currentDueDate: '20/10/2024',
    amount: 15750.00,
    sacador: {
      name: 'Indústria RST LTDA',
      cnpj: '12.345.678/0001-99',
      address: 'Distrito Industrial, 987 - Campinas/SP'
    },
    sacado: {
      name: 'Comércio e Serviços Centro LTDA',
      cnpj: '66.777.888/0001-99'
    },
    discountValue: 315.00,
    updateValue: 157.50,
    lastUpdateDate: '18/09/2024',
    valueUpdateDate: '18/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '03399.12345 67890.123456 78901.234567 2 12340000015750',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'SAN-2024-00078902'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '25/10/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -46,
    diasParaManifestacao: 0,
    numeroNota: 'NF-890121',
    notaFiscal: {
      numero: 'NF-890121',
      serie: '1',
      dataEmissao: '06/09/2024',
      chave: '35240812345678000199550010008901221890120002'
    },
    duplicatas: [
      { item: '047', numero: 2, dataEmissao: '06/09/2024', dataVencimento: '20/10/2024', valor: 15750.00, iud: 'DS890122BR2024' }
    ],
    erp: {
      documentoContabil: '5100890121',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '90123001',
    type: 'Duplicata Mercantil',
    iud: 'DM901231BR2024',
    issueDate: '10/09/2024',
    dueDate: '25/09/2024',
    currentDueDate: '25/09/2024',
    amount: 23400.00,
    sacador: {
      name: 'Comercial UVW S.A.',
      cnpj: '22.333.444/0001-55',
      address: 'Rua Comercial, 111 - Salvador/BA'
    },
    sacado: {
      name: 'Indústrias Reunidas Nordeste',
      cnpj: '44.555.666/0001-77'
    },
    discountValue: 234.00,
    updateValue: 0.00,
    lastUpdateDate: '10/09/2024',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'Email',
      chavePix: 'comercial@uvw.com.br'
    },
    status: 'Notificação recebida',
    manifestation: 'Manifestação Aceite/Recusa',
    statusManifestacao: 'em_fila_analise_manual',
    diasPendente: -71,
    diasParaManifestacao: 2,
    numeroNota: 'NF-901231',
    notaFiscal: {
      numero: 'NF-901231',
      serie: '1',
      dataEmissao: '10/09/2024',
      chave: '35240822333444000155550010009012311901230001'
    },
    duplicatas: [
      { item: '048', numero: 1, dataEmissao: '10/09/2024', dataVencimento: '25/09/2024', valor: 23400.00, iud: 'DM901231BR2024' }
    ],
    erp: {
      documentoContabil: '5100901231',
      empresa: '3000',
      ano: '2024'
    }
  },
  {
    id: '45678001',
    type: 'Duplicata Mercantil',
    iud: 'DM456781BR2024',
    issueDate: '15/09/2024',
    dueDate: '30/09/2024',
    currentDueDate: '30/09/2024',
    amount: 31800.00,
    sacador: {
      name: 'Atacadista DEF LTDA',
      cnpj: '44.555.666/0001-77',
      address: 'Av. Atacado, 222 - Recife/PE'
    },
    sacado: {
      name: 'Distribuidora Litoral LTDA',
      cnpj: '33.444.555/0001-66'
    },
    discountValue: 318.00,
    updateValue: 159.00,
    lastUpdateDate: '20/09/2024',
    valueUpdateDate: '20/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '001 - Banco do Brasil S.A.',
      agencia: '5678',
      conta: '90123',
      digitoConta: '4'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '05/10/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -66,
    diasParaManifestacao: 0,
    numeroNota: 'NF-456781',
    notaFiscal: {
      numero: 'NF-456781',
      serie: '1',
      dataEmissao: '15/09/2024',
      chave: '35240844555666000177550010004567811456780001'
    },
    duplicatas: [
      { item: '049', numero: 1, dataEmissao: '15/09/2024', dataVencimento: '30/09/2024', valor: 31800.00, iud: 'DM456781BR2024' }
    ],
    erp: {
      documentoContabil: '5100456781',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '45678002',
    type: 'Duplicata Mercantil',
    iud: 'DM456782BR2024',
    issueDate: '15/09/2024',
    dueDate: '30/10/2024',
    currentDueDate: '30/10/2024',
    amount: 31800.00,
    sacador: {
      name: 'Atacadista DEF LTDA',
      cnpj: '44.555.666/0001-77',
      address: 'Av. Atacado, 222 - Recife/PE'
    },
    sacado: {
      name: 'Distribuidora Litoral LTDA',
      cnpj: '33.444.555/0001-66'
    },
    discountValue: 318.00,
    updateValue: 0.00,
    lastUpdateDate: '15/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '001 - Banco do Brasil S.A.',
      agencia: '5678',
      conta: '90123',
      digitoConta: '4'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '05/11/2024',
    manifestacaoHora: '03:00',
    manifestacaoUsuario: 'automação',
    diasPendente: -36,
    diasParaManifestacao: 0,
    numeroNota: 'NF-456781',
    notaFiscal: {
      numero: 'NF-456781',
      serie: '1',
      dataEmissao: '15/09/2024',
      chave: '35240844555666000177550010004567821456780002'
    },
    duplicatas: [
      { item: '050', numero: 2, dataEmissao: '15/09/2024', dataVencimento: '30/10/2024', valor: 31800.00, iud: 'DM456782BR2024' }
    ],
    erp: {
      documentoContabil: '5100456781',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '56789001',
    type: 'Duplicata de Serviço',
    iud: 'DS567891BR2024',
    issueDate: '20/09/2024',
    dueDate: '05/10/2024',
    currentDueDate: '05/10/2024',
    amount: 42500.00,
    sacador: {
      name: 'Distribuidora GHI S.A.',
      cnpj: '66.777.888/0001-99',
      address: 'Rua Distribuição, 333 - Fortaleza/CE'
    },
    sacado: {
      name: 'Rede Comercial Nordeste S.A.',
      cnpj: '88.999.000/0001-11'
    },
    discountValue: 425.00,
    updateValue: 212.50,
    lastUpdateDate: '25/09/2024',
    valueUpdateDate: '25/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '10491.12345 67890.123456 78901.234567 3 12340000042500',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'CEF-2024-00098765'
    },
    status: 'Notificação recebida',
    manifestation: 'Manifestação Aceite/Recusa',
    statusManifestacao: 'em_fila_analise_manual',
    diasPendente: -61,
    diasParaManifestacao: 1,
    numeroNota: 'NF-567891',
    notaFiscal: {
      numero: 'NF-567891',
      serie: '2',
      dataEmissao: '20/09/2024',
      chave: '35240866777888000199550020005678911567890001'
    },
    duplicatas: [
      { item: '051', numero: 1, dataEmissao: '20/09/2024', dataVencimento: '05/10/2024', valor: 42500.00, iud: 'DS567891BR2024' }
    ],
    erp: {
      documentoContabil: '5100567891',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '60100001',
    type: 'Duplicata Mercantil',
    iud: 'DM601001BR2025',
    issueDate: '02/01/2025',
    dueDate: '20/02/2025',
    currentDueDate: '20/02/2025',
    amount: 18500.00,
    sacador: {
      name: 'Metalúrgica Progresso S.A.',
      cnpj: '14.567.890/0001-23',
      address: 'Rod. Industrial, 500 - Joinville/SC'
    },
    sacado: {
      name: 'Construtora Alpha LTDA',
      cnpj: '87.654.321/0001-09'
    },
    discountValue: 0.00,
    updateValue: 0.00,
    lastUpdateDate: '02/01/2025',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '10491.14567 89000.012300 00000.000100 1 90500000018500',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'BB-2025-00100001'
    },
    status: 'Recebida',
    manifestation: '-',
    statusManifestacao: 'recebida',
    diasPendente: 1,
    diasParaManifestacao: 10,
    numeroNota: 'NF-601001',
    notaFiscal: {
      numero: 'NF-601001',
      serie: '1',
      dataEmissao: '02/01/2025',
      chave: '35250114567890000123550010006010011601000001'
    },
    duplicatas: [
      { item: '056', numero: 1, dataEmissao: '02/01/2025', dataVencimento: '20/02/2025', valor: 9250.00, iud: 'DM601001BR2025-01' },
      { item: '018', numero: 2, dataEmissao: '02/01/2025', dataVencimento: '20/03/2025', valor: 9250.00, iud: 'DM601001BR2025-02' }
    ],
    erp: {
      documentoContabil: '5100601001',
      empresa: '3000',
      ano: '2025'
    }
  },
  {
    id: '60100002',
    type: 'Duplicata de Serviço',
    iud: 'DS601002BR2025',
    issueDate: '05/01/2025',
    dueDate: '25/02/2025',
    currentDueDate: '25/02/2025',
    amount: 9750.00,
    sacador: {
      name: 'Consultoria Estratégia LTDA',
      cnpj: '25.678.901/0001-34',
      address: 'Av. Faria Lima, 1200 - São Paulo/SP'
    },
    sacado: {
      name: 'Tech Solutions Brasil S.A.',
      cnpj: '76.543.210/0001-98'
    },
    discountValue: 97.50,
    updateValue: 0.00,
    lastUpdateDate: '05/01/2025',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'CNPJ',
      chavePix: '25.678.901/0001-34'
    },
    status: 'Em análise automática',
    manifestation: '-',
    statusManifestacao: 'em_analise_automatica',
    diasPendente: 3,
    diasParaManifestacao: 10,
    numeroNota: 'NF-601002',
    notaFiscal: {
      numero: 'NF-601002',
      serie: '2',
      dataEmissao: '05/01/2025',
      chave: '35250125678901000134550020006010021601000002'
    },
    duplicatas: [
      { item: '052', numero: 1, dataEmissao: '05/01/2025', dataVencimento: '25/02/2025', valor: 9750.00, iud: 'DS601002BR2025' }
    ],
    erp: {
      documentoContabil: '5100601002',
      empresa: '2000',
      ano: '2025'
    }
  },
  {
    id: '60100003',
    type: 'Duplicata Mercantil',
    iud: 'DM601003BR2025',
    issueDate: '07/01/2025',
    dueDate: '28/02/2025',
    currentDueDate: '28/02/2025',
    amount: 32100.00,
    sacador: {
      name: 'Distribuidora Nacional S.A.',
      cnpj: '36.789.012/0001-45',
      address: 'Rod. Anchieta, km 45 - São Bernardo/SP'
    },
    sacado: {
      name: 'Rede Varejo Centro LTDA',
      cnpj: '65.432.109/0001-87'
    },
    discountValue: 321.00,
    updateValue: 160.50,
    lastUpdateDate: '07/01/2025',
    valueUpdateDate: '07/01/2025',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '033 - Santander Brasil S.A.',
      agencia: '3456',
      conta: '78901',
      digitoConta: '2'
    },
    status: 'Em fila de processamento',
    manifestation: '-',
    statusManifestacao: 'em_fila_processamento',
    diasPendente: 5,
    diasParaManifestacao: 10,
    numeroNota: 'NF-601003',
    notaFiscal: {
      numero: 'NF-601003',
      serie: '1',
      dataEmissao: '07/01/2025',
      chave: '35250136789012000145550010006010031601000003'
    },
    duplicatas: [
      { item: '071', numero: 1, dataEmissao: '07/01/2025', dataVencimento: '28/02/2025', valor: 10700.00, iud: 'DM601003BR2025-01' },
      { item: '034', numero: 2, dataEmissao: '07/01/2025', dataVencimento: '28/03/2025', valor: 10700.00, iud: 'DM601003BR2025-02' },
      { item: '092', numero: 3, dataEmissao: '07/01/2025', dataVencimento: '28/04/2025', valor: 10700.00, iud: 'DM601003BR2025-03' }
    ],
    erp: {
      documentoContabil: '5100601003',
      empresa: '1000',
      ano: '2025'
    }
  },
  {
    id: '60100004',
    type: 'Duplicata de Serviço',
    iud: 'DS601004BR2025',
    issueDate: '09/01/2025',
    dueDate: '05/03/2025',
    currentDueDate: '05/03/2025',
    amount: 14300.00,
    sacador: {
      name: 'Logística Express EIRELI',
      cnpj: '47.890.123/0001-56',
      address: 'Rua dos Transportes, 890 - Curitiba/PR'
    },
    sacado: {
      name: 'Indústria Paranaense S.A.',
      cnpj: '54.321.098/0001-76'
    },
    discountValue: 0.00,
    updateValue: 0.00,
    lastUpdateDate: '09/01/2025',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '34191.47890 12300.015600 00000.000200 1 90900000014300',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'ITAU-2025-00200004'
    },
    status: 'Em fila de análise',
    manifestation: '-',
    statusManifestacao: 'em_fila_analise_manual',
    diasPendente: 7,
    diasParaManifestacao: 9,
    numeroNota: 'NF-601004',
    notaFiscal: {
      numero: 'NF-601004',
      serie: '2',
      dataEmissao: '09/01/2025',
      chave: '35250147890123000156550020006010041601000004'
    },
    duplicatas: [
      { item: '053', numero: 1, dataEmissao: '09/01/2025', dataVencimento: '05/03/2025', valor: 14300.00, iud: 'DS601004BR2025' }
    ],
    erp: {
      documentoContabil: '5100601004',
      empresa: '1000',
      ano: '2025'
    }
  },
  {
    id: '60100005',
    type: 'Duplicata Mercantil',
    iud: 'DM601005BR2025',
    issueDate: '12/12/2024',
    dueDate: '15/01/2025',
    currentDueDate: '15/01/2025',
    amount: 27600.00,
    sacador: {
      name: 'Química Industrial Sul S.A.',
      cnpj: '58.901.234/0001-67',
      address: 'Distrito Industrial, 234 - Canoas/RS'
    },
    sacado: {
      name: 'Farmacêutica Brasil LTDA',
      cnpj: '43.210.987/0001-65'
    },
    discountValue: 276.00,
    updateValue: 0.00,
    lastUpdateDate: '20/12/2024',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'Email',
      chavePix: 'financeiro@quimicasul.com.br'
    },
    status: 'Aceite automático',
    manifestation: 'Aceite Automático',
    statusManifestacao: 'aceite_automatico',
    manifestacaoData: '13/12/2024',
    manifestacaoHora: '02:30',
    manifestacaoUsuario: 'automação',
    diasPendente: -10,
    diasParaManifestacao: 0,
    numeroNota: 'NF-601005',
    notaFiscal: {
      numero: 'NF-601005',
      serie: '1',
      dataEmissao: '12/12/2024',
      chave: '35242458901234000167550010006010051601000005'
    },
    duplicatas: [
      { item: '063', numero: 1, dataEmissao: '12/12/2024', dataVencimento: '15/01/2025', valor: 27600.00, iud: 'DM601005BR2025' }
    ],
    erp: {
      documentoContabil: '5100601005',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '60100006',
    type: 'Duplicata de Serviço',
    iud: 'DS601006BR2025',
    issueDate: '15/12/2024',
    dueDate: '20/01/2025',
    currentDueDate: '20/01/2025',
    amount: 6890.00,
    sacador: {
      name: 'Serviços Técnicos Omega LTDA',
      cnpj: '69.012.345/0001-78',
      address: 'Rua da Tecnologia, 567 - Florianópolis/SC'
    },
    sacado: {
      name: 'Engenharia Costeira S.A.',
      cnpj: '32.109.876/0001-54'
    },
    discountValue: 0.00,
    updateValue: 68.90,
    lastUpdateDate: '22/12/2024',
    valueUpdateDate: '22/12/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '104 - Caixa Econômica Federal',
      agencia: '2345',
      conta: '67890',
      digitoConta: '1'
    },
    status: 'Recusa automática',
    manifestation: 'Recusa Automática',
    statusManifestacao: 'recusa_automatica',
    manifestacaoData: '16/12/2024',
    manifestacaoHora: '02:45',
    manifestacaoUsuario: 'automação',
    diasPendente: -8,
    diasParaManifestacao: 0,
    numeroNota: 'NF-601006',
    notaFiscal: {
      numero: 'NF-601006',
      serie: '2',
      dataEmissao: '15/12/2024',
      chave: '35242469012345000178550020006010061601000006'
    },
    duplicatas: [
      { item: '054', numero: 1, dataEmissao: '15/12/2024', dataVencimento: '20/01/2025', valor: 6890.00, iud: 'DS601006BR2025' }
    ],
    erp: {
      documentoContabil: '5100601006',
      empresa: '3000',
      ano: '2024'
    }
  },
  {
    id: '60100007',
    type: 'Duplicata Mercantil',
    iud: 'DM601007BR2025',
    issueDate: '10/01/2025',
    dueDate: '10/03/2025',
    currentDueDate: '10/03/2025',
    amount: 41200.00,
    sacador: {
      name: 'Alimentos Premium LTDA',
      cnpj: '70.123.456/0001-89',
      address: 'Av. Agroindustrial, 1500 - Ribeirão Preto/SP'
    },
    sacado: {
      name: 'Supermercados Economia S.A.',
      cnpj: '21.098.765/0001-43'
    },
    discountValue: 412.00,
    updateValue: 206.00,
    lastUpdateDate: '15/01/2025',
    valueUpdateDate: '15/01/2025',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '23793.70123 45600.018900 00000.000300 1 91000000041200',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'BB-2025-00300007'
    },
    status: 'Reprocessamento',
    manifestation: '-',
    statusManifestacao: 'reprocessamento',
    diasPendente: 9,
    diasParaManifestacao: 7,
    numeroNota: 'NF-601007',
    notaFiscal: {
      numero: 'NF-601007',
      serie: '1',
      dataEmissao: '10/01/2025',
      chave: '35250170123456000189550010006010071601000007'
    },
    duplicatas: [
      { item: '055', numero: 1, dataEmissao: '10/01/2025', dataVencimento: '10/03/2025', valor: 41200.00, iud: 'DM601007BR2025' }
    ],
    erp: {
      documentoContabil: '5100601007',
      empresa: '1000',
      ano: '2025'
    }
  },
  {
    id: '60100008',
    type: 'Duplicata de Serviço',
    iud: 'DS601008BR2025',
    issueDate: '20/11/2024',
    dueDate: '20/12/2024',
    currentDueDate: '20/12/2024',
    amount: 19800.00,
    sacador: {
      name: 'Manutenção Industrial Norte S.A.',
      cnpj: '81.234.567/0001-90',
      address: 'Distrito Industrial, 789 - Manaus/AM'
    },
    sacado: {
      name: 'Montadora Tropical LTDA',
      cnpj: '10.987.654/0001-32'
    },
    discountValue: 198.00,
    updateValue: 0.00,
    lastUpdateDate: '05/12/2024',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'CNPJ',
      chavePix: '81.234.567/0001-90'
    },
    status: 'Aceite manual',
    manifestation: 'Aceite Manual',
    statusManifestacao: 'aceite_manual',
    manifestacaoData: '10/12/2024',
    manifestacaoHora: '10:15',
    manifestacaoUsuario: 'Maria Oliveira',
    diasPendente: -30,
    diasParaManifestacao: 0,
    numeroNota: 'NF-601008',
    notaFiscal: {
      numero: 'NF-601008',
      serie: '1',
      dataEmissao: '20/11/2024',
      chave: '13240881234567000190550010006010081601008001'
    },
    duplicatas: [
      { item: '001', numero: 1, dataEmissao: '20/11/2024', dataVencimento: '20/12/2024', valor: 19800.00, iud: 'DS601008BR2025' }
    ],
    erp: {
      documentoContabil: '5100601008',
      empresa: '1000',
      ano: '2024'
    }
  },
  {
    id: '60100009',
    type: 'Duplicata Mercantil',
    iud: 'DM601009BR2025',
    issueDate: '25/11/2024',
    dueDate: '25/12/2024',
    currentDueDate: '25/12/2024',
    amount: 11350.00,
    sacador: {
      name: 'Têxtil Nordeste LTDA',
      cnpj: '92.345.678/0001-01',
      address: 'Rua Textil, 321 - Fortaleza/CE'
    },
    sacado: {
      name: 'Confecções Moda Brasil S.A.',
      cnpj: '09.876.543/0001-21'
    },
    discountValue: 113.50,
    updateValue: 56.75,
    lastUpdateDate: '10/12/2024',
    valueUpdateDate: '10/12/2024',
    paymentInstrument: {
      type: 'Transferência',
      tipoConta: 'Conta Corrente',
      ispbCompe: '756 - Sicoob',
      agencia: '4567',
      conta: '89012',
      digitoConta: '3'
    },
    status: 'Recusa manual',
    manifestation: 'Recusa Manual',
    statusManifestacao: 'recusa_manual',
    manifestacaoData: '15/12/2024',
    manifestacaoHora: '09:40',
    manifestacaoUsuario: 'João Ferreira',
    diasPendente: -20,
    diasParaManifestacao: 0,
    numeroNota: 'NF-601009',
    notaFiscal: {
      numero: 'NF-601009',
      serie: '1',
      dataEmissao: '25/11/2024',
      chave: '23240892345678000101550010006010091601009001'
    },
    duplicatas: [
      { item: '001', numero: 1, dataEmissao: '25/11/2024', dataVencimento: '25/12/2024', valor: 11350.00, iud: 'DM601009BR2025' }
    ],
    erp: {
      documentoContabil: '5100601009',
      empresa: '2000',
      ano: '2024'
    }
  },
  {
    id: '60100010',
    type: 'Duplicata de Serviço',
    iud: 'DS601010BR2025',
    issueDate: '01/10/2024',
    dueDate: '01/11/2024',
    currentDueDate: '01/11/2024',
    amount: 55000.00,
    sacador: {
      name: 'Engenharia Civil Construmax S.A.',
      cnpj: '03.456.789/0001-12',
      address: 'Av. Engenharia, 2000 - Brasília/DF'
    },
    sacado: {
      name: 'Incorporadora Capital LTDA',
      cnpj: '98.765.432/0001-10'
    },
    discountValue: 550.00,
    updateValue: 275.00,
    lastUpdateDate: '20/10/2024',
    valueUpdateDate: '20/10/2024',
    paymentInstrument: {
      type: 'Boleto',
      codigoBarras: '00190.03456 78900.011200 00000.000400 1 89000000055000',
      tipoBoleto: 'Cobrança Registrada',
      identificadorBoleto: 'BNB-2024-00400010'
    },
    status: 'Contestada',
    manifestation: 'Contestada',
    statusManifestacao: 'contestada',
    diasPendente: -45,
    diasParaManifestacao: 0,
    numeroNota: 'NF-601010',
    notaFiscal: {
      numero: 'NF-601010',
      serie: '2',
      dataEmissao: '01/10/2024',
      chave: '53240803456789000112550020006010101601010001'
    },
    duplicatas: [
      { item: '001', numero: 1, dataEmissao: '01/10/2024', dataVencimento: '01/11/2024', valor: 55000.00, iud: 'DS601010BR2025' }
    ],
    erp: {
      documentoContabil: '5100601010',
      empresa: '3000',
      ano: '2024'
    }
  },
  {
    id: '60100011',
    type: 'Duplicata Mercantil',
    iud: 'DM601011BR2025',
    issueDate: '08/01/2025',
    dueDate: '15/03/2025',
    currentDueDate: '15/03/2025',
    amount: 22750.00,
    sacador: {
      name: 'Peças Automotivas Centro-Oeste LTDA',
      cnpj: '15.678.901/0001-23',
      address: 'Rod. dos Automóveis, 678 - Goiânia/GO'
    },
    sacado: {
      name: 'Montadora Nacional S.A.',
      cnpj: '87.654.321/0001-09'
    },
    discountValue: 0.00,
    updateValue: 0.00,
    lastUpdateDate: '08/01/2025',
    paymentInstrument: {
      type: 'PIX',
      tipoChavePix: 'Aleatória',
      chavePix: 'f8a9b2c3-d4e5-6789-0abc-def123456789'
    },
    status: 'Reaberta',
    manifestation: '-',
    statusManifestacao: 'reprocessamento',
    diasPendente: 12,
    diasParaManifestacao: 5,
    numeroNota: 'NF-601011',
    notaFiscal: {
      numero: 'NF-601011',
      serie: '1',
      dataEmissao: '08/01/2025',
      chave: '52250115678901000123550010006010111601011001'
    },
    duplicatas: [
      { item: '001', numero: 1, dataEmissao: '08/01/2025', dataVencimento: '15/03/2025', valor: 22750.00, iud: 'DM601011BR2025' }
    ],
    erp: {
      documentoContabil: '5100601011',
      empresa: '1000',
      ano: '2025'
    }
  }
];
