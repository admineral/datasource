'use client';

import React, { useState } from 'react';
import ProcessCSV from './ProcessCSV';
import SearchDatabase from './SearchDatabase';

const DatabaseManagerPage: React.FC = () => {
  const [options, setOptions] = useState({
    clients: [],
    warehouses: [],
    products: [],
  });

  const clearOptions = () => {
    setOptions({
      clients: [],
      warehouses: [],
      products: [],
    });
  };

  const updateOptions = (newOptions) => {
    setOptions(newOptions);
  };

  return (
    <div className="container mx-auto space-y-8 p-6 text-gray-900 dark:text-gray-100">
      <h1 className="mb-6 text-4xl font-bold">Database Manager</h1>

      {/* Process CSV Files Component */}
      <ProcessCSV clearOptions={clearOptions} />

      {/* Search in Database Component */}
      <SearchDatabase options={options} updateOptions={updateOptions} clearOptions={clearOptions} />
    </div>
  );
};

export default DatabaseManagerPage;