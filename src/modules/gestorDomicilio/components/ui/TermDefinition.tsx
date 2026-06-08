import { Tooltip } from './Tooltip';

interface TermDefinitionProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function TermDefinition({ term, definition, children }: TermDefinitionProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {children || term}
      <Tooltip content={definition} icon />
    </span>
  );
}

export const TERM_DEFINITIONS = {
  IUD: 'Identificador único da duplicata na rede do Bacen',
  DOMICILIO: 'Domicílio bancário onde os valores serão liquidados',
  INTEROPERABILIDADE: 'Troca de informações de duplicatas entre instituições financeiras',
  SACADOR: 'Sacador/Credor que emitiu a duplicata e receberá o pagamento',
  SACADO: 'Sacado/Devedor responsável pelo pagamento da duplicata',
  DFE: 'Documento Fiscal Eletrônico que originou a duplicata',
  MANIFESTACAO: 'Ato de aceitar ou recusar uma duplicata dentro dos prazos legais',
  ACEITE: 'Confirmação de que a duplicata é válida e será paga (prazo: 10 dias úteis)',
  RECUSA: 'Negativa da duplicata por motivo válido (prazo: 10 dias úteis)',
};
