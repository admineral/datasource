"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const chatVersions = [
    { 
      title: "Chat Version 1", 
      link: "/chat",
      description: "Basic chat with an Assistant who has access to the CSV files and code interpreter."
    },
    { 
      title: "Chat Version 2", 
      link: "/chat2",
      description: "Assistant Chat with a function call connected to Recharts."
    },
    { 
      title: "Chat Version 3", 
      link: "/o1",
      description: "Reasoning with gpt4o"
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
        {chatVersions.map((chat, index) => (
          <Link key={index} href={chat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg flex flex-col justify-between h-full transition-transform duration-200"
            >
              <div>
                <div className="text-lg font-medium text-zinc-800 dark:text-zinc-300">
                  {chat.title}
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {chat.description}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}