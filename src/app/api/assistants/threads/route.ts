import { getOpenAI } from "@/app/openai";

export const runtime = "nodejs";

// Create a new thread
export async function POST() {
  const openai = getOpenAI();
  const thread = await openai.beta.threads.create();
  return Response.json({ threadId: thread.id });
}
