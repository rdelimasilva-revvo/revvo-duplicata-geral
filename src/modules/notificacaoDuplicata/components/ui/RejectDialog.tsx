import { useState } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

interface RejectDialogProps {
  isOpen: boolean;
  onConfirm: (reason: string, description: string) => void;
  onCancel: () => void;
  billData: {
    sacado: string;
    date: string;
    value: number;
    dueDate: string;
    invoiceNumber: string;
    orderNumber: string;
  };
}

export function RejectDialog({ isOpen, onConfirm, onCancel, billData }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg w-[700px] p-6 max-h-[90vh] overflow-y-auto">
        {/* Alerta Legal */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 mb-1">Atenção: Prazo Legal de Recusa</p>
              <p className="text-red-700">
                A recusa deve ser manifestada em até <strong>10 dias úteis</strong> da apresentação.
                Documentação completa dos motivos é obrigatória para interoperabilidade.
              </p>
            </div>
          </div>
        </div>

        {/* Aviso de Descrição Obrigatória */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Descrição detalhada é obrigatória em caso de recusa</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Motivo da Recusa</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Destinatário/Sacador</p>
              <p className="text-sm">{billData.sacado}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Data de Apresentação da Duplicata</p>
              <p className="text-sm">{billData.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor</p>
              <p className="text-sm">{formatCurrency(billData.value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Vencimento</p>
              <p className="text-sm">{billData.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Número da Fatura</p>
              <p className="text-sm">{billData.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Número da ordem</p>
              <p className="text-sm">{billData.orderNumber}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Motivo da recusa *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">Selecione o motivo</option>
              <option value="01">01 - Falta de aceite</option>
              <option value="02">02 - Divergência nos dados da duplicata</option>
              <option value="03">03 - Divergência nos valores</option>
              <option value="04">04 - Duplicata não corresponde à mercadoria/serviço</option>
              <option value="05">05 - Mercadoria não recebida</option>
              <option value="06">06 - Serviço não prestado</option>
              <option value="07">07 - Falta de comprovação da entrega</option>
              <option value="08">08 - Prazo de vencimento incorreto</option>
              <option value="09">09 - Outros motivos (especificar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Descrição detalhada *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente os motivos da recusa. Esta informação será enviada via interoperabilidade ao sacador."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 50 caracteres. Seja específico para garantir conformidade legal.
            </p>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onConfirm(reason, description)}
            disabled={!reason || !description || description.length < 50}
          >
            Enviar Manifestação
          </Button>
        </div>
      </div>
    </div>
  );
}