// components/shared/DataTable.tsx
import React, { useState, useMemo } from 'react';
import Card from './Card';
import GlobalFilter from './datatable/GlobalFilter';
import Pagination from './datatable/Pagination';
import Button from './Button';
import { DownloadIcon } from '../icons/Icon';
import { exportToCsv } from '../../utils/exportData';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  exportFilename?: string;
}

const DataTable = <T extends object>({ data, columns, pageSize = 10, exportFilename = "export" }: DataTableProps<T>) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [data, globalFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
      setIsExportOpen(false);
      if (format === 'csv') {
          exportToCsv(`${exportFilename}.csv`, filteredData);
      } else {
          alert(`${format.toUpperCase()} export is not implemented yet.`);
      }
  };

  return (
    <Card>
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        <div className="relative">
          <Button variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4" />} onClick={() => setIsExportOpen(!isExportOpen)}>
            Exporter
          </Button>
          {isExportOpen && (
             <div 
                className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                onMouseLeave={() => setIsExportOpen(false)}
            >
              <a href="#" onClick={(e) => { e.preventDefault(); handleExport('csv') }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export CSV</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExport('excel') }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export Excel</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf') }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export PDF</a>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.header} className="px-6 py-4 whitespace-nowrap">
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? (String(row[col.accessorKey]) ?? '')
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
             {paginatedData.length === 0 && (
                <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                        Aucun résultat trouvé.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalRecords={filteredData.length}
        pageSize={pageSize}
      />
    </Card>
  );
};

export default DataTable;
