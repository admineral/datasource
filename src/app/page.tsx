"use client";

import React from 'react';
import Header from './components/Landingpage/Header';
import ChallengeOverview from './components/Landingpage/ChallengeOverview';
import DataInsights from './components/Landingpage/components/DataInsights';
import Footer from './components/Landingpage/Footer';
import { DashboardProvider } from './components/Landingpage/components/DashboardContext';
import Badge from './components/Landingpage/Badge';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="absolute right-4 top-4">
        <Badge />
      </div>
      <main className="mx-auto max-w-7xl p-4 md:p-10">
        <Header />
        <ChallengeOverview />
        <DashboardProvider>
          <DataInsights />
        </DashboardProvider>
        <Footer />
      </main>
    </div>
  );
}