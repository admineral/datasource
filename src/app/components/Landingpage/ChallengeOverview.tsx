import React from 'react';
import { FaChartBar, FaCalendarAlt, FaTrophy } from "react-icons/fa";
import Link from 'next/link';

interface OverviewCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function OverviewCard({ icon, title, description }: OverviewCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-4xl text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function ChallengeOverview() {
  return (
    <>
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Challenge Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OverviewCard 
            icon={<FaChartBar />}
            title="Forecast Sales"
            description="Predict future sales for various products using historical data and pricing information."
          />
          <OverviewCard 
            icon={<FaCalendarAlt />}
            title="Two-Phase Competition"
            description="Improve your model in Phase 1 with live feedback, then make final predictions in Phase 2."
          />
          <OverviewCard 
            icon={<FaTrophy />}
            title="Evaluation Metrics"
            description="Your predictions will be judged on accuracy (MAE%) and bias, combined into a final score."
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Challenge Details</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">What You&apos;ll Do</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Analyze historical sales and pricing data</li>
            <li>Develop a model to predict future sales for different products</li>
            <li>Adjust your predictions based on price changes</li>
            <li>Improve your model based on live feedback during Phase 1</li>
            <li>Make final predictions for Phase 2 using all available data</li>
          </ul>
          <h3 className="text-2xl font-semibold mt-6 mb-4">Evaluation Process</h3>
          <p>Your predictions will be evaluated based on:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Accuracy (MAE%): How close your predictions are to actual sales</li>
            <li>Bias: Whether your predictions consistently over or underestimate sales</li>
            <li>Final Score: A combination of accuracy and bias, with lower scores being better</li>
          </ul>
        </div>
      </section>

      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Take the Challenge?</h2>
        <p className="mb-6">Join now and put your data science skills to the test!</p>
        <Link href="https://www.datasource.ai/en/home/data-science-competitions-for-startups/vn1-forecasting-accuracy-challenge-phase-1/description" className="relative inline-flex group">
          <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
          <button className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900" role="button">
            Enter the Challenge
            <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
      </section>
    </>
  );
}