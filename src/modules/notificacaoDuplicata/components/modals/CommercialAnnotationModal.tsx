import { useState, useEffect, useCallback, useRef } from 'react';
import { X, AlertTriangle, Upload, FileText, Image, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { StandardButton } from '../../../../components/ui';

const PROBLEM_TYPES = [
  { value: 'delivery', label: 'Entrega' },
  { value: 'invoice', label: 'Nota Fiscal' },
  { value: 'duplicate', label: 'Duplicata' },
  { value: 'other', label: 'Outros' },
] as const;

type ProblemType = typeof PROBLEM_TYPES[number]['value'] | '';

interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
}

interface FormData {
  problemType: ProblemType;
  description: string;
  occurrenceDate: string;
  attachments: FileAttachment[];
  additionalNotes: string;
}

interface FormErrors {
  problemType?: string;
  description?: string;
  occurrenceDate?: string;
  attachments?: string;
}

interface CommercialAnnotationModalProps {
  bill: Bill;
  onClose: () => void;
  onSave: (data: {
    problemType: string;
    description: string;
    occurrenceDate: string;
    attachments: File[];
    additionalNotes: string;
  }) => Promise<void> | void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MIN_DESCRIPTION_LENGTH = 50;

export function CommercialAnnotationModal({
  bill,
  onClose,
  onSave,
}: CommercialAnnotationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    problemType: '',
    description: '',
    occurrenceDate: '',
    attachments: [],
    additionalNotes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showConfirmation) {
        setShowConfirmation(false);
      } else {
        onClose();
      }
    }
  }, [onClose, showConfirmation]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      formData.attachments.forEach(att => {
        if (att.preview) URL.revokeObjectURL(att.preview);
      });
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.problemType) {
      newErrors.problemType = 'Selecione o motivo';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Informe a descrição';
    } else if (formData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `A descrição deve ter pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres`;
    }

    if (!formData.occurrenceDate) {
      newErrors.occurrenceDate = 'Informe a data da ocorrência';
    } else {
      const selectedDate = new Date(formData.occurrenceDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.occurrenceDate = 'A data não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave({
        problemType: PROBLEM_TYPES.find(p => p.value === formData.problemType)?.label || '',
        description: formData.description.trim(),
        occurrenceDate: formData.occurrenceDate,
        attachments: formData.attachments.map(a => a.file),
        additionalNotes: formData.additionalNotes.trim(),
      });
      onClose();
    } catch (err) {
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          attachments: 'Formato não permitido. Use PDF, JPG ou PNG',
        }));
        hasError = true;
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({
          ...prev,
          attachments: 'Arquivo muito grande. Tamanho máximo: 5MB',
        }));
        hasError = true;
        return;
      }

      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      newAttachments.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
      });
    });

    if (!hasError) {
      setErrors(prev => ({ ...prev, attachments: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => {
      const attachment = prev.attachments.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return {
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== id),
      };
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText size={16} className="text-red-500" />;
    }
    return <Image size={16} className="text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const descriptionLength = formData.description.trim().length;
  const descriptionProgress = Math.min((descriptionLength / MIN_DESCRIPTION_LENGTH) * 100, 100);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
      style={{ fontFamily: '"72", "72full", Arial, Helvetica, sans-serif' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="annotation-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-[560px] max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 id="annotation-modal-title" className="text-lg font-semibold text-gray-900">
            Anotação Comercial
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
            aria-label="Fechar modal"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Aviso Importante
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Esta anotação será registrada após o prazo legal de manifestação.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Duplicata</p>
                <p className="text-sm font-medium text-gray-900">{bill.iud}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Valor</p>
                <p className="text-sm font-semibold text-gray-900">R$ {formatCurrency(bill.amount)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Cedente</p>
              <p className="text-sm text-gray-900">{bill.sacador.name}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Motivo <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm text-left bg-white flex items-center justify-between transition-all ${
                    errors.problemType
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                >
                  <span className={formData.problemType ? 'text-gray-900' : 'text-gray-400'}>
                    {formData.problemType
                      ? PROBLEM_TYPES.find(p => p.value === formData.problemType)?.label
                      : 'Selecione o motivo'}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {PROBLEM_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, problemType: type.value }));
                          setErrors(prev => ({ ...prev, problemType: undefined }));
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                          formData.problemType === type.value
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.problemType && (
                <p className="text-xs text-red-500 mt-1.5">{errors.problemType}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrição Detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                rows={4}
                placeholder="Descreva detalhadamente a situação (mínimo 50 caracteres)..."
                className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 bg-white transition-all resize-none ${
                  errors.description
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } outline-none`}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.description ? (
                  <p className="text-xs text-red-500">{errors.description}</p>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className={`h-full transition-all ${
                          descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${descriptionProgress}%` }}
                      />
                    </div>
                    <span className={`text-xs ${
                      descriptionLength >= MIN_DESCRIPTION_LENGTH ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {descriptionLength}/{MIN_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="occurrenceDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Data da Ocorrência <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="occurrenceDate"
                  value={formData.occurrenceDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, occurrenceDate: e.target.value }));
                    if (errors.occurrenceDate) setErrors(prev => ({ ...prev, occurrenceDate: undefined }));
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 bg-white transition-all ${
                    errors.occurrenceDate
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  } outline-none`}
                />
                <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.occurrenceDate && (
                <p className="text-xs text-red-500 mt-1.5">{errors.occurrenceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Anexar Documentos/Fotos
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 ${
                  errors.attachments ? 'border-red-300 bg-red-50/50' : 'border-gray-300'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Clique para selecionar ou arraste os arquivos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG ou PNG (max. 5MB por arquivo)
                </p>
              </div>
              {errors.attachments && (
                <p className="text-xs text-red-500 mt-1.5">{errors.attachments}</p>
              )}

              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {attachment.preview ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                          {getFileIcon(attachment.file)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{attachment.file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(attachment.file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remover arquivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Observações Adicionais
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
                placeholder="Informações adicionais que julgar relevantes..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white transition-all resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
          <StandardButton
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </StandardButton>
          <StandardButton
            variant="primary"
            size="md"
            onClick={handleSubmitClick}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Registrar Anotação
          </StandardButton>
        </div>
      </div>

      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1001] p-4"
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-[400px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                Confirmar Registro
              </h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                Confirma o registro desta anotação comercial?
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500">Motivo</p>
                <p className="text-sm font-medium text-gray-900">
                  {PROBLEM_TYPES.find(p => p.value === formData.problemType)?.label}
                </p>
                <p className="text-xs text-gray-500 mt-2">Data da Ocorrência</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(formData.occurrenceDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
                {formData.attachments.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-2">Anexos</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.attachments.length} arquivo(s)
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row justify-end gap-3">
              <StandardButton
                variant="ghost"
                size="md"
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Voltar
              </StandardButton>
              <StandardButton
                variant="primary"
                size="md"
                onClick={handleConfirmSubmit}
                loading={isLoading}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Confirmar
              </StandardButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
