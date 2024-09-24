import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="text-center mb-12">
      <h1 className="text-5xl font-bold mb-4">VN1 Forecasting - Accuracy Challenge</h1>
      <p className="text-xl mb-6">Enhance your predictive modeling skills in this exciting forecasting competition!</p>
      <div className="flex justify-center space-x-6 mb-6">
        <Link href="/Predict" className="group">
          <button className="relative overflow-hidden px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1" role="button">
            <span className="relative z-10">Start Predicting</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-out"></span>
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
        <Link href="/chat" className="group">
          <button className="relative overflow-hidden px-8 py-4 bg-purple-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:bg-purple-700 hover:shadow-lg hover:-translate-y-1" role="button">
            <span className="relative z-10">Chat with Data</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-out"></span>
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-out" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
      </div>
    </header>
  );
}