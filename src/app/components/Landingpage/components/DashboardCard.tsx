// src/components/DashboardCard.tsx

import React from 'react';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 flex items-center shadow-md">
      <div className="text-3xl text-blue-400 mr-4">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
