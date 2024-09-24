// pages/database-manager/page.tsx

'use client';

import React from 'react';
import ProcessCSV from './ProcessCSV';
import SearchDatabase from './SearchDatabase';

const DatabaseManagerPage: React.FC = () => {
  return (
    <div className="container mx-auto space-y-8 p-6 text-gray-900 dark:text-gray-100">
      <h1 className="mb-6 text-4xl font-bold">Database Manager</h1>

      {/* Process CSV Files Component */}
      <ProcessCSV />

      {/* Search in Database Component */}
      <SearchDatabase />
    </div>
  );
};

export default DatabaseManagerPage;