import { ReactNode } from 'react';
import { cn } from '@/modules/gestorDomicilio/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm text-left", className)}>
        {children}
      </table>
    </div>
  );
}

Table.Header = function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="text-xs text-gray-700 uppercase bg-gray-50">{children}</thead>;
};

Table.Body = function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
};

Table.Row = function TableRow({ children, className }: TableProps) {
  return <tr className={cn("border-b hover:bg-gray-50", className)}>{children}</tr>;
};

Table.HeaderCell = function TableHeaderCell({ children, className }: TableProps) {
  return <th className={cn("px-6 py-3", className)}>{children}</th>;
};

Table.Cell = function TableCell({ children, className }: TableProps) {
  return <td className={cn("px-6 py-4", className)}>{children}</td>;
};