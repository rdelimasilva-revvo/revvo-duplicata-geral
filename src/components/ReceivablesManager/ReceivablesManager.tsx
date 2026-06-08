import React from 'react';
import { FileText, Filter, Download, Upload } from 'lucide-react';

const ReceivablesManager = () => {
  return (
    <div className="h-full bg-white">
      {/* Top Actions Bar */}
      <div className="h-[48px] px-4 border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 text-sm font-medium text-[#0070f2] hover:bg-[#ebf8ff] rounded">
            <Filter className="w-4 h-4 inline-block mr-2" />
            Filtros
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 text-sm font-medium text-[#0070f2] hover:bg-[#ebf8ff] rounded">
            <Upload className="w-4 h-4 inline-block mr-2" />
            Importar
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[#0070f2] hover:bg-[#ebf8ff] rounded">
            <Download className="w-4 h-4 inline-block mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5]">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Título</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cliente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Data Emissão</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vencimento</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Valor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-b border-[#e5e5e5] hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">NF-{1000 + index}</td>
                <td className="px-4 py-3 text-sm">Empresa {index + 1} Ltda</td>
                <td className="px-4 py-3 text-sm">2024-03-{index + 1}</td>
                <td className="px-4 py-3 text-sm">2024-04-{index + 1}</td>
                <td className="px-4 py-3 text-sm text-right">
                  R$ {(Math.random() * 10000).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    index % 3 === 0 
                      ? 'bg-green-100 text-green-800'
                      : index % 3 === 1
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {index % 3 === 0 ? 'Pago' : index % 3 === 1 ? 'Pendente' : 'Atrasado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivablesManager;