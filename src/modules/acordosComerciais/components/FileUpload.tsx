import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';
import { UploadedDocument } from '../types';
import { formatFileSize, generateId } from '../utils';

interface FileUploadProps {
  documents: UploadedDocument[];
  onUpload: (doc: UploadedDocument) => void;
  onRemove?: (docId: string) => void;
}

export function FileUpload({ documents, onUpload, onRemove }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      simulateUpload(files);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      simulateUpload(files);
      e.target.value = '';
    },
    [onUpload]
  );

  const simulateUpload = (files: File[]) => {
    setUploading(true);
    setTimeout(() => {
      files.forEach((file) => {
        const doc: UploadedDocument = {
          id: generateId(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Usuário Atual',
        };
        onUpload(doc);
      });
      setUploading(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#0070f2] bg-blue-50/50'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#0070f2] border-t-transparent animate-spin" />
            <p className="text-sm text-gray-600">Enviando arquivo...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-[#0070f2]' : 'text-gray-400'}`}
            />
            <p className="text-sm text-gray-600 mb-1">
              Arraste arquivos aqui ou{' '}
              <label className="text-[#0070f2] font-medium cursor-pointer hover:underline">
                selecione do computador
                <input type="file" multiple className="hidden" onChange={handleFileSelect} />
              </label>
            </p>
            <p className="text-xs text-gray-400">PDF, DOC, XLS, ZIP (max. 25MB)</p>
          </>
        )}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <File className="w-4 h-4 text-[#0070f2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(doc.size)} &middot; {doc.uploadedBy}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {onRemove && (
                <button
                  onClick={() => onRemove(doc.id)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
