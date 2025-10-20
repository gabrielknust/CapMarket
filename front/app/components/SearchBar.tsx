'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        placeholder="Buscar produtos..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="block w-full rounded-full border-0 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-sm "
      />
    </form>
  );
}