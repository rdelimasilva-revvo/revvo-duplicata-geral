// @ts-nocheck
import React from 'react';
import { useLocation } from 'react-router-dom';
import RulesList from '@/modules/automacoes/pages/RulesList';
import NewRule from '@/modules/automacoes/pages/NewRule';
import RuleDetails from '@/modules/automacoes/pages/RuleDetails';
import '@/modules/automacoes/index.css';

function Automacoes() {
  const basePath = '/app/automacoes';
  const { pathname } = useLocation();
  const subPath = pathname.replace(/^\/app\/automacoes/, '');
  const isNew = subPath.startsWith('/rule/new');
  const isDetail = /^\/rule\/[^/]+/.test(subPath);

  // Extract rule ID from the path manually
  let ruleId = null;
  if (isDetail && !isNew) {
    const match = subPath.match(/^\/rule\/(\d+)/);
    if (match) {
      ruleId = match[1];
    }
  }

  return (
    <div className="automacoes-module w-full min-h-[calc(100vh-80px)] bg-[#F5F6F7] p-6 overflow-auto">
      {isNew ? (
        <NewRule basePath={basePath} />
      ) : isDetail ? (
        <RuleDetails basePath={basePath} ruleId={ruleId} />
      ) : (
        <RulesList basePath={basePath} />
      )}
    </div>
  );
}

export default Automacoes;
