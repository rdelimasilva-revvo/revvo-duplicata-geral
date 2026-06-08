// @ts-nocheck
import React, { useState } from 'react'
import styled from 'styled-components'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  ComposedChart, Legend
} from 'recharts'
import { X, CaretUp, CaretDown, Calendar, FunnelSimple } from '@phosphor-icons/react'
import { InvoicesTable } from './components/InvoicesTable'
import { Invoice } from './types/invoice'
import './styles.css'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--secondary-text);

    &:hover {
      color: var(--primary-text);
    }
  }
`

const ModalBody = styled.div`
  padding: 24px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  &.full-width {
    grid-template-columns: 1fr;
  }
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text);
  }

  input, select {
    height: 40px;
    padding: 0 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--primary-blue);
    }
  }

  .date-input-wrapper {
    position: relative;

    input[type="date"] {
      padding-right: 40px;
    }

    .calendar-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--secondary-text);
      pointer-events: none;
    }
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;

    input[type="radio"] {
      width: 16px;
      height: 16px;
    }
  }
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);

  button {
    height: 36px;
    padding: 0 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &.cancel {
      background: white;
      border: 1px solid var(--border-color);
      color: var(--primary-text);

      &:hover {
        background: var(--background);
      }
    }

    &.save {
      background: var(--primary-blue);
      border: none;
      color: white;

      &:hover {
        background: #0056CC;
      }
    }
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--background);
`

const Main = styled.main`
  width: 100%;
  height: 100%;
  padding: 24px;
  min-height: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

const Header = styled.header`
  margin-bottom: 24px;
`

const FilterSection = styled.div`
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 20px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    cursor: pointer;
    user-select: none;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-text);
    }
  }

  .filter-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 16px;
    margin-bottom: 12px;
    margin-top: 12px;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text);
    }

    input, select {
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      background: white;
      color: var(--primary-text);

      &::placeholder {
        color: #9CA3AF;
      }

      &:focus {
        outline: none;
        border-color: #0070F2;
      }
    }
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    button {
      height: 36px;
      padding: 0 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background: white;
      color: var(--primary-text);

      &:hover {
        background: #F9FAFB;
      }

      &.primary {
        background: #0070F2;
        color: white;
        border: none;

        &:hover {
          background: #0056CC;
        }
      }
    }
  }

  @media (max-width: 640px) {
    padding: 16px;

    .filter-content {
      grid-template-columns: 1fr;
    }
  }
`

const DashboardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;

  > div:nth-child(1) {
    flex: 0 0 calc(25% - 12px);
  }

  > div:nth-child(2) {
    flex: 0 0 calc(25% - 12px);
  }

  > div:nth-child(3) {
    flex: 0 0 calc(25% - 12px);
  }

  > div:nth-child(4) {
    flex: 0 0 calc(25% - 12px);
  }

  @media (max-width: 1200px) and (min-width: 415px) {
    > div {
      flex: 0 0 calc(50% - 8px) !important;
      max-width: calc(50% - 8px);
    }
  }

  @media (max-width: 414px) {
    > div {
      flex: 0 0 100% !important;
    }
  }
`

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 14px;
    font-weight: normal;
  }
`

const CardSubtitle = styled.div`
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 16px;
`

const stackedBarData = [
  { month: 'Jan', pedidos: 10, ordens: 8 },
  { month: 'Fev', pedidos: 12, ordens: 10 },
  { month: 'Mar', pedidos: 9, ordens: 8 },
  { month: 'Abr', pedidos: 8, ordens: 7 },
]

const barData = [
  { month: 'Abr', value: 42 },
  { month: 'Mai', value: 30 },
  { month: 'Jun', value: 32 },
  { month: 'Jul', value: 28 },
  { month: 'Ago', value: 20 },
  { month: 'Set', value: 15 },
  { month: 'Out', value: 12 },
  { month: 'Nov', value: 10 },
  { month: 'Dez', value: 8 },
  { month: 'Jan', value: 7 },
  { month: 'Fev', value: 6 },
  { month: 'Mar', value: 5 },
]

const composedData = [
  { month: 'Abr', faturado: 50, aFaturar: 10 },
  { month: 'Mai', faturado: 45, aFaturar: 8 },
  { month: 'Jun', faturado: 42, aFaturar: 7 },
  { month: 'Jul', faturado: 38, aFaturar: 5 },
  { month: 'Ago', faturado: 32, aFaturar: 4 },
  { month: 'Set', faturado: 28, aFaturar: 3 },
  { month: 'Out', faturado: 25, aFaturar: 2 },
  { month: 'Nov', faturado: 22, aFaturar: 2 },
  { month: 'Dez', faturado: 20, aFaturar: 1 },
  { month: 'Jan', faturado: 18, aFaturar: 1 },
  { month: 'Fev', faturado: 17, aFaturar: 1 },
  { month: 'Mar', faturado: 16, aFaturar: 1 },
]

const pieData = [
  { name: 'Não Alocada', value: 13.09, color: '#64748B' },
  { name: 'Descontada', value: 45.21, color: '#0EA5E9' },
  { name: 'Garantia', value: 41.69, color: '#1E3A8A' },
]

function EscrituracaoDuplicata() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    dataVencimento: '',
    codigoCliente: ''
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    value: '',
    dueDate: '',
    paymentMethod: 'TED/DOC',
    bank: '117 - Corretora de Câmbio Ltda',
    agency: '0001',
    agencyDigit: '0',
    account: '123456',
    accountDigit: '6',
    accountType: 'Conta Corrente'
  })

  const handleEditClick = (invoice: Invoice) => {
    setEditFormData({
      value: invoice.total.toFixed(2),
      dueDate: invoice.dueDate.split('/').reverse().join('-'),
      paymentMethod: 'TED/DOC',
      bank: invoice.bank.name,
      agency: invoice.bank.agency.split('-')[0],
      agencyDigit: invoice.bank.agency.split('-')[1] || '0',
      account: invoice.bank.account.split('-')[0],
      accountDigit: invoice.bank.account.split('-')[1] || '6',
      accountType: 'Conta Corrente'
    })
    setIsEditModalOpen(true)
  }

  const handleSaveChanges = () => {
    setIsSaveConfirmOpen(true)
  }

  const handleCancelDuplicate = () => {
    setIsCancelConfirmOpen(true)
  }

  const handleCancelInstallment = () => {
    setShowCancelModal(true)
  }

  const confirmCancelDuplicate = () => {
    console.log('Cancelando duplicata')
    setIsCancelConfirmOpen(false)
  }

  const confirmSaveChanges = () => {
    console.log('Salvando alterações:', editFormData)
    setIsSaveConfirmOpen(false)
    setIsEditModalOpen(false)
  }

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      dataVencimento: '',
      codigoCliente: ''
    })
  }

  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', filters)
  }

  return (
    <div className="escrituracao-duplicata">
      <Container>
        <Main>
        <Header>
          <h2 className="text-2xl font-bold">Escrituração de Duplicatas</h2>
        </Header>

        <FilterSection>
          <div className="filter-header" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <h3>
              <FunnelSimple size={18} weight="regular" />
              Filtros
            </h3>
            {isFilterOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
          </div>

          {isFilterOpen && (
            <>
              <div className="filter-content">
                <div className="filter-field">
                  <label>Data Vencimento</label>
                  <input
                    type="date"
                    value={filters.dataVencimento}
                    onChange={(e) => handleFilterChange('dataVencimento', e.target.value)}
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div className="filter-field">
                  <label>Código do Cliente</label>
                  <input
                    type="text"
                    placeholder="Digite o código..."
                    value={filters.codigoCliente}
                    onChange={(e) => handleFilterChange('codigoCliente', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button onClick={handleClearFilters}>
                  Limpar
                </button>
                <button className="primary" onClick={handleApplyFilters}>
                  Aplicar Filtros
                </button>
              </div>
            </>
          )}
        </FilterSection>

        <DashboardGrid>
          <div className="card">
            <h3>A faturar</h3>
            <CardValue>
              73% <span style={{ color: 'var(--success)' }}>+5%</span>
            </CardValue>
            <CardSubtitle>Taxa de conversão Ordem de venda</CardSubtitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stackedBarData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value, name) => [value, name === 'pedidos' ? 'Pedidos' : 'Ordens de Venda']} />
                <Legend
                  verticalAlign="bottom"
                  align="left"
                  height={36}
                  formatter={(value) => {
                    return <span style={{ color: '#1D2D3E', fontSize: '12px' }}>
                      {value === 'pedidos' ? 'Pedidos' : 'Ordens de Venda'}
                    </span>
                  }}
                />
                <Bar dataKey="pedidos" stackId="a" fill="#D8FFEC" name="Pedidos" barSize={20} />
                <Bar dataKey="ordens" stackId="a" fill="#76D9DF" name="Ordens de Venda" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Recebimento (Faturado)</h3>
            <CardValue>
              187,65mi <span style={{ color: 'var(--error)' }}>-5%</span>
            </CardValue>
            <CardSubtitle>Próximos 12 meses</CardSubtitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0070F2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Recebimento (Faturado + A faturar)</h3>
            <CardValue>
              262,97mi <span style={{ color: 'var(--success)' }}>+12%</span>
            </CardValue>
            <CardSubtitle>Próximos 12 meses</CardSubtitle>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={composedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="left"
                  height={36}
                  formatter={(value) => {
                    return <span style={{ color: '#1D2D3E', fontSize: '12px' }}>
                      {value === 'faturado' ? 'Faturado' : 'A faturar'}
                    </span>
                  }}
                />
                <Bar dataKey="faturado" stackId="a" fill="#0070F2" name="Faturado" barSize={20} />
                <Bar dataKey="aFaturar" stackId="a" fill="#76D9DF" name="A faturar" barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Distribuição de recebíveis</h3>
            <CardValue>
              805.56k <span style={{ color: 'var(--success)' }}>+8%</span>
            </CardValue>
            <CardSubtitle>Total de alocações</CardSubtitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  dataKey="value"
                  label={({ value }) => `${value.toFixed(2)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#1D2D3E', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardGrid>

        <div className="card">
          <h3>Faturas</h3>
          <InvoicesTable
            onEditClick={handleEditClick}
            onCancelDuplicate={handleCancelDuplicate}
            onCancelInstallment={handleCancelInstallment}
          />
        </div>

        {isEditModalOpen && (
          <ModalOverlay onClick={() => setIsEditModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Editar Duplicata</h2>
                <button onClick={() => setIsEditModalOpen(false)} style={{
                  height: '26px',
                  padding: '0 16px'
                }}>
                  <X size={20} />
                </button>
              </ModalHeader>

              <ModalBody>
                <FormGrid>
                  <FormField>
                    <label>Valor do Ativo</label>
                    <input
                      type="text"
                      value={`R$ ${editFormData.value}`}
                      onChange={(e) => handleFormChange('value', e.target.value.replace('R$ ', ''))}
                      placeholder="R$ 5000,00"
                    />
                  </FormField>
                  <FormField>
                    <label>Vencimento</label>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        value={editFormData.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                      />
                      <Calendar size={16} className="calendar-icon" />
                    </div>
                  </FormField>
                </FormGrid>

                <FormGrid className="full-width">
                  <FormField>
                    <label>Instrumento de Pagamento</label>
                    <RadioGroup>
                      <label>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Pix"
                          checked={editFormData.paymentMethod === 'Pix'}
                          onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                        />
                        Pix
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="TED/DOC"
                          checked={editFormData.paymentMethod === 'TED/DOC'}
                          onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                        />
                        TED/DOC
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Boleto"
                          checked={editFormData.paymentMethod === 'Boleto'}
                          onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                        />
                        Boleto
                      </label>
                    </RadioGroup>
                  </FormField>
                </FormGrid>

                <FormGrid className="full-width">
                  <FormField>
                    <label>Domicílio Bancário</label>
                    <select
                      value={editFormData.bank}
                      onChange={(e) => handleFormChange('bank', e.target.value)}
                    >
                      <option value="117 - Corretora de Câmbio Ltda">117 - Corretora de Câmbio Ltda</option>
                      <option value="341 - Banco Itaú SA">341 - Banco Itaú SA</option>
                      <option value="001 - Banco do Brasil SA">001 - Banco do Brasil SA</option>
                      <option value="033 - Banco Santander SA">033 - Banco Santander SA</option>
                      <option value="104 - Caixa Econômica Federal">104 - Caixa Econômica Federal</option>
                      <option value="237 - Banco Bradesco SA">237 - Banco Bradesco SA</option>
                    </select>
                  </FormField>
                </FormGrid>

                <FormGrid>
                  <FormField>
                    <label>Agência</label>
                    <input
                      type="text"
                      value={editFormData.agency}
                      onChange={(e) => handleFormChange('agency', e.target.value)}
                      placeholder="0001"
                    />
                  </FormField>

                  <FormField>
                    <label>Dígito</label>
                    <input
                      type="text"
                      value={editFormData.agencyDigit}
                      onChange={(e) => handleFormChange('agencyDigit', e.target.value)}
                      placeholder="0"
                    />
                  </FormField>
                </FormGrid>

                <FormGrid>
                  <FormField>
                    <label>Conta</label>
                    <input
                      type="text"
                      value={editFormData.account}
                      onChange={(e) => handleFormChange('account', e.target.value)}
                      placeholder="123456"
                    />
                  </FormField>

                  <FormField>
                    <label>Dígito</label>
                    <input
                      type="text"
                      value={editFormData.accountDigit}
                      onChange={(e) => handleFormChange('accountDigit', e.target.value)}
                      placeholder="6"
                    />
                  </FormField>
                </FormGrid>

                <FormGrid className="full-width">
                  <FormField>
                    <label>Tipo de Conta</label>
                    <select
                      value={editFormData.accountType}
                      onChange={(e) => handleFormChange('accountType', e.target.value)}
                    >
                      <option value="Conta Corrente">Conta Corrente</option>
                      <option value="Conta Poupança">Conta Poupança</option>
                      <option value="Conta Salário">Conta Salário</option>
                    </select>
                  </FormField>
                </FormGrid>
              </ModalBody>

              <ModalFooter>
                <button
                  className="cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="save"
                  onClick={handleSaveChanges}
                >
                  Salvar alterações
                </button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {showCancelModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowCancelModal(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '400px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  Cancelar duplicata
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '0',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary-text)' }}>
                  Deseja confirmar o cancelamento da duplicata?
                </p>
              </div>

              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    height: '26px',
                    padding: '0 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    color: 'var(--primary-text)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Não
                </button>
                <button
                  onClick={() => {
                    console.log('Duplicata cancelada');
                    setShowCancelModal(false);
                  }}
                  style={{
                    height: '26px',
                    padding: '0 12px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#3EB655',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        )}

        {isCancelConfirmOpen && (
          <ModalOverlay onClick={() => setIsCancelConfirmOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Cancelar duplicata</h2>
                <button onClick={() => setIsCancelConfirmOpen(false)}>
                  <X size={20} />
                </button>
              </ModalHeader>

              <ModalBody>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary-text)' }}>
                  Deseja confirmar o cancelamento da duplicata?
                </p>
              </ModalBody>

              <ModalFooter>
                <button
                  className="cancel"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  style={{ height: '26px' }}
                >
                  Não
                </button>
                <button
                  className="save"
                  onClick={confirmCancelDuplicate}
                  style={{ height: '26px', background: '#10B981' }}
                >
                  Sim
                </button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {isSaveConfirmOpen && (
          <ModalOverlay onClick={() => setIsSaveConfirmOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
              <ModalHeader>
                <h2>Confirmação de Solicitação das alterações</h2>
                <button onClick={() => setIsSaveConfirmOpen(false)}>
                  <X size={20} />
                </button>
              </ModalHeader>

              <ModalBody>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary-text)' }}>
                  Deseja confirmar a atualização da duplicata?
                </p>
              </ModalBody>

              <ModalFooter>
                <button
                  className="cancel"
                  onClick={() => setIsSaveConfirmOpen(false)}
                  style={{ height: '26px', background: '#EF4444', color: 'white', border: 'none' }}
                >
                  Não
                </button>
                <button
                  className="save"
                  onClick={confirmSaveChanges}
                  style={{ height: '26px', background: '#10B981' }}
                >
                  Sim
                </button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
        </Main>
      </Container>
    </div>
  )
}

export default EscrituracaoDuplicata
