import { Wallet } from 'lucide-react';

const ControleLiquidacoes = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-full max-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Liquidações</h1>
            <p className="text-gray-600 mt-1">
              Acompanhamento e conciliação das liquidações de recebíveis
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
          <Wallet className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Módulo em construção
          </h2>
          <p className="text-sm text-gray-500 max-w-md">
            A funcionalidade de Controle de Liquidações está sendo desenvolvida.
            Em breve você poderá visualizar e gerenciar as liquidações por aqui.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControleLiquidacoes;
