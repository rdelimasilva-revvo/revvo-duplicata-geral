import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { menuItems, footerMenuItems } from '../Sidebar/menuConfig';

interface SearchResult {
  label: string;
  route: string;
  parent?: string;
}

function flattenMenuItems(items: readonly any[], parent?: string): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of items) {
    if (item.route) {
      results.push({ label: item.label, route: item.route, parent });
    }
    if (item.items) {
      results.push(...flattenMenuItems(item.items, item.label));
    }
  }
  return results;
}

interface SearchBarProps {
  onNavigate?: (route: string) => void;
}

const SearchBar = ({ onNavigate }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(() => {
    return flattenMenuItems([...menuItems, ...footerMenuItems]);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        (item.parent && item.parent.toLowerCase().includes(q))
    );
  }, [query, allItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (route: string) => {
    onNavigate?.(route);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex].route);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar paginas... (Ctrl+K)"
          className="w-full h-[32px] pl-9 pr-8 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-[#0070f2] focus:ring-1 focus:ring-[#0070f2] placeholder-gray-400"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[300px] overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={result.route}
              onClick={() => handleSelect(result.route)}
              className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 text-sm transition-colors ${
                idx === selectedIndex ? 'bg-blue-50 text-[#0070F2]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div>
                {result.parent && (
                  <span className="text-xs text-gray-400">{result.parent} / </span>
                )}
                <span className="font-medium">{result.label}</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${idx === selectedIndex ? 'text-[#0070F2]' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <p className="text-sm text-gray-500 text-center">Nenhum resultado para "{query}"</p>
        </div>
      )}
    </div>
  );
}

export default SearchBar;