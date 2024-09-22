import React from 'react';
import { FaGithub, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex justify-center space-x-4 mt-12">
      <a href="https://github.com/admineral/datasource" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
        <FaGithub className="mr-2" />
        GitHub Repo
      </a>
      <a href="https://discord.gg/kf2vV5Shn7" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
        <FaDiscord className="mr-2" />
        Connect on Discord
      </a>
    </footer>
  );
}