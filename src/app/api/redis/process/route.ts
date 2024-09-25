import { NextRequest } from 'next/server';
import { ReadableStream } from 'web-streams-polyfill';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // We're not in a browser, so this is likely during build or server-side
    return new Response(JSON.stringify({ message: 'CSV processing is not available during build time' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Function to send progress messages to the client
      const sendProgress = (message: string) => {
        controller.enqueue(`data: ${message}\n\n`);
      };

      // Dynamically import and run the CSV processing logic
      import('./processCSV').then(({ processCSVFiles }) => {
        processCSVFiles(sendProgress)
          .then(() => {
            controller.enqueue(`data: Successfully processed CSV files and stored data in Redis\n\n`);
            controller.close();
          })
          .catch((error) => {
            console.error('Error processing CSV files:', error);
            if (error instanceof Error) {
              controller.enqueue(`data: Error processing CSV files: ${error.message}\n\n`);
            } else {
              controller.enqueue(`data: Error processing CSV files: Unknown error\n\n`);
            }
            controller.close();
          });
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}