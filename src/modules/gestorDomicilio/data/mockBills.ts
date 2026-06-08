import { Bill } from '@/modules/gestorDomicilio/types/bill';

export const mockBills: Bill[] = [
  {
    id: '24907001',
    type: 'Duplicata Mercantil',
    iud: 'DM240907001BR2024',
    issueDate: '15/08/2024',
    dueDate: '10/06/2024',
    notificationDate: '01/08/2024',
    amount: 54000,
    sacador: {
      name: 'Fornecedor ABC LTDA',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - São Paulo/SP'
    },
    discountValue: 540,
    updateValue: 0,
    lastUpdateDate: '01/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'BB - Ag: 1234-5 CC: 67890-1'
    },
    newReceiver: {
      name: 'Fator XYZ S.A.',
      cnpj: '99.888.777/0001-11'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Banco Safra - Ag: 0099 CC: 88888-9'
    },
    status: 'Notificação recebida',
    manifestation: 'Manifestação Aceite/Recusa',
    requiredAction: 'Alteração Pendente',
    manifestationDeadline: '2024-12-10',
    manifestationStatus: 'pending',
    hasDomicileChange: true,
    domicileChangeId: 'dc001'
  },
  {
    id: '22860009',
    type: 'Duplicata de Serviço',
    iud: 'DS228609BR2024',
    issueDate: '20/09/2024',
    dueDate: '15/07/2024',
    notificationDate: '10/09/2024',
    amount: 7222.22,
    sacador: {
      name: 'Distribuidora XYZ S.A.',
      cnpj: '98.765.432/0001-10',
      address: 'Av. Paulista, 1000 - São Paulo/SP'
    },
    discountValue: 72.22,
    updateValue: 144.44,
    lastUpdateDate: '25/09/2024',
    paymentInstrument: {
      type: 'PIX',
      details: 'Chave: 98.765.432/0001-10'
    },
    newReceiver: {
      name: 'Banco Crédito S.A.',
      cnpj: '77.666.555/0001-44'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: recebimentos@bancocredito.com.br'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '11383001',
    type: 'Duplicata Mercantil',
    iud: 'DM113831BR2024',
    issueDate: '27/08/2024',
    dueDate: '20/08/2024',
    notificationDate: '20/08/2024',
    amount: 8000,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    discountValue: 0,
    updateValue: 80,
    lastUpdateDate: '05/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'Itaú - Ag: 0001 CC: 12345-6'
    },
    newReceiver: {
      name: 'Financeira Prime LTDA',
      cnpj: '55.444.333/0001-22'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Bradesco - Ag: 2233 CC: 44556-7'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '11383002',
    type: 'Duplicata Mercantil',
    iud: 'DM113832BR2024',
    issueDate: '27/08/2024',
    dueDate: '05/09/2024',
    notificationDate: '20/08/2024',
    amount: 8000,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    discountValue: 0,
    updateValue: 0,
    lastUpdateDate: '27/08/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'Itaú - Ag: 0001 CC: 12345-6'
    },
    newReceiver: {
      name: 'Investimentos Capital S.A.',
      cnpj: '66.555.444/0001-33'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Santander - Ag: 3344 CC: 55667-8'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '11383003',
    type: 'Duplicata Mercantil',
    iud: 'DM113833BR2024',
    issueDate: '27/08/2024',
    dueDate: '25/09/2024',
    notificationDate: '20/08/2024',
    amount: 8000,
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    discountValue: 160,
    updateValue: 0,
    lastUpdateDate: '27/08/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'Itaú - Ag: 0001 CC: 12345-6'
    },
    newReceiver: {
      name: 'Fomento Mercantil EIRELI',
      cnpj: '88.999.000/0001-11'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: fomento@mercantil.com.br'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '33445001',
    type: 'Duplicata de Serviço',
    iud: 'DS334451BR2024',
    issueDate: '01/09/2024',
    dueDate: '15/12/2025',
    notificationDate: '25/08/2024',
    amount: 12500,
    sacador: {
      name: 'Comercial QWE EIRELI',
      cnpj: '55.666.777/0001-88',
      address: 'Rua Comercial, 789 - Rio de Janeiro/RJ'
    },
    discountValue: 250,
    updateValue: 125,
    lastUpdateDate: '10/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'Caixa - Ag: 4567 CC: 89012-3'
    },
    newReceiver: {
      name: 'Credito Fácil LTDA',
      cnpj: '33.222.111/0001-99'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: credito@facil.com.br'
    },
    status: 'Notificação recebida',
    manifestation: 'Aceito',
    requiredAction: 'Alteração Pendente',
    manifestationDeadline: '2024-12-15',
    manifestationStatus: 'pending',
    hasDomicileChange: true,
    domicileChangeId: 'dc002'
  },
  {
    id: '33445002',
    type: 'Duplicata de Serviço',
    iud: 'DS334452BR2024',
    issueDate: '01/09/2024',
    dueDate: '20/12/2025',
    notificationDate: '25/08/2024',
    amount: 12500,
    sacador: {
      name: 'Comercial QWE EIRELI',
      cnpj: '55.666.777/0001-88',
      address: 'Rua Comercial, 789 - Rio de Janeiro/RJ'
    },
    discountValue: 250,
    updateValue: 0,
    lastUpdateDate: '01/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'Caixa - Ag: 4567 CC: 89012-3'
    },
    newReceiver: {
      name: 'Capital Investimentos LTDA',
      cnpj: '44.333.222/0001-77'
    },
    newLiquidationAccount: {
      instrument: 'Boleto',
      details: 'Santander - Ag: 5566 CC: 77889-0'
    },
    status: 'Notificação recebida',
    manifestation: 'Aceito',
    requiredAction: 'Alteração Pendente',
    manifestationDeadline: '2024-12-09',
    manifestationStatus: 'pending',
    hasDomicileChange: true,
    domicileChangeId: 'dc003'
  },
  {
    id: '77641001',
    type: 'Duplicata Mercantil',
    iud: 'DM776411BR2024',
    issueDate: '03/09/2024',
    dueDate: '28/12/2025',
    notificationDate: '28/08/2024',
    amount: 7200,
    sacador: {
      name: 'Atacadista JKL S.A.',
      cnpj: '33.444.555/0001-66',
      address: 'Av. Atacadista, 321 - Belo Horizonte/MG'
    },
    discountValue: 0,
    updateValue: 360,
    lastUpdateDate: '15/09/2024',
    paymentInstrument: {
      type: 'PIX',
      details: 'Chave: atacadista@jkl.com.br'
    },
    newReceiver: {
      name: 'Crédito Atacado LTDA',
      cnpj: '22.111.000/0001-99'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: credito@atacado.com.br'
    },
    status: 'Recusada',
    manifestation: 'Recusado',
    requiredAction: 'Recusado'
  },
  {
    id: '74293001',
    type: 'Duplicata Mercantil',
    iud: 'DM742931BR2024',
    issueDate: '14/09/2024',
    dueDate: '10/01/2026',
    notificationDate: '07/09/2024',
    amount: 7200,
    sacador: {
      name: 'Distribuidora MNO LTDA',
      cnpj: '77.888.999/0001-00',
      address: 'Rua Distribuição, 654 - Porto Alegre/RS'
    },
    discountValue: 144,
    updateValue: 0,
    lastUpdateDate: '14/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'Bradesco - Ag: 7890 CC: 12345-7'
    },
    newReceiver: {
      name: 'Factoring Sul LTDA',
      cnpj: '33.222.111/0001-88'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Caixa - Ag: 4455 CC: 66778-9'
    },
    status: 'Recusada',
    manifestation: 'Recusado',
    requiredAction: 'Recusado'
  },
  {
    id: '89012001',
    type: 'Duplicata de Serviço',
    iud: 'DS890121BR2024',
    issueDate: '06/09/2024',
    dueDate: '25/01/2026',
    notificationDate: '30/08/2024',
    amount: 15750,
    sacador: {
      name: 'Indústria RST LTDA',
      cnpj: '12.345.678/0001-99',
      address: 'Distrito Industrial, 987 - Campinas/SP'
    },
    discountValue: 315,
    updateValue: 157.5,
    lastUpdateDate: '18/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'Santander - Ag: 3456 CC: 78901-2'
    },
    newReceiver: {
      name: 'Banco Empresarial S.A.',
      cnpj: '44.555.666/0001-77'
    },
    newLiquidationAccount: {
      instrument: 'Boleto',
      details: 'Itaú - Ag: 5566 CC: 77889-0'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '89012002',
    type: 'Duplicata de Serviço',
    iud: 'DS890122BR2024',
    issueDate: '06/09/2024',
    dueDate: '05/02/2026',
    notificationDate: '30/08/2024',
    amount: 15750,
    sacador: {
      name: 'Indústria RST LTDA',
      cnpj: '12.345.678/0001-99',
      address: 'Distrito Industrial, 987 - Campinas/SP'
    },
    discountValue: 315,
    updateValue: 157.5,
    lastUpdateDate: '18/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'Santander - Ag: 3456 CC: 78901-2'
    },
    newReceiver: {
      name: 'Crédito Industrial S.A.',
      cnpj: '55.666.777/0001-88'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: pagamentos@creditoindustrial.com.br'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '90123001',
    type: 'Duplicata Mercantil',
    iud: 'DM901231BR2024',
    issueDate: '10/09/2024',
    dueDate: '15/02/2026',
    notificationDate: '03/09/2024',
    amount: 23400,
    sacador: {
      name: 'Comercial UVW S.A.',
      cnpj: '22.333.444/0001-55',
      address: 'Rua Comercial, 111 - Salvador/BA'
    },
    discountValue: 234,
    updateValue: 0,
    lastUpdateDate: '10/09/2024',
    paymentInstrument: {
      type: 'PIX',
      details: 'Chave: comercial@uvw.com.br'
    },
    newReceiver: {
      name: 'Banco Financiador SA',
      cnpj: '11.111.111/0001-22'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: pagamentos@bancofin.com.br'
    },
    status: 'Notificação recebida',
    manifestation: 'Manifestação Aceite/Recusa',
    requiredAction: 'Alteração Pendente',
    manifestationDeadline: '2024-12-11',
    manifestationStatus: 'pending',
    hasDomicileChange: true,
    domicileChangeId: 'dc004'
  },
  {
    id: '45678001',
    type: 'Duplicata Mercantil',
    iud: 'DM456781BR2024',
    issueDate: '15/09/2024',
    dueDate: '01/03/2026',
    notificationDate: '08/09/2024',
    amount: 31800,
    sacador: {
      name: 'Atacadista DEF LTDA',
      cnpj: '44.555.666/0001-77',
      address: 'Av. Atacado, 222 - Recife/PE'
    },
    discountValue: 318,
    updateValue: 159,
    lastUpdateDate: '20/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'BB - Ag: 5678 CC: 90123-4'
    },
    newReceiver: {
      name: 'Nordeste Factoring S.A.',
      cnpj: '66.777.888/0001-99'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'BB - Ag: 6677 CC: 88990-1'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '45678002',
    type: 'Duplicata Mercantil',
    iud: 'DM456782BR2024',
    issueDate: '15/09/2024',
    dueDate: '20/03/2026',
    notificationDate: '08/09/2024',
    amount: 31800,
    sacador: {
      name: 'Atacadista DEF LTDA',
      cnpj: '44.555.666/0001-77',
      address: 'Av. Atacado, 222 - Recife/PE'
    },
    discountValue: 318,
    updateValue: 0,
    lastUpdateDate: '15/09/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'BB - Ag: 5678 CC: 90123-4'
    },
    newReceiver: {
      name: 'Fomento Nordeste LTDA',
      cnpj: '77.888.999/0001-00'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: fomento@nordeste.com.br'
    },
    status: 'Aceita - Conta criada',
    manifestation: 'Aceito',
    requiredAction: 'Acatado'
  },
  {
    id: '56789001',
    type: 'Duplicata de Serviço',
    iud: 'DS567891BR2024',
    issueDate: '20/09/2024',
    dueDate: '10/04/2026',
    notificationDate: '13/09/2024',
    amount: 42500,
    sacador: {
      name: 'Distribuidora GHI S.A.',
      cnpj: '66.777.888/0001-99',
      address: 'Rua Distribuição, 333 - Fortaleza/CE'
    },
    discountValue: 425,
    updateValue: 212.5,
    lastUpdateDate: '25/09/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'Caixa - Ag: 9012 CC: 34567-8'
    },
    newReceiver: {
      name: 'Factoring Brasil S.A.',
      cnpj: '88.777.666/0001-55'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Banco do Brasil - Ag: 1122 CC: 33445-6'
    },
    status: 'Notificação recebida',
    manifestation: 'Manifestação Aceite/Recusa',
    requiredAction: 'Alteração Pendente',
    manifestationDeadline: '2024-12-20',
    manifestationStatus: 'pending',
    hasDomicileChange: true,
    domicileChangeId: 'dc005'
  },
  {
    id: '67890001',
    type: 'Duplicata Mercantil',
    iud: 'DM678901BR2024',
    issueDate: '10/11/2024',
    dueDate: '25/04/2026',
    notificationDate: '23/11/2024',
    amount: 18900,
    sacador: {
      name: 'Comercial ABC LTDA',
      cnpj: '11.222.333/0001-44',
      address: 'Rua Comercial, 500 - Curitiba/PR'
    },
    discountValue: 189,
    updateValue: 0,
    lastUpdateDate: '10/11/2024',
    paymentInstrument: {
      type: 'PIX',
      details: 'Chave: comercial@abc.com.br'
    },
    newReceiver: {
      name: 'Banco do Sul S.A.',
      cnpj: '88.999.000/0001-11'
    },
    newLiquidationAccount: {
      instrument: 'PIX',
      details: 'Chave: bancodosul@pagamentos.com.br'
    },
    status: 'Notificação recebida',
    manifestation: 'Pendente',
    requiredAction: 'Manifestação Aceite/Recusa'
  },
  {
    id: '67890002',
    type: 'Duplicata de Serviço',
    iud: 'DS678902BR2024',
    issueDate: '15/11/2024',
    dueDate: '15/05/2026',
    notificationDate: '18/11/2024',
    amount: 25600,
    sacador: {
      name: 'Serviços TEC LTDA',
      cnpj: '22.333.444/0001-55',
      address: 'Av. Tecnologia, 1000 - São Paulo/SP'
    },
    discountValue: 256,
    updateValue: 0,
    lastUpdateDate: '15/11/2024',
    paymentInstrument: {
      type: 'Transferência',
      details: 'Itaú - Ag: 1234 CC: 56789-0'
    },
    newReceiver: {
      name: 'Tech Factoring EIRELI',
      cnpj: '99.000.111/0001-22'
    },
    newLiquidationAccount: {
      instrument: 'Transferência',
      details: 'Santander - Ag: 7788 CC: 99001-2'
    },
    status: 'Notificação recebida',
    manifestation: 'Pendente',
    requiredAction: 'Manifestação Aceite/Recusa'
  },
  {
    id: '67890003',
    type: 'Duplicata Mercantil',
    iud: 'DM678903BR2024',
    issueDate: '05/11/2024',
    dueDate: '01/06/2026',
    notificationDate: '13/11/2024',
    amount: 32000,
    sacador: {
      name: 'Indústria XYZ S.A.',
      cnpj: '33.444.555/0001-66',
      address: 'Distrito Industrial, 200 - Manaus/AM'
    },
    discountValue: 320,
    updateValue: 160,
    lastUpdateDate: '05/11/2024',
    paymentInstrument: {
      type: 'Boleto',
      details: 'BB - Ag: 2345 CC: 67890-1'
    },
    newReceiver: {
      name: 'Amazônia Crédito S.A.',
      cnpj: '00.111.222/0001-33'
    },
    newLiquidationAccount: {
      instrument: 'Boleto',
      details: 'Bradesco - Ag: 8899 CC: 00112-3'
    },
    status: 'Notificação recebida',
    manifestation: 'Pendente',
    requiredAction: 'Manifestação Aceite/Recusa'
  }
];
