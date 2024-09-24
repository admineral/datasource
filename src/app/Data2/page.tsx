'use client';

import React from 'react';
import CSVPreview from './CSVPreview';
import CombinedView from './CombinedView';

const DataManager: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-6">Data Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CSVPreview fileName="Price.csv" />
        <CSVPreview fileName="Sales.csv" />
      </div>

      <CombinedView />
    </div>
  );
};

export default DataManager;