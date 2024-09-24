import dynamic from 'next/dynamic';
import React from 'react';

const ProcessCSVContent = dynamic(() => import('./ProcessCSVContent'), {
  ssr: false,
  loading: () => <p>Loading CSV processor...</p>
});

const ProcessCSV: React.FC = () => {
  return <ProcessCSVContent />;
};

export default ProcessCSV;