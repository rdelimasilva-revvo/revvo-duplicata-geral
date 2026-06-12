// @ts-nocheck
import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, Clock, Loader2, AlertCircle, Info } from 'lucide-react'

// ---------------------------------------------------------------------------
// Constantes de domínio (leiaute CERC-DE001.0 — Emissão por fatura)
// ---------------------------------------------------------------------------

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const TIPOS_PAGAMENTO = [
  { value: 'BLTO', label: 'BLTO — Boleto' },
  { value: 'TRCR', label: 'TRCR — Transferência' },
  { value: 'PPIX', label: 'PPIX — PIX' },
  { value: 'PIXC', label: 'PIXC — PIX Copia e Cola' },
]

const TIPOS_BOLETO = [
  { value: 'BLTS', label: 'BLTS — Boleto simples' },
  { value: 'BLTD', label: 'BLTD — Boleto de duplicata' },
]

const TIPOS_CONTA = [
  { value: 'CCOR', label: 'CCOR — Conta Corrente' },
  { value: 'CPAG', label: 'CPAG — Conta de Pagamento' },
]

const TIPOS_CHAVE_PIX = [
  { value: 'CPFX', label: 'CPFX — CPF' },
  { value: 'CNPJ', label: 'CNPJ — CNPJ' },
  { value: 'CLLR', label: 'CLLR — Celular' },
  { value: 'EMAI', label: 'EMAI — E-mail' },
  { value: 'CHAL', label: 'CHAL — Chave aleatória' },
]

const TIPOS_DOC_FISCAL = [
  { value: 'CFEL', label: 'CFEL — Cupom Fiscal Eletrônico' },
  { value: 'NFCE', label: 'NFCE — Nota Fiscal de Consumidor Eletrônica' },
  { value: 'NFEL', label: 'NFEL — Nota Fiscal Eletrônica' },
  { value: 'NFSE', label: 'NFSE — Nota Fiscal de Serviços Eletrônica' },
  { value: 'CTEL', label: 'CTEL — Conhecimento de Transporte Eletrônico' },
  { value: 'MEDF', label: 'MEDF — Medição' },
  { value: 'RPAT', label: 'RPAT — Recibo de Pagamento Autônomo' },
]

const INDEXADORES = [
  { value: '1', label: '1 — Prefixada' },
  { value: '2', label: '2 — Selic' },
  { value: '3', label: '3 — DI' },
  { value: '4', label: '4 — IPCA' },
  { value: '5', label: '5 — IGPM' },
  { value: '6', label: '6 — Dólar' },
  { value: '7', label: '7 — Euro' },
  { value: '8', label: '8 — Outros' },
]

const ESTADOS_CIVIS = [
  { value: '1', label: '1 — Solteiro(a)' },
  { value: '2', label: '2 — Casado(a) — comunhão parcial de bens' },
  { value: '3', label: '3 — Casado(a) — comunhão universal de bens' },
  { value: '4', label: '4 — Casado(a) — separação total de bens' },
  { value: '5', label: '5 — Casado(a) — participação final nos aquestos' },
  { value: '6', label: '6 — Divorciado(a)' },
  { value: '7', label: '7 — Viúvo(a)' },
  { value: '8', label: '8 — União estável / Outros' },
]

// ---------------------------------------------------------------------------
// Helpers de máscara e validação
// ---------------------------------------------------------------------------

const onlyDigits = (v) => (v || '').replace(/\D/g, '')

function maskCpfCnpj(v) {
  const d = onlyDigits(v).slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

function isValidCpf(d) {
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  for (const len of [9, 10]) {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * (len + 1 - i)
    const dig = ((sum * 10) % 11) % 10
    if (dig !== parseInt(d[len], 10)) return false
  }
  return true
}

function isValidCnpj(d) {
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const calc = (len) => {
    const weights = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * weights[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(d[12], 10) && calc(13) === parseInt(d[13], 10)
}

const isValidCpfCnpj = (d) =>
  d.length === 11 ? isValidCpf(d) : d.length === 14 ? isValidCnpj(d) : false

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Monetário 14,2: até 12 inteiros + 2 decimais, exibido em pt-BR
function maskCurrency(v) {
  const d = onlyDigits(v).slice(0, 14)
  if (!d) return ''
  const cents = parseInt(d, 10)
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const currencyToNumber = (v) =>
  v ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : null

const maskCep = (v) =>
  onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')

const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11)
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^(\(\d{2}\)\s\d{5})(\d)/, '$1-$2')
}

const todayISO = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// ---------------------------------------------------------------------------
// Componentes de apoio (módulo, para não perder foco em re-render)
// ---------------------------------------------------------------------------

const inputCls = (error, extra = '') =>
  `h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-colors ` +
  `disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ` +
  `${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#1B4F8A] focus:ring-1 focus:ring-[#1B4F8A]'} ${extra}`

function Field({ label, required, error, hint, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  )
}

function Section({ number, title, children }) {
  return (
    <section className="border-b border-gray-100 px-6 py-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1B4F8A]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4F8A] text-[11px] font-bold text-white">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Accordion({ title, badge, open, onToggle, children }) {
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {title}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {badge || 'Opcional'}
          </span>
        </span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  )
}

function CurrencyInput({ value, onChange, error, disabled, placeholder = '0,00' }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        className={inputCls(error, 'pl-9')}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(maskCurrency(e.target.value))}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

const buildInitialForm = () => ({
  // Seção 1 — Identificação
  referenciaExterna: '',
  idCarteira: '',
  // Seção 2 — Partes
  sacadorDoc: '',
  sacadoDoc: '',
  sacadoNome: '',
  sacadoEmail: '',
  sacadoIE: '',
  sacadoTelefone: '',
  endLogradouro: '',
  endNumero: '',
  endComplemento: '',
  endBairro: '',
  endCep: '',
  endUf: '',
  endMunicipio: '',
  pracaUsarDomicilio: false,
  pracaUf: '',
  pracaMunicipio: '',
  // Seção 3 — Fatura
  faturaNumero: '',
  faturaValorTotal: '',
  faturaDesconto: '',
  // Seção 4 — Duplicata
  dupTipo: 'MERC',
  dupParcela: '',
  dupEmissao: todayISO(),
  dupVencimento: '',
  dupValor: '',
  // Seção 5 — Instrumento de Pagamento
  pagtoTipo: '',
  bltoCodigoBarras: '',
  bltoTipo: '',
  bltoId: '',
  trcrTitular: '',
  trcrTipoConta: '',
  trcrIspb: '',
  trcrCompe: '',
  trcrAgencia: '',
  trcrConta: '',
  trcrDigito: '',
  pixTipoChave: '',
  pixChave: '',
  pixCopiaECola: '',
  // Abatimento
  abatValor: '',
  abatMotivo: '',
  // Encargos por Atraso
  encJurosMora: '',
  encMulta: '',
  encClausulaPenal: '',
  encMoratorios: '',
  // Juros Remuneratórios
  jurosPercentual: '',
  jurosIndexador: '',
  // Documento Fiscal
  dfTipo: '',
  dfNumero: '',
  dfSerie: '',
  dfChave: '',
  // Avalista
  avalDoc: '',
  avalNome: '',
  avalEstadoCivil: '',
  avalConjugeNome: '',
  avalConjugeCpf: '',
  avalEndLogradouro: '',
  avalEndNumero: '',
  avalEndComplemento: '',
  avalEndBairro: '',
  avalEndCep: '',
  avalEndUf: '',
  avalEndMunicipio: '',
  avalAssinatura: false,
})

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function NovaDuplicataModal({ onClose }) {
  const [form, setForm] = useState(buildInitialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('form') // 'form' | 'sending' | 'done'
  const [showAddress, setShowAddress] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [accordions, setAccordions] = useState({
    abatimento: false,
    encargos: false,
    juros: false,
    docFiscal: false,
    avalista: false,
  })

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  const toggleAccordion = (key) =>
    setAccordions((a) => ({ ...a, [key]: !a[key] }))

  const isDirty = () =>
    JSON.stringify(form) !== JSON.stringify({ ...buildInitialForm(), dupEmissao: form.dupEmissao })

  const requestClose = () => {
    if (status === 'form' && isDirty()) setShowCancelConfirm(true)
    else onClose()
  }

  // -------------------------------------------------------------------------
  // Validação
  // -------------------------------------------------------------------------

  const validate = () => {
    const e = {}
    const req = (field, msg = 'Campo obrigatório') => {
      const v = form[field]
      if (typeof v === 'string' ? !v.trim() : !v) e[field] = msg
    }

    // Seção 1
    req('referenciaExterna')

    // Seção 2 — partes
    const sacadorDigits = onlyDigits(form.sacadorDoc)
    if (!sacadorDigits) e.sacadorDoc = 'Campo obrigatório'
    else if (!isValidCpfCnpj(sacadorDigits)) e.sacadorDoc = 'CPF/CNPJ inválido'

    const sacadoDigits = onlyDigits(form.sacadoDoc)
    if (!sacadoDigits) e.sacadoDoc = 'Campo obrigatório'
    else if (!isValidCpfCnpj(sacadoDigits)) e.sacadoDoc = 'CPF/CNPJ inválido'

    req('sacadoNome')
    if (!form.sacadoEmail.trim()) e.sacadoEmail = 'Campo obrigatório'
    else if (!isValidEmail(form.sacadoEmail)) e.sacadoEmail = 'E-mail inválido'

    // Praça de pagamento
    if (form.pracaUsarDomicilio) {
      if (!form.endUf || !form.endMunicipio.trim()) {
        e.pracaUsarDomicilio =
          'Preencha UF e município no endereço do Sacado para usar o domicílio'
      }
    } else {
      req('pracaUf')
      req('pracaMunicipio')
    }

    // Seção 3 — fatura
    req('faturaNumero')
    const faturaTotal = currencyToNumber(form.faturaValorTotal)
    if (!faturaTotal) e.faturaValorTotal = 'Campo obrigatório'

    // Seção 4 — duplicata
    req('dupParcela')
    if (!form.dupVencimento) e.dupVencimento = 'Campo obrigatório'
    else if (form.dupVencimento <= form.dupEmissao) {
      e.dupVencimento = 'O vencimento deve ser posterior à data de emissão'
    }
    const dupValor = currencyToNumber(form.dupValor)
    if (!dupValor) e.dupValor = 'Campo obrigatório'
    else if (faturaTotal && dupValor > faturaTotal) {
      e.dupValor = 'O valor da duplicata não pode exceder o valor total da fatura'
    }

    // Seção 5 — instrumento de pagamento
    if (!form.pagtoTipo) e.pagtoTipo = 'Campo obrigatório'
    if (form.pagtoTipo === 'BLTO') {
      req('bltoCodigoBarras')
      req('bltoTipo')
      req('bltoId')
    }
    if (form.pagtoTipo === 'TRCR') {
      const titDigits = onlyDigits(form.trcrTitular)
      if (!titDigits) e.trcrTitular = 'Campo obrigatório'
      else if (!isValidCpfCnpj(titDigits)) e.trcrTitular = 'CPF/CNPJ inválido'
      req('trcrTipoConta')
      if (!form.trcrIspb.trim() && !form.trcrCompe.trim()) {
        e.trcrIspb = 'Informe ISPB ou COMPE'
      }
      if (!form.trcrAgencia.trim()) e.trcrAgencia = 'Campo obrigatório'
      else if (form.trcrAgencia.trim().length < 4) {
        e.trcrAgencia = 'Mínimo de 4 caracteres'
      }
      req('trcrConta')
      req('trcrDigito')
    }
    if (form.pagtoTipo === 'PPIX') {
      req('pixTipoChave')
      req('pixChave')
    }
    if (form.pagtoTipo === 'PIXC') {
      req('pixCopiaECola')
    }

    // Abatimento — se valor informado, motivo obrigatório (e vice-versa)
    if (form.abatValor && !form.abatMotivo) e.abatMotivo = 'Informe o motivo do abatimento'
    if (form.abatMotivo && !form.abatValor) e.abatValor = 'Informe o valor do abatimento'

    // Documento Fiscal — validação "tudo ou nada"
    const dfFilled = ['dfTipo', 'dfNumero', 'dfSerie', 'dfChave'].filter((k) => form[k].trim?.() || form[k])
    if (dfFilled.length > 0 && dfFilled.length < 4) {
      ;['dfTipo', 'dfNumero', 'dfSerie', 'dfChave'].forEach((k) => {
        if (!form[k]) e[k] = 'Obrigatório quando o documento fiscal é informado'
      })
    }
    if (form.dfChave && onlyDigits(form.dfChave).length !== 44) {
      e.dfChave = 'A chave de acesso deve ter 44 dígitos'
    }

    // Avalista — se informado, exigir conjunto completo
    const avalInformado = !!(onlyDigits(form.avalDoc) || form.avalNome.trim())
    if (avalInformado) {
      const avalDigits = onlyDigits(form.avalDoc)
      if (!avalDigits) e.avalDoc = 'Campo obrigatório'
      else if (!isValidCpfCnpj(avalDigits)) e.avalDoc = 'CPF/CNPJ inválido'
      req('avalNome')
      req('avalEstadoCivil')
      if (['2', '3', '4', '5'].includes(form.avalEstadoCivil)) {
        req('avalConjugeNome', 'Obrigatório para o estado civil selecionado')
        const cjDigits = onlyDigits(form.avalConjugeCpf)
        if (!cjDigits) e.avalConjugeCpf = 'Obrigatório para o estado civil selecionado'
        else if (!isValidCpf(cjDigits)) e.avalConjugeCpf = 'CPF inválido'
      }
      req('avalEndLogradouro')
      req('avalEndNumero')
      req('avalEndBairro')
      req('avalEndCep')
      req('avalEndUf')
      req('avalEndMunicipio')
      if (!form.avalAssinatura) {
        e.avalAssinatura = 'A assinatura do avalista é obrigatória'
      }
    }

    return e
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  // -------------------------------------------------------------------------
  // Montagem do payload DE001.0
  // -------------------------------------------------------------------------

  const buildPayload = () => {
    const enderecoSacado =
      form.endLogradouro || form.endCep || form.endMunicipio
        ? {
            logradouro: form.endLogradouro || null,
            numero: form.endNumero || null,
            complemento: form.endComplemento || null,
            bairro: form.endBairro || null,
            cep: onlyDigits(form.endCep) || null,
            uf: form.endUf || null,
            municipio: form.endMunicipio || null,
          }
        : null

    let instrumentoPagamento = { tipo: form.pagtoTipo }
    if (form.pagtoTipo === 'BLTO') {
      instrumentoPagamento = {
        ...instrumentoPagamento,
        codigoBarras: form.bltoCodigoBarras,
        tipoBoleto: form.bltoTipo,
        idBoleto: form.bltoId,
      }
    } else if (form.pagtoTipo === 'TRCR') {
      instrumentoPagamento = {
        ...instrumentoPagamento,
        titular: onlyDigits(form.trcrTitular),
        tipoConta: form.trcrTipoConta,
        ispb: form.trcrIspb || null,
        compe: form.trcrCompe || null,
        agencia: form.trcrAgencia,
        conta: form.trcrConta,
        digito: form.trcrDigito,
      }
    } else if (form.pagtoTipo === 'PPIX') {
      instrumentoPagamento = {
        ...instrumentoPagamento,
        tipoChave: form.pixTipoChave,
        chave: form.pixChave,
      }
    } else if (form.pagtoTipo === 'PIXC') {
      instrumentoPagamento = {
        ...instrumentoPagamento,
        pixCopiaECola: form.pixCopiaECola,
      }
    }

    const encargosPreenchidos =
      form.encJurosMora || form.encMulta || form.encClausulaPenal || form.encMoratorios

    const avalInformado = !!(onlyDigits(form.avalDoc) || form.avalNome.trim())

    return {
      leiaute: 'CERC-DE001.0',
      tipoEmissao: 'EMISSAO_POR_FATURA',
      identificacao: {
        referenciaExterna: form.referenciaExterna,
        idCarteira: form.idCarteira || null,
      },
      partes: {
        sacador: { cpfCnpj: onlyDigits(form.sacadorDoc) },
        sacado: {
          cpfCnpj: onlyDigits(form.sacadoDoc),
          nomeRazaoSocial: form.sacadoNome,
          email: form.sacadoEmail,
          inscricaoEstadual: form.sacadoIE || null,
          telefoneMovel: onlyDigits(form.sacadoTelefone) || null,
          endereco: enderecoSacado,
        },
      },
      pracaPagamento: form.pracaUsarDomicilio
        ? { uf: form.endUf, municipio: form.endMunicipio }
        : { uf: form.pracaUf, municipio: form.pracaMunicipio },
      fatura: {
        numero: form.faturaNumero,
        valorTotal: currencyToNumber(form.faturaValorTotal),
        valorDesconto: currencyToNumber(form.faturaDesconto),
      },
      duplicata: {
        tipo: form.dupTipo,
        numeroParcela: form.dupParcela,
        dataEmissao: form.dupEmissao,
        dataVencimento: form.dupVencimento,
        valor: currencyToNumber(form.dupValor),
      },
      instrumentoPagamento,
      abatimento: form.abatValor
        ? { valor: currencyToNumber(form.abatValor), motivo: form.abatMotivo }
        : null,
      encargosAtraso: encargosPreenchidos
        ? {
            jurosMoraDia: currencyToNumber(form.encJurosMora),
            multa: currencyToNumber(form.encMulta),
            clausulaPenal: currencyToNumber(form.encClausulaPenal),
            encargosMoratorios: currencyToNumber(form.encMoratorios),
          }
        : null,
      jurosRemuneratorios: form.jurosPercentual
        ? { percentual: form.jurosPercentual, indexador: form.jurosIndexador || null }
        : null,
      documentoFiscal: form.dfTipo
        ? {
            tipo: form.dfTipo,
            numero: form.dfNumero,
            serie: form.dfSerie,
            chaveAcesso: form.dfChave,
          }
        : null,
      avalista: avalInformado
        ? {
            cpfCnpj: onlyDigits(form.avalDoc),
            nome: form.avalNome,
            estadoCivil: form.avalEstadoCivil,
            conjuge: ['2', '3', '4', '5'].includes(form.avalEstadoCivil)
              ? { nome: form.avalConjugeNome, cpf: onlyDigits(form.avalConjugeCpf) }
              : null,
            endereco: {
              logradouro: form.avalEndLogradouro,
              numero: form.avalEndNumero,
              complemento: form.avalEndComplemento || null,
              bairro: form.avalEndBairro,
              cep: onlyDigits(form.avalEndCep),
              uf: form.avalEndUf,
              municipio: form.avalEndMunicipio,
            },
            assinatura: form.avalAssinatura,
          }
        : null,
    }
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    setSubmitAttempted(true)
    if (Object.values(e).filter(Boolean).length > 0) {
      // abre os accordions com erro para o usuário enxergar os campos destacados
      setAccordions((a) => ({
        ...a,
        abatimento: a.abatimento || !!(e.abatValor || e.abatMotivo),
        docFiscal: a.docFiscal || !!(e.dfTipo || e.dfNumero || e.dfSerie || e.dfChave),
        avalista:
          a.avalista ||
          Object.keys(e).some((k) => k.startsWith('aval') && e[k]),
      }))
      if (e.endUf || e.endMunicipio || e.pracaUsarDomicilio) setShowAddress(true)
      return
    }
    const payload = buildPayload()
    console.log('CERC-DE001.0 — Emissão por fatura:', JSON.stringify(payload, null, 2))
    setStatus('sending')
    setTimeout(() => setStatus('done'), 1800)
  }

  const conjugeObrigatorio = ['2', '3', '4', '5'].includes(form.avalEstadoCivil)
  const avalInformado = !!(onlyDigits(form.avalDoc) || form.avalNome.trim())

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const ufOptions = (
    <>
      <option value="">Selecione</option>
      {UFS.map((uf) => (
        <option key={uf} value={uf}>{uf}</option>
      ))}
    </>
  )

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={requestClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nova Duplicata</h2>
            <p className="text-xs text-gray-500">
              Emissão manual de Duplicata Escritural — leiaute CERC-DE001.0 (Emissão por fatura)
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ----------------------- Tela de confirmação ----------------------- */}
        {status === 'done' ? (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Clock size={36} className="text-[#1B4F8A]" />
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Lote em processamento</h3>
            <p className="max-w-md text-sm text-gray-500">
              A solicitação de emissão da duplicata <strong>{form.referenciaExterna}</strong> foi
              enviada à registradora. O retorno com o IUD será disponibilizado de forma
              assíncrona — acompanhe o status na listagem de faturas.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 h-10 rounded-md bg-[#1B4F8A] px-6 text-sm font-medium text-white transition-colors hover:bg-[#143C6B]"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* ----------------------- Corpo com scroll ----------------------- */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {submitAttempted && errorCount > 0 && (
                <div className="mx-6 mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={18} />
                  Verifique os {errorCount === 1 ? 'campo destacado' : `${errorCount} campos destacados`} antes de emitir.
                </div>
              )}

              {/* Seção 1 — Identificação */}
              <Section number="1" title="Identificação">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Referência externa" required error={errors.referenciaExterna}>
                    <input
                      type="text"
                      maxLength={45}
                      className={inputCls(errors.referenciaExterna)}
                      value={form.referenciaExterna}
                      onChange={(e) => set('referenciaExterna', e.target.value)}
                      placeholder="Identificador no seu sistema"
                    />
                  </Field>
                  <Field label="ID Carteira" error={errors.idCarteira}>
                    <input
                      type="text"
                      maxLength={36}
                      className={inputCls(errors.idCarteira)}
                      value={form.idCarteira}
                      onChange={(e) => set('idCarteira', e.target.value)}
                      placeholder="Carteira padrão do participante"
                    />
                  </Field>
                </div>
              </Section>

              {/* Seção 2 — Partes */}
              <Section number="2" title="Partes">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="CPF/CNPJ do Sacador" required error={errors.sacadorDoc}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputCls(errors.sacadorDoc)}
                      value={form.sacadorDoc}
                      onChange={(e) => set('sacadorDoc', maskCpfCnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                    />
                  </Field>
                  <Field label="CPF/CNPJ do Sacado" required error={errors.sacadoDoc}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputCls(errors.sacadoDoc)}
                      value={form.sacadoDoc}
                      onChange={(e) => set('sacadoDoc', maskCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </Field>
                  <Field label="Nome/Razão Social do Sacado" required error={errors.sacadoNome} className="sm:col-span-2">
                    <input
                      type="text"
                      maxLength={100}
                      className={inputCls(errors.sacadoNome)}
                      value={form.sacadoNome}
                      onChange={(e) => set('sacadoNome', e.target.value)}
                    />
                  </Field>
                  <Field label="E-mail do Sacado" required error={errors.sacadoEmail}>
                    <input
                      type="email"
                      className={inputCls(errors.sacadoEmail)}
                      value={form.sacadoEmail}
                      onChange={(e) => set('sacadoEmail', e.target.value)}
                      placeholder="email@empresa.com.br"
                    />
                  </Field>
                  <Field label="Inscrição Estadual" error={errors.sacadoIE}>
                    <input
                      type="text"
                      className={inputCls(errors.sacadoIE)}
                      value={form.sacadoIE}
                      onChange={(e) => set('sacadoIE', e.target.value)}
                    />
                  </Field>
                  <Field label="Telefone móvel do Sacado" error={errors.sacadoTelefone}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputCls(errors.sacadoTelefone)}
                      value={form.sacadoTelefone}
                      onChange={(e) => set('sacadoTelefone', maskPhone(e.target.value))}
                      placeholder="(11) 90000-0000"
                    />
                  </Field>
                </div>

                {/* Endereço do Sacado — bloco expansível */}
                <div className="mt-4 rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddress(!showAddress)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700">Endereço do Sacado</span>
                    {showAddress ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {showAddress && (
                    <div className="border-t border-gray-200 px-4 py-4">
                      <div className="mb-4 flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-[#1B4F8A]">
                        <Info size={15} className="mt-0.5 shrink-0" />
                        Obrigatório se o Sacado não estiver cadastrado na CERC
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                        <Field label="Logradouro" error={errors.endLogradouro} className="sm:col-span-4">
                          <input type="text" className={inputCls(errors.endLogradouro)} value={form.endLogradouro} onChange={(e) => set('endLogradouro', e.target.value)} />
                        </Field>
                        <Field label="Número" error={errors.endNumero} className="sm:col-span-2">
                          <input type="text" className={inputCls(errors.endNumero)} value={form.endNumero} onChange={(e) => set('endNumero', e.target.value)} />
                        </Field>
                        <Field label="Complemento" error={errors.endComplemento} className="sm:col-span-3">
                          <input type="text" className={inputCls(errors.endComplemento)} value={form.endComplemento} onChange={(e) => set('endComplemento', e.target.value)} />
                        </Field>
                        <Field label="Bairro" error={errors.endBairro} className="sm:col-span-3">
                          <input type="text" className={inputCls(errors.endBairro)} value={form.endBairro} onChange={(e) => set('endBairro', e.target.value)} />
                        </Field>
                        <Field label="CEP" error={errors.endCep} className="sm:col-span-2">
                          <input type="text" inputMode="numeric" className={inputCls(errors.endCep)} value={form.endCep} onChange={(e) => set('endCep', maskCep(e.target.value))} placeholder="00000-000" />
                        </Field>
                        <Field label="UF" error={errors.endUf} className="sm:col-span-1">
                          <select className={inputCls(errors.endUf)} value={form.endUf} onChange={(e) => set('endUf', e.target.value)}>
                            {ufOptions}
                          </select>
                        </Field>
                        <Field label="Município" error={errors.endMunicipio} className="sm:col-span-3">
                          <input type="text" className={inputCls(errors.endMunicipio)} value={form.endMunicipio} onChange={(e) => set('endMunicipio', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>

                {/* Praça de Pagamento */}
                <div className="mt-4">
                  <h4 className="mb-2 text-[13px] font-semibold text-gray-700">Praça de Pagamento</h4>
                  <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 accent-[#1B4F8A]"
                      checked={form.pracaUsarDomicilio}
                      onChange={(e) => set('pracaUsarDomicilio', e.target.checked)}
                    />
                    Usar domicílio do Sacado
                  </label>
                  {errors.pracaUsarDomicilio && (
                    <p className="mb-2 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={13} />
                      {errors.pracaUsarDomicilio}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="UF" required={!form.pracaUsarDomicilio} error={errors.pracaUf}>
                      <select
                        className={inputCls(errors.pracaUf)}
                        value={form.pracaUsarDomicilio ? form.endUf : form.pracaUf}
                        disabled={form.pracaUsarDomicilio}
                        onChange={(e) => set('pracaUf', e.target.value)}
                      >
                        {ufOptions}
                      </select>
                    </Field>
                    <Field label="Município" required={!form.pracaUsarDomicilio} error={errors.pracaMunicipio} className="sm:col-span-2">
                      <input
                        type="text"
                        className={inputCls(errors.pracaMunicipio)}
                        value={form.pracaUsarDomicilio ? form.endMunicipio : form.pracaMunicipio}
                        disabled={form.pracaUsarDomicilio}
                        onChange={(e) => set('pracaMunicipio', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* Seção 3 — Fatura */}
              <Section number="3" title="Fatura">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Número da Fatura" required error={errors.faturaNumero}>
                    <input
                      type="text"
                      maxLength={60}
                      className={inputCls(errors.faturaNumero)}
                      value={form.faturaNumero}
                      onChange={(e) => set('faturaNumero', e.target.value)}
                    />
                  </Field>
                  <Field label="Valor Total da Fatura" required error={errors.faturaValorTotal}>
                    <CurrencyInput
                      value={form.faturaValorTotal}
                      onChange={(v) => set('faturaValorTotal', v)}
                      error={errors.faturaValorTotal}
                    />
                  </Field>
                  <Field label="Valor do desconto" error={errors.faturaDesconto}>
                    <CurrencyInput
                      value={form.faturaDesconto}
                      onChange={(v) => set('faturaDesconto', v)}
                      error={errors.faturaDesconto}
                    />
                  </Field>
                </div>
              </Section>

              {/* Seção 4 — Duplicata */}
              <Section number="4" title="Duplicata">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Tipo" required error={errors.dupTipo}>
                    <div className="flex h-10 overflow-hidden rounded-md border border-gray-300">
                      {[
                        { value: 'MERC', label: 'MERC — Mercantil' },
                        { value: 'SERV', label: 'SERV — Serviços' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set('dupTipo', opt.value)}
                          className={`flex-1 px-2 text-xs font-medium transition-colors ${
                            form.dupTipo === opt.value
                              ? 'bg-[#1B4F8A] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Número da Parcela" required error={errors.dupParcela}>
                    <input
                      type="text"
                      maxLength={3}
                      inputMode="numeric"
                      className={inputCls(errors.dupParcela)}
                      value={form.dupParcela}
                      onChange={(e) => set('dupParcela', e.target.value)}
                      placeholder="001"
                    />
                  </Field>
                  <Field label="Data de Emissão" error={errors.dupEmissao}>
                    <input
                      type="date"
                      readOnly
                      className={inputCls(false, 'bg-gray-50 text-gray-500')}
                      value={form.dupEmissao}
                    />
                  </Field>
                  <Field label="Data de Vencimento" required error={errors.dupVencimento}>
                    <input
                      type="date"
                      min={form.dupEmissao}
                      className={inputCls(errors.dupVencimento)}
                      value={form.dupVencimento}
                      onChange={(e) => set('dupVencimento', e.target.value)}
                    />
                  </Field>
                  <Field label="Valor da Duplicata" required error={errors.dupValor} className="sm:col-span-2">
                    <CurrencyInput
                      value={form.dupValor}
                      onChange={(v) => set('dupValor', v)}
                      error={errors.dupValor}
                    />
                  </Field>
                </div>
              </Section>

              {/* Seção 5 — Instrumento de Pagamento */}
              <Section number="5" title="Instrumento de Pagamento">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Tipo" required error={errors.pagtoTipo}>
                    <select
                      className={inputCls(errors.pagtoTipo)}
                      value={form.pagtoTipo}
                      onChange={(e) => set('pagtoTipo', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {TIPOS_PAGAMENTO.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {form.pagtoTipo === 'BLTO' && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Código de Barras" required error={errors.bltoCodigoBarras} className="sm:col-span-2">
                      <input
                        type="text"
                        maxLength={48}
                        inputMode="numeric"
                        className={inputCls(errors.bltoCodigoBarras)}
                        value={form.bltoCodigoBarras}
                        onChange={(e) => set('bltoCodigoBarras', e.target.value)}
                      />
                    </Field>
                    <Field label="Tipo de Boleto" required error={errors.bltoTipo}>
                      <select
                        className={inputCls(errors.bltoTipo)}
                        value={form.bltoTipo}
                        onChange={(e) => set('bltoTipo', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {TIPOS_BOLETO.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="ID do Boleto" required error={errors.bltoId}>
                      <input
                        type="text"
                        className={inputCls(errors.bltoId)}
                        value={form.bltoId}
                        onChange={(e) => set('bltoId', e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {form.pagtoTipo === 'TRCR' && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-6">
                    <Field label="Titular (CPF/CNPJ)" required error={errors.trcrTitular} className="sm:col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        className={inputCls(errors.trcrTitular)}
                        value={form.trcrTitular}
                        onChange={(e) => set('trcrTitular', maskCpfCnpj(e.target.value))}
                      />
                    </Field>
                    <Field label="Tipo de Conta" required error={errors.trcrTipoConta} className="sm:col-span-3">
                      <select
                        className={inputCls(errors.trcrTipoConta)}
                        value={form.trcrTipoConta}
                        onChange={(e) => set('trcrTipoConta', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {TIPOS_CONTA.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="ISPB"
                      error={errors.trcrIspb}
                      hint="Informe ISPB ou COMPE"
                      className="sm:col-span-3"
                    >
                      <input
                        type="text"
                        maxLength={8}
                        inputMode="numeric"
                        className={inputCls(errors.trcrIspb)}
                        value={form.trcrIspb}
                        onChange={(e) => {
                          set('trcrIspb', onlyDigits(e.target.value))
                          setErrors((er) => ({ ...er, trcrIspb: undefined }))
                        }}
                      />
                    </Field>
                    <Field label="COMPE" error={errors.trcrCompe} className="sm:col-span-3">
                      <input
                        type="text"
                        maxLength={3}
                        inputMode="numeric"
                        className={inputCls(errors.trcrCompe)}
                        value={form.trcrCompe}
                        onChange={(e) => {
                          set('trcrCompe', onlyDigits(e.target.value))
                          setErrors((er) => ({ ...er, trcrIspb: undefined }))
                        }}
                      />
                    </Field>
                    <Field label="Agência" required error={errors.trcrAgencia} className="sm:col-span-2">
                      <input
                        type="text"
                        className={inputCls(errors.trcrAgencia)}
                        value={form.trcrAgencia}
                        onChange={(e) => set('trcrAgencia', e.target.value)}
                        placeholder="0001"
                      />
                    </Field>
                    <Field label="Conta" required error={errors.trcrConta} className="sm:col-span-3">
                      <input
                        type="text"
                        className={inputCls(errors.trcrConta)}
                        value={form.trcrConta}
                        onChange={(e) => set('trcrConta', e.target.value)}
                      />
                    </Field>
                    <Field label="Dígito" required error={errors.trcrDigito} className="sm:col-span-1">
                      <input
                        type="text"
                        maxLength={2}
                        className={inputCls(errors.trcrDigito)}
                        value={form.trcrDigito}
                        onChange={(e) => set('trcrDigito', e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {form.pagtoTipo === 'PPIX' && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Tipo de Chave" required error={errors.pixTipoChave}>
                      <select
                        className={inputCls(errors.pixTipoChave)}
                        value={form.pixTipoChave}
                        onChange={(e) => set('pixTipoChave', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {TIPOS_CHAVE_PIX.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Chave PIX" required error={errors.pixChave}>
                      <input
                        type="text"
                        className={inputCls(errors.pixChave)}
                        value={form.pixChave}
                        onChange={(e) => set('pixChave', e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {form.pagtoTipo === 'PIXC' && (
                  <div className="mt-4">
                    <Field label="PIX Copia e Cola" required error={errors.pixCopiaECola}>
                      <textarea
                        rows={3}
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors ${
                          errors.pixCopiaECola
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-[#1B4F8A] focus:ring-1 focus:ring-[#1B4F8A]'
                        }`}
                        value={form.pixCopiaECola}
                        onChange={(e) => set('pixCopiaECola', e.target.value)}
                        placeholder="Cole aqui o código PIX Copia e Cola"
                      />
                    </Field>
                  </div>
                )}
              </Section>

              {/* ------------------- Seções opcionais (accordion) ------------------- */}

              <Accordion title="Abatimento" open={accordions.abatimento} onToggle={() => toggleAccordion('abatimento')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Valor" error={errors.abatValor}>
                    <CurrencyInput
                      value={form.abatValor}
                      onChange={(v) => set('abatValor', v)}
                      error={errors.abatValor}
                    />
                  </Field>
                  <Field label="Motivo" error={errors.abatMotivo}>
                    <select
                      className={inputCls(errors.abatMotivo)}
                      value={form.abatMotivo}
                      onChange={(e) => set('abatMotivo', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="P">P — Pontualidade</option>
                      <option value="N">N — Negociado</option>
                    </select>
                  </Field>
                </div>
              </Accordion>

              <Accordion title="Encargos por Atraso" open={accordions.encargos} onToggle={() => toggleAccordion('encargos')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Juros de mora/dia" error={errors.encJurosMora}>
                    <CurrencyInput value={form.encJurosMora} onChange={(v) => set('encJurosMora', v)} error={errors.encJurosMora} />
                  </Field>
                  <Field label="Multa" error={errors.encMulta}>
                    <CurrencyInput value={form.encMulta} onChange={(v) => set('encMulta', v)} error={errors.encMulta} />
                  </Field>
                  <Field label="Cláusula Penal" error={errors.encClausulaPenal}>
                    <CurrencyInput value={form.encClausulaPenal} onChange={(v) => set('encClausulaPenal', v)} error={errors.encClausulaPenal} />
                  </Field>
                  <Field label="Encargos moratórios" error={errors.encMoratorios}>
                    <CurrencyInput value={form.encMoratorios} onChange={(v) => set('encMoratorios', v)} error={errors.encMoratorios} />
                  </Field>
                </div>
              </Accordion>

              <Accordion title="Juros Remuneratórios" open={accordions.juros} onToggle={() => toggleAccordion('juros')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Percentual (%)" error={errors.jurosPercentual}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={inputCls(errors.jurosPercentual)}
                      value={form.jurosPercentual}
                      onChange={(e) => set('jurosPercentual', e.target.value.replace(/[^\d,.]/g, ''))}
                      placeholder="0,00"
                    />
                  </Field>
                  <Field label="Indexador" error={errors.jurosIndexador}>
                    <select
                      className={inputCls(errors.jurosIndexador)}
                      value={form.jurosIndexador}
                      onChange={(e) => set('jurosIndexador', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {INDEXADORES.map((i) => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Accordion>

              <Accordion title="Documento Fiscal" open={accordions.docFiscal} onToggle={() => toggleAccordion('docFiscal')}>
                <div className="mb-4 flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-[#1B4F8A]">
                  <Info size={15} className="mt-0.5 shrink-0" />
                  Se um campo for preenchido, todos os campos do documento fiscal tornam-se obrigatórios.
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <Field label="Tipo" error={errors.dfTipo} className="sm:col-span-3">
                    <select
                      className={inputCls(errors.dfTipo)}
                      value={form.dfTipo}
                      onChange={(e) => set('dfTipo', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {TIPOS_DOC_FISCAL.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Número" error={errors.dfNumero} className="sm:col-span-2">
                    <input type="text" className={inputCls(errors.dfNumero)} value={form.dfNumero} onChange={(e) => set('dfNumero', e.target.value)} />
                  </Field>
                  <Field label="Série" error={errors.dfSerie} className="sm:col-span-1">
                    <input type="text" className={inputCls(errors.dfSerie)} value={form.dfSerie} onChange={(e) => set('dfSerie', e.target.value)} />
                  </Field>
                  <Field label="Chave de Acesso" error={errors.dfChave} hint="44 dígitos" className="sm:col-span-6">
                    <input
                      type="text"
                      maxLength={44}
                      inputMode="numeric"
                      className={inputCls(errors.dfChave)}
                      value={form.dfChave}
                      onChange={(e) => set('dfChave', onlyDigits(e.target.value))}
                    />
                  </Field>
                </div>
              </Accordion>

              <Accordion title="Avalista" open={accordions.avalista} onToggle={() => toggleAccordion('avalista')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="CPF/CNPJ" required={avalInformado} error={errors.avalDoc}>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inputCls(errors.avalDoc)}
                      value={form.avalDoc}
                      onChange={(e) => set('avalDoc', maskCpfCnpj(e.target.value))}
                    />
                  </Field>
                  <Field label="Nome" required={avalInformado} error={errors.avalNome}>
                    <input
                      type="text"
                      maxLength={100}
                      className={inputCls(errors.avalNome)}
                      value={form.avalNome}
                      onChange={(e) => set('avalNome', e.target.value)}
                    />
                  </Field>
                  <Field label="Estado Civil" required={avalInformado} error={errors.avalEstadoCivil} className="sm:col-span-2">
                    <select
                      className={inputCls(errors.avalEstadoCivil)}
                      value={form.avalEstadoCivil}
                      onChange={(e) => set('avalEstadoCivil', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {ESTADOS_CIVIS.map((ec) => (
                        <option key={ec.value} value={ec.value}>{ec.label}</option>
                      ))}
                    </select>
                  </Field>
                  {conjugeObrigatorio && (
                    <>
                      <Field label="Nome do cônjuge" required error={errors.avalConjugeNome}>
                        <input
                          type="text"
                          maxLength={100}
                          className={inputCls(errors.avalConjugeNome)}
                          value={form.avalConjugeNome}
                          onChange={(e) => set('avalConjugeNome', e.target.value)}
                        />
                      </Field>
                      <Field label="CPF do cônjuge" required error={errors.avalConjugeCpf}>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={inputCls(errors.avalConjugeCpf)}
                          value={form.avalConjugeCpf}
                          onChange={(e) => set('avalConjugeCpf', maskCpfCnpj(e.target.value))}
                          placeholder="000.000.000-00"
                        />
                      </Field>
                    </>
                  )}
                </div>

                <h4 className="mb-3 mt-5 text-[13px] font-semibold text-gray-700">
                  Endereço do Avalista
                  {avalInformado && <span className="ml-0.5 text-red-500">*</span>}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <Field label="Logradouro" required={avalInformado} error={errors.avalEndLogradouro} className="sm:col-span-4">
                    <input type="text" className={inputCls(errors.avalEndLogradouro)} value={form.avalEndLogradouro} onChange={(e) => set('avalEndLogradouro', e.target.value)} />
                  </Field>
                  <Field label="Número" required={avalInformado} error={errors.avalEndNumero} className="sm:col-span-2">
                    <input type="text" className={inputCls(errors.avalEndNumero)} value={form.avalEndNumero} onChange={(e) => set('avalEndNumero', e.target.value)} />
                  </Field>
                  <Field label="Complemento" error={errors.avalEndComplemento} className="sm:col-span-3">
                    <input type="text" className={inputCls(errors.avalEndComplemento)} value={form.avalEndComplemento} onChange={(e) => set('avalEndComplemento', e.target.value)} />
                  </Field>
                  <Field label="Bairro" required={avalInformado} error={errors.avalEndBairro} className="sm:col-span-3">
                    <input type="text" className={inputCls(errors.avalEndBairro)} value={form.avalEndBairro} onChange={(e) => set('avalEndBairro', e.target.value)} />
                  </Field>
                  <Field label="CEP" required={avalInformado} error={errors.avalEndCep} className="sm:col-span-2">
                    <input type="text" inputMode="numeric" className={inputCls(errors.avalEndCep)} value={form.avalEndCep} onChange={(e) => set('avalEndCep', maskCep(e.target.value))} placeholder="00000-000" />
                  </Field>
                  <Field label="UF" required={avalInformado} error={errors.avalEndUf} className="sm:col-span-1">
                    <select className={inputCls(errors.avalEndUf)} value={form.avalEndUf} onChange={(e) => set('avalEndUf', e.target.value)}>
                      {ufOptions}
                    </select>
                  </Field>
                  <Field label="Município" required={avalInformado} error={errors.avalEndMunicipio} className="sm:col-span-3">
                    <input type="text" className={inputCls(errors.avalEndMunicipio)} value={form.avalEndMunicipio} onChange={(e) => set('avalEndMunicipio', e.target.value)} />
                  </Field>
                </div>

                <div className="mt-4">
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1B4F8A]"
                      checked={form.avalAssinatura}
                      onChange={(e) => set('avalAssinatura', e.target.checked)}
                    />
                    Declaro que o avalista assinou o instrumento de garantia
                    {avalInformado && <span className="text-red-500">*</span>}
                  </label>
                  {errors.avalAssinatura && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={13} />
                      {errors.avalAssinatura}
                    </p>
                  )}
                </div>
              </Accordion>
            </div>

            {/* ----------------------- Footer ----------------------- */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={requestClose}
                disabled={status === 'sending'}
                className="h-10 rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'sending'}
                className="flex h-10 items-center gap-2 rounded-md bg-[#1B4F8A] px-6 text-sm font-medium text-white transition-colors hover:bg-[#143C6B] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Emitir Duplicata'
                )}
              </button>
            </div>
          </>
        )}

        {/* ----------------------- Confirmação de cancelamento ----------------------- */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-base font-semibold text-gray-900">Descartar emissão?</h3>
              <p className="mb-5 text-sm text-gray-500">
                Os dados digitados serão perdidos. Deseja realmente fechar?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continuar editando
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NovaDuplicataModal
