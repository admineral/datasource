import { openai } from "@/app/openai";

export const runtime = "nodejs";


// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant.",
    name: "Data Visualization Assistant",
    model: "chatgpt-4o-latest",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "render_chart",
          description: "Render a chart based on provided data",
          parameters: {
            type: "object",
            properties: {
              chartType: {
                type: "string",
                enum: ["bar", "line", "pie"],
                description: "The type of chart to render",
              },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    value: { type: "number" },
                  },
                },
                description: "Array of data points for the chart",
              },
              title: {
                type: "string",
                description: "Title of the chart",
              },
            },
            required: ["chartType", "data"],
          },
        },
      },
      { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
