"use client";

import React from 'react';
import Header from './components/Landingpage/Header';
import ChallengeOverview from './components/Landingpage/ChallengeOverview';
import DataInsights from './components/Landingpage/components/DataInsights';
import Footer from './components/Landingpage/Footer';
import { DashboardProvider } from './components/Landingpage/components/DashboardContext';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
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