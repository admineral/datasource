"use client";

import React, { useState } from "react";
import styles from "./chat2.module.css"; // We'll create this new CSS module
import Chat from "../components/chat";
import ChartWidget from "@/app/components/chart-widget";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

interface ChartData {
  label: string;
  value: number;
}

const FunctionCalling = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [chartTitle, setChartTitle] = useState<string>('');

  const functionCallHandler = async (call: RequiredActionFunctionToolCall) => {
    if (call?.function?.name !== "render_chart") return;
    const args = JSON.parse(call.function.arguments);
    setChartData(args.data);
    setChartType(args.chartType);
    setChartTitle(args.title || '');
    return JSON.stringify({ success: true });
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.column}>
            <ChartWidget
              chartData={chartData}
              isEmpty={chartData.length === 0}
              isDarkTheme={true}
              chartType={chartType}
              title={chartTitle}
            />
          </div>
          <div className={styles.chatContainer}>
            <Chat functionCallHandler={(call) => functionCallHandler(call).then(result => result ?? '')} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FunctionCalling;