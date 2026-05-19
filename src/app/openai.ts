import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAI() {
  if (!client) {
    client = new OpenAI();
  }
  return client;
}
