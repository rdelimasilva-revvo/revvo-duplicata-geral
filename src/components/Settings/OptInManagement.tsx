import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Building2, ToggleLeft, ToggleRight, Plus, Edit2, Trash2, X } from 'lucide-react';

interface OptInRecord {
  id: string;
  financiador: string;
  termo_renovacao: string | null;
  ativo: boolean;
  data_realizacao: string;
  data_vencimento: string;
  created_at: string;
  updated_at: string;
}

// Mock data
const initialMockData: OptInRecord[] = [
  {
    id: '1',
    financiador: 'Banco Pantera',
    termo_renovacao: 'termo-banco-pantera',
    ativo: true,
    data_realizacao: '2024-06-15',
    data_vencimento: '2025-06-15',
    created_at: '2024-06-15T10:00:00Z',
    updated_at: '2024-06-15T10:00:00Z'
  },
  {
    id: '2',
    financiador: 'Banco Itaú',
    termo_renovacao: 'termo-banco-itau',
    ativo: true,
    data_realizacao: '2024-09-20',
    data_vencimento: '2025-03-20',
    created_at: '2024-09-20T14:30:00Z',
    updated_at: '2024-09-20T14:30:00Z'
  },
  {
    id: '3',
    financiador: 'Banco Bradesco',
    termo_renovacao: 'termo-banco-bradesco',
    ativo: true,
    data_realizacao: '2024-03-10',
    data_vencimento: '2025-03-10',
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z'
  },
  {
    id: '4',
    financiador: 'Banco Santander',
    termo_renovacao: 'termo-banco-santander',
    ativo: false,
    data_realizacao: '2024-01-25',
    data_vencimento: '2025-01-25',
    created_at: '2024-01-25T16:45:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '5',
    financiador: 'Banco do Brasil',
    termo_renovacao: 'termo-banco-brasil',
    ativo: true,
    data_realizacao: '2024-08-05',
    data_vencimento: '2025-08-05',
    created_at: '2024-08-05T11:20:00Z',
    updated_at: '2024-08-05T11:20:00Z'
  },
  {
    id: '6',
    financiador: 'Banco Safra',
    termo_renovacao: 'termo-banco-safra',
    ativo: true,
    data_realizacao: '2024-05-18',
    data_vencimento: '2025-05-18',
    created_at: '2024-05-18T13:30:00Z',
    updated_at: '2024-05-18T13:30:00Z'
  },
  {
    id: '7',
    financiador: 'Banco BTG Pactual',
    termo_renovacao: 'termo-banco-btg',
    ativo: false,
    data_realizacao: '2023-12-12',
    data_vencimento: '2024-12-12',
    created_at: '2023-12-12T08:45:00Z',
    updated_at: '2023-12-12T08:45:00Z'
  },
  {
    id: '8',
    financiador: 'Banco Inter',
    termo_renovacao: 'termo-banco-inter',
    ativo: true,
    data_realizacao: '2024-07-22',
    data_vencimento: '2025-07-22',
    created_at: '2024-07-22T15:10:00Z',
    updated_at: '2024-07-22T15:10:00Z'
  },
  {
    id: '9',
    financiador: 'Banco Original',
    termo_renovacao: 'termo-banco-original',
    ativo: true,
    data_realizacao: '2024-04-08',
    data_vencimento: '2025-04-08',
    created_at: '2024-04-08T10:25:00Z',
    updated_at: '2024-04-08T10:25:00Z'
  },
  {
    id: '10',
    financiador: 'Banco C6',
    termo_renovacao: 'termo-banco-c6',
    ativo: false,
    data_realizacao: '2024-02-14',
    data_vencimento: '2025-02-14',
    created_at: '2024-02-14T12:00:00Z',
    updated_at: '2024-02-14T12:00:00Z'
  },
  {
    id: '11',
    financiador: 'Banco Votorantim',
    termo_renovacao: 'termo-banco-votorantim',
    ativo: true,
    data_realizacao: '2024-10-03',
    data_vencimento: '2025-10-03',
    created_at: '2024-10-03T14:15:00Z',
    updated_at: '2024-10-03T14:15:00Z'
  },
  {
    id: '12',
    financiador: 'Banco Pine',
    termo_renovacao: 'termo-banco-pine',
    ativo: true,
    data_realizacao: '2024-06-30',
    data_vencimento: '2025-06-30',
    created_at: '2024-06-30T09:40:00Z',
    updated_at: '2024-06-30T09:40:00Z'
  },
  {
    id: '13',
    financiador: 'Banco Modal',
    termo_renovacao: 'termo-banco-modal',
    ativo: false,
    data_realizacao: '2023-11-20',
    data_vencimento: '2024-11-20',
    created_at: '2023-11-20T16:20:00Z',
    updated_at: '2023-11-20T16:20:00Z'
  },
  {
    id: '14',
    financiador: 'Banco XP',
    termo_renovacao: 'termo-banco-xp',
    ativo: true,
    data_realizacao: '2024-09-12',
    data_vencimento: '2025-09-12',
    created_at: '2024-09-12T11:55:00Z',
    updated_at: '2024-09-12T11:55:00Z'
  },
  {
    id: '15',
    financiador: 'Banco Alfa',
    termo_renovacao: 'termo-banco-alfa',
    ativo: true,
    data_realizacao: '2024-03-28',
    data_vencimento: '2025-03-28',
    created_at: '2024-03-28T13:10:00Z',
    updated_at: '2024-03-28T13:10:00Z'
  },
  {
    id: '16',
    financiador: 'Banco Fibra',
    termo_renovacao: 'termo-banco-fibra',
    ativo: false,
    data_realizacao: '2024-01-15',
    data_vencimento: '2025-01-15',
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-15T08:30:00Z'
  },
  {
    id: '17',
    financiador: 'Banco Daycoval',
    termo_renovacao: 'termo-banco-daycoval',
    ativo: true,
    data_realizacao: '2024-08-17',
    data_vencimento: '2025-08-17',
    created_at: '2024-08-17T15:45:00Z',
    updated_at: '2024-08-17T15:45:00Z'
  },
  {
    id: '18',
    financiador: 'Banco BMG',
    termo_renovacao: 'termo-banco-bmg',
    ativo: true,
    data_realizacao: '2024-05-07',
    data_vencimento: '2025-05-07',
    created_at: '2024-05-07T10:15:00Z',
    updated_at: '2024-05-07T10:15:00Z'
  },
  {
    id: '19',
    financiador: 'Banco Pan',
    termo_renovacao: 'termo-banco-pan',
    ativo: false,
    data_realizacao: '2023-10-25',
    data_vencimento: '2024-10-25',
    created_at: '2023-10-25T12:30:00Z',
    updated_at: '2023-10-25T12:30:00Z'
  },
  {
    id: '20',
    financiador: 'Banco Mercantil',
    termo_renovacao: 'termo-banco-mercantil',
    ativo: true,
    data_realizacao: '2024-07-09',
    data_vencimento: '2025-07-09',
    created_at: '2024-07-09T14:20:00Z',
    updated_at: '2024-07-09T14:20:00Z'
  },
  {
    id: '21',
    financiador: 'Banco Rendimento',
    termo_renovacao: 'termo-banco-rendimento',
    ativo: true,
    data_realizacao: '2024-04-22',
    data_vencimento: '2025-04-22',
    created_at: '2024-04-22T09:50:00Z',
    updated_at: '2024-04-22T09:50:00Z'
  },
  {
    id: '22',
    financiador: 'Banco Sofisa',
    termo_renovacao: 'termo-banco-sofisa',
    ativo: false,
    data_realizacao: '2024-02-05',
    data_vencimento: '2025-02-05',
    created_at: '2024-02-05T11:40:00Z',
    updated_at: '2024-02-05T11:40:00Z'
  }
];

// Terms content for each financier
const termsContent: Record<string, { title: string; content: string }> = {
  'termo-banco-pantera': {
    title: 'Termo de Adesão - Banco Pantera',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS</h3>
      
      <p class="mb-4">Por meio deste instrumento, a empresa <strong>[NOME DA EMPRESA]</strong>, inscrita no CNPJ sob o nº <strong>[CNPJ]</strong>, doravante denominada "EMPRESA", manifesta sua concordância e adesão aos termos e condições estabelecidos pelo <strong>BANCO PANTERA S.A.</strong>, instituição financeira inscrita no CNPJ sob o nº 12.345.678/0001-90, doravante denominado "FINANCIADOR".</p>

      <h4 class="text-md font-semibold mb-3 mt-6">1. OBJETO</h4>
      <p class="mb-4">O presente termo tem por objeto autorizar o FINANCIADOR a ter acesso e visibilidade aos recebíveis de duplicatas da EMPRESA, com a finalidade de análise de crédito e oferecimento de produtos financeiros adequados ao perfil da empresa.</p>

      <h4 class="text-md font-semibold mb-3 mt-6">2. AUTORIZAÇÃO DE ACESSO</h4>
      <p class="mb-4">A EMPRESA autoriza expressamente o FINANCIADOR a:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Acessar informações sobre seus recebíveis de duplicatas;</li>
        <li>Analisar o histórico de recebimentos e inadimplência;</li>
        <li>Consultar dados de sacados e avalistas;</li>
        <li>Utilizar as informações para análise de risco de crédito;</li>
        <li>Ofertar produtos financeiros baseados no perfil identificado.</li>
      </ul>

      <h4 class="text-md font-semibold mb-3 mt-6">3. PROTEÇÃO DE DADOS</h4>
      <p class="mb-4">O FINANCIADOR compromete-se a tratar todas as informações acessadas em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis, garantindo:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Confidencialidade absoluta das informações;</li>
        <li>Uso exclusivo para as finalidades descritas neste termo;</li>
        <li>Implementação de medidas de segurança adequadas;</li>
        <li>Não compartilhamento com terceiros não autorizados.</li>
      </ul>

      <h4 class="text-md font-semibold mb-3 mt-6">4. VIGÊNCIA</h4>
      <p class="mb-4">Este termo de adesão terá vigência de 12 (doze) meses a partir da data de sua assinatura, podendo ser renovado mediante acordo entre as partes.</p>

      <h4 class="text-md font-semibold mb-3 mt-6">5. REVOGAÇÃO</h4>
      <p class="mb-4">A EMPRESA poderá revogar esta autorização a qualquer momento, mediante comunicação formal ao FINANCIADOR, com antecedência mínima de 30 (trinta) dias.</p>

      <h4 class="text-md font-semibold mb-3 mt-6">6. DISPOSIÇÕES GERAIS</h4>
      <p class="mb-4">Este termo é regido pelas leis brasileiras e eventuais controvérsias serão dirimidas no foro da comarca da sede da EMPRESA.</p>

      <div class="mt-8 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">Data de adesão: [DATA]</p>
        <p class="text-sm text-gray-600">Empresa: [NOME DA EMPRESA]</p>
        <p class="text-sm text-gray-600">CNPJ: [CNPJ DA EMPRESA]</p>
      </div>
    `
  },
  'termo-banco-itau': {
    title: 'Termo de Adesão - Banco Itaú',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA COMPARTILHAMENTO DE RECEBÍVEIS</h3>
      
      <p class="mb-4">A empresa <strong>[NOME DA EMPRESA]</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>[CNPJ]</strong>, doravante denominada "ADERENTE", declara sua adesão aos termos e condições do <strong>BANCO ITAÚ UNIBANCO S.A.</strong>, instituição financeira inscrita no CNPJ sob o nº 60.701.190/0001-04, doravante denominado "BANCO".</p>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 1ª - DO OBJETO</h4>
      <p class="mb-4">O presente termo regula a autorização concedida pela ADERENTE ao BANCO para acesso, consulta e análise de informações relacionadas aos seus recebíveis de duplicatas, visando:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Avaliação do perfil creditício da empresa;</li>
        <li>Desenvolvimento de soluções financeiras personalizadas;</li>
        <li>Oferecimento de produtos de antecipação de recebíveis;</li>
        <li>Análise de risco para concessão de crédito.</li>
      </ul>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 2ª - DA AUTORIZAÇÃO</h4>
      <p class="mb-4">A ADERENTE autoriza o BANCO a:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Consultar informações sobre duplicatas emitidas;</li>
        <li>Verificar histórico de pagamentos de sacados;</li>
        <li>Analisar concentração de recebíveis por devedor;</li>
        <li>Avaliar prazos médios de recebimento;</li>
        <li>Consultar informações junto a bureaus de crédito sobre os sacados.</li>
      </ul>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 3ª - DA CONFIDENCIALIDADE</h4>
      <p class="mb-4">O BANCO obriga-se a manter absoluto sigilo sobre todas as informações acessadas, utilizando-as exclusivamente para os fins previstos neste termo, em conformidade com:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Lei Geral de Proteção de Dados Pessoais (LGPD);</li>
        <li>Lei do Sigilo Bancário (Lei Complementar nº 105/2001);</li>
        <li>Regulamentações do Banco Central do Brasil;</li>
        <li>Código de Ética e Conduta do Banco Itaú.</li>
      </ul>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 4ª - DO PRAZO</h4>
      <p class="mb-4">A presente autorização vigorará pelo prazo de 12 (doze) meses, contados da data de adesão, renovando-se automaticamente por períodos iguais e sucessivos, salvo manifestação em contrário de qualquer das partes.</p>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 5ª - DA REVOGAÇÃO</h4>
      <p class="mb-4">A ADERENTE poderá revogar esta autorização a qualquer tempo, mediante notificação por escrito ao BANCO, com antecedência mínima de 30 (trinta) dias corridos.</p>

      <h4 class="text-md font-semibold mb-3 mt-6">CLÁUSULA 6ª - DAS DISPOSIÇÕES FINAIS</h4>
      <p class="mb-4">Este termo será regido pelas leis da República Federativa do Brasil, elegendo-se o foro da comarca de São Paulo/SP para dirimir eventuais controvérsias.</p>

      <div class="mt-8 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">Banco Itaú Unibanco S.A.</p>
        <p class="text-sm text-gray-600">CNPJ: 60.701.190/0001-04</p>
        <p class="text-sm text-gray-600">Data de adesão: [DATA]</p>
      </div>
    `
  },
  // Generic terms for other banks
  'termo-banco-bradesco': {
    title: 'Termo de Adesão - Banco Bradesco',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO BRADESCO</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Bradesco S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-santander': {
    title: 'Termo de Adesão - Banco Santander',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO SANTANDER</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Santander (Brasil) S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-brasil': {
    title: 'Termo de Adesão - Banco do Brasil',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO DO BRASIL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco do Brasil S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-safra': {
    title: 'Termo de Adesão - Banco Safra',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO SAFRA</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Safra S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-btg': {
    title: 'Termo de Adesão - Banco BTG Pactual',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO BTG PACTUAL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco BTG Pactual S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-inter': {
    title: 'Termo de Adesão - Banco Inter',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO INTER</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Inter S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-original': {
    title: 'Termo de Adesão - Banco Original',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO ORIGINAL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Original S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-c6': {
    title: 'Termo de Adesão - Banco C6',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO C6</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco C6 S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-votorantim': {
    title: 'Termo de Adesão - Banco Votorantim',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO VOTORANTIM</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Votorantim S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-pine': {
    title: 'Termo de Adesão - Banco Pine',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO PINE</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Pine S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-modal': {
    title: 'Termo de Adesão - Banco Modal',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO MODAL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Modal S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-xp': {
    title: 'Termo de Adesão - Banco XP',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO XP</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco XP S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-alfa': {
    title: 'Termo de Adesão - Banco Alfa',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO ALFA</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Alfa S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-fibra': {
    title: 'Termo de Adesão - Banco Fibra',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO FIBRA</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Fibra S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-daycoval': {
    title: 'Termo de Adesão - Banco Daycoval',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO DAYCOVAL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Daycoval S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-bmg': {
    title: 'Termo de Adesão - Banco BMG',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO BMG</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco BMG S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-pan': {
    title: 'Termo de Adesão - Banco Pan',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO PAN</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Pan S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-mercantil': {
    title: 'Termo de Adesão - Banco Mercantil',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO MERCANTIL</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Mercantil do Brasil S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-rendimento': {
    title: 'Termo de Adesão - Banco Rendimento',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO RENDIMENTO</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Rendimento S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  },
  'termo-banco-sofisa': {
    title: 'Termo de Adesão - Banco Sofisa',
    content: `
      <h3 class="text-lg font-semibold mb-4">TERMO DE ADESÃO PARA ACESSO A RECEBÍVEIS - BANCO SOFISA</h3>
      <p class="mb-4">Termo padrão de autorização para acesso aos recebíveis de duplicatas pela instituição financeira Banco Sofisa S.A., com vigência de 12 meses e possibilidade de revogação mediante aviso prévio de 30 dias.</p>
      <p class="mb-4">Este documento estabelece as condições para compartilhamento de informações sobre recebíveis, respeitando a LGPD e demais normas aplicáveis.</p>
    `
  }
};

const OptInManagement = () => {
  const [optInRecords, setOptInRecords] = useState<OptInRecord[]>(initialMockData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(optInRecords.length / itemsPerPage));
  const paginatedRecords = optInRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<{ title: string; content: string } | null>(null);
  const [editingRecord, setEditingRecord] = useState<OptInRecord | null>(null);

  const [formData, setFormData] = useState({
    financiador: '',
    termo_renovacao: '',
    ativo: true,
    data_realizacao: '',
    data_vencimento: ''
  });

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const now = new Date().toISOString();
      
      if (editingRecord) {
        // Update existing record
        setOptInRecords(prev => prev.map(record => 
          record.id === editingRecord.id 
            ? {
                ...record,
                financiador: formData.financiador,
                termo_renovacao: formData.termo_renovacao || null,
                ativo: formData.ativo,
                data_realizacao: formData.data_realizacao,
                data_vencimento: formData.data_vencimento,
                updated_at: now
              }
            : record
        ));
      } else {
        // Add new record
        const newRecord: OptInRecord = {
          id: generateId(),
          financiador: formData.financiador,
          termo_renovacao: formData.termo_renovacao || null,
          ativo: formData.ativo,
          data_realizacao: formData.data_realizacao,
          data_vencimento: formData.data_vencimento,
          created_at: now,
          updated_at: now
        };
        
        setOptInRecords(prev => [newRecord, ...prev]);
      }

      resetForm();
      setShowAddModal(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving opt-in record:', error);
      setError('Erro ao salvar registro de opt-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (record: OptInRecord) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOptInRecords(prev => prev.map(r => 
        r.id === record.id 
          ? { ...r, ativo: !r.ativo, updated_at: new Date().toISOString() }
          : r
      ));
    } catch (error) {
      console.error('Error toggling opt-in status:', error);
      setError('Erro ao alterar status do opt-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOptInRecords(prev => prev.filter(record => record.id !== recordId));
    } catch (error) {
      console.error('Error deleting opt-in record:', error);
      setError('Erro ao excluir registro de opt-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowTerms = (termoKey: string) => {
    const terms = termsContent[termoKey];
    if (terms) {
      setSelectedTerms(terms);
      setShowTermsModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      financiador: '',
      termo_renovacao: '',
      ativo: true,
      data_realizacao: '',
      data_vencimento: ''
    });
  };

  const openEditModal = (record: OptInRecord) => {
    setEditingRecord(record);
    setFormData({
      financiador: record.financiador,
      termo_renovacao: record.termo_renovacao || '',
      ativo: record.ativo,
      data_realizacao: record.data_realizacao,
      data_vencimento: record.data_vencimento
    });
    setShowAddModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpiringSoon = (dateString: string) => {
    const expirationDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expirationDate <= thirtyDaysFromNow && expirationDate >= today;
  };

  const isExpired = (dateString: string) => {
    const expirationDate = new Date(dateString);
    const today = new Date();
    return expirationDate < today;
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Opt-in</h1>
            <p className="text-gray-600">Gerencie as autorizações de opt-in dos financiadores</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingRecord(null);
              setShowAddModal(true);
            }}
            disabled={isLoading}
            className="flex items-center px-4 h-8 bg-revvo-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Opt-in
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Opt-ins</p>
                <p className="text-2xl font-bold text-blue-900">{optInRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <ToggleRight className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Ativos</p>
                <p className="text-2xl font-bold text-blue-900">
                  {optInRecords.filter(record => record.ativo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Vencendo em 30 dias</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {optInRecords.filter(record => isExpiringSoon(record.data_vencimento)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-red-600 font-medium">Vencidos</p>
                <p className="text-2xl font-bold text-red-900">
                  {optInRecords.filter(record => isExpired(record.data_vencimento)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financiador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Realização
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Termo de Adesão
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {record.financiador}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.data_realizacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        isExpired(record.data_vencimento) 
                          ? 'text-red-600 font-medium' 
                          : isExpiringSoon(record.data_vencimento)
                            ? 'text-yellow-600 font-medium'
                            : 'text-gray-900'
                      }`}>
                        {formatDate(record.data_vencimento)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.termo_renovacao ? (
                        <button
                          onClick={() => handleShowTerms(record.termo_renovacao!)}
                          className="flex items-center text-revvo-blue hover:text-blue-600 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          <span className="text-sm">Ver Termo</span>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Não disponível</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(record)}
                        disabled={isLoading}
                        className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {record.ativo ? (
                          <ToggleRight className="w-6 h-6 text-green-500 hover:text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400 hover:text-gray-500" />
                        )}
                        <span className={`ml-2 text-sm ${
                          record.ativo ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {record.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(record)}
                          disabled={isLoading}
                          className="text-revvo-blue hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 px-4 py-3">
              {currentPage > 1 && (
                <button
                  className="h-8 px-3 border rounded-md text-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={isLoading}
                >
                  Anterior
                </button>
              )}
              {currentPage < totalPages && (
                <button
                  className="h-8 px-3 border rounded-md text-sm bg-[#0070F2] text-white"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={isLoading}
                >
                  Próxima
                </button>
              )}
            </div>
          </div>

          {optInRecords.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum opt-in cadastrado</p>
              <p className="text-gray-400">Clique em "Novo Opt-in" para começar</p>
            </div>
          )}
        </div>

        {/* Terms Modal */}
        {showTermsModal && selectedTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTerms.title}
                </h2>
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setSelectedTerms(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedTerms.content }}
                />
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setSelectedTerms(null);
                  }}
                  className="px-6 py-2 bg-revvo-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingRecord ? 'Editar Opt-in' : 'Novo Opt-in'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Financiador
                  </label>
                  <input
                    type="text"
                    value={formData.financiador}
                    onChange={(e) => setFormData({ ...formData, financiador: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-revvo-blue focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chave do Termo de Adesão
                  </label>
                  <select
                    value={formData.termo_renovacao}
                    onChange={(e) => setFormData({ ...formData, termo_renovacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-revvo-blue focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Selecione um termo</option>
                    <option value="termo-banco-pantera">Termo Banco Pantera</option>
                    <option value="termo-banco-itau">Termo Banco Itaú</option>
                    <option value="termo-banco-bradesco">Termo Banco Bradesco</option>
                    <option value="termo-banco-santander">Termo Banco Santander</option>
                    <option value="termo-banco-brasil">Termo Banco do Brasil</option>
                    <option value="termo-banco-safra">Termo Banco Safra</option>
                    <option value="termo-banco-btg">Termo Banco BTG Pactual</option>
                    <option value="termo-banco-inter">Termo Banco Inter</option>
                    <option value="termo-banco-original">Termo Banco Original</option>
                    <option value="termo-banco-c6">Termo Banco C6</option>
                    <option value="termo-banco-votorantim">Termo Banco Votorantim</option>
                    <option value="termo-banco-pine">Termo Banco Pine</option>
                    <option value="termo-banco-modal">Termo Banco Modal</option>
                    <option value="termo-banco-xp">Termo Banco XP</option>
                    <option value="termo-banco-alfa">Termo Banco Alfa</option>
                    <option value="termo-banco-fibra">Termo Banco Fibra</option>
                    <option value="termo-banco-daycoval">Termo Banco Daycoval</option>
                    <option value="termo-banco-bmg">Termo Banco BMG</option>
                    <option value="termo-banco-pan">Termo Banco Pan</option>
                    <option value="termo-banco-mercantil">Termo Banco Mercantil</option>
                    <option value="termo-banco-rendimento">Termo Banco Rendimento</option>
                    <option value="termo-banco-sofisa">Termo Banco Sofisa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Realização
                  </label>
                  <input
                    type="date"
                    value={formData.data_realizacao}
                    onChange={(e) => setFormData({ ...formData, data_realizacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-revvo-blue focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-revvo-blue focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="h-4 w-4 text-revvo-blue focus:ring-revvo-blue border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                    Autorização ativa
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingRecord(null);
                      resetForm();
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-revvo-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading && (
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    )}
                    {editingRecord ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 flex items-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-revvo-blue border-r-transparent mr-3"></div>
              <span className="text-gray-700">Processando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptInManagement;
