// components/shared/datatable/GlobalFilter.tsx
import React from 'react';
import { SearchIcon } from '../../icons/Icon';

interface GlobalFilterProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
  return (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-400" />
        </span>
        <input
            type="text"
            value={filter || ''}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 sm:w-auto"
        />
    </div>
  );
};

export default GlobalFilter;
