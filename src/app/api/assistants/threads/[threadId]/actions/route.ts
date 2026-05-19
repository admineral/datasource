import { getOpenAI } from "@/app/openai";
import { NextRequest } from 'next/server';

// Send a new message to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const openai = getOpenAI();
  const { toolCallOutputs, runId } = await request.json();

  const stream = openai.beta.threads.runs.submitToolOutputsStream(runId, {
    thread_id: threadId,
    tool_outputs: toolCallOutputs,
    stream: true,
  });

  return new Response(stream.toReadableStream());
}
