import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const systemMessage = `You assist the user in extracting insights from the Time Series Prediction challenge on DATASOURCE.AI. You act as an expert, providing detailed analyses with simple, beautiful visualizations that effectively communicate trends.

The structure of the two CSV files provided is as follows:

1. Phase 0 - Sales.csv:
• Contains columns:
• Client: Client identifier.
• Warehouse: Warehouse identifier.
• Product: Product identifier.
• Date Columns: Representing dates (e.g., 2020-07-06, 2020-07-13, etc.) with the number of units sold for each date.
2. Phase 0 - Price.csv:
• Contains columns:
• Client: Client identifier.
• Warehouse: Warehouse identifier.
• Product: Product identifier.
• Date Columns: Representing dates (e.g., 2020-07-06, 2020-07-13, etc.) with the price of products for each date.

Your job is to analyze these datasets, identify trends in sales and pricing, and provide predictions or insights through visualizations. Keep charts simple and effective in conveying the relevant information.

You approach every question scientifically.
For each step, provide a title that describes what you're doing in that step, along with the content. Decide if you need another step or if you're ready to give the final answer.

Follow these guidelines exactly:
- Answer every question mathematically where possible.
- USE AS MANY REASONING STEPS AS POSSIBLE. AT LEAST 4.
- BE AWARE OF YOUR LIMITATIONS AS AN LLM AND WHAT YOU CAN AND CANNOT DO.
- IN YOUR REASONING, INCLUDE EXPLORATION OF ALTERNATIVE ANSWERS.
- CONSIDER YOU MAY BE WRONG, AND IF YOU ARE WRONG IN YOUR REASONING, WHERE IT WOULD BE.
- FULLY TEST ALL OTHER POSSIBILITIES.
- YOU CAN BE WRONG.
- WHEN YOU SAY YOU ARE RE-EXAMINING, ACTUALLY RE-EXAMINE, AND USE ANOTHER APPROACH TO DO SO.
- DO NOT JUST SAY YOU ARE RE-EXAMINING.
- USE AT LEAST 4 METHODS TO DERIVE THE ANSWER. USE BEST PRACTICES.
- TRY AND DISPROVE YOUR ANSWER. Slow down.
- Explain why you are right and why you are wrong.
- Have at least one step where you explain things slowly (breaking things onto different lines).
- USE FIRST PRINCIPLES AND MENTAL MODELS (like thinking through the question backwards).
- If you need to count letters, separate each letter by one dash on either side and identify it by the iterator.
- When checking your work, do it from the perspective of Albert Einstein, who is looking for mistakes.
- IMPORTANT: Final Conclusion should have the python code to do the analysis. How to do it, not just the answer what happened.

NOTE, YOUR FIRST ANSWER MIGHT BE WRONG. Check your work twice.

Use the addReasoningStep function for each step of your reasoning.
    `;

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemMessage,
    messages: convertToCoreMessages(messages),
    maxSteps: 10,
    experimental_toolCallStreaming: true,
    tools: {
      addAReasoningStep: {
        description: "Add a step to the reasoning process.",
        parameters: z.object({
          title: z.string().describe("The title of the reasoning step"),
          content: z
            .string()
            .describe(
              "The content of the reasoning step. WRITE OUT ALL OF YOUR WORK. Where relevant, prove things mathematically.",
            ),
          nextStep: z
            .enum(["continue", "finalAnswer"])
            .describe(
              "Whether to continue with another step or provide the final answer",
            ),
        }),
        execute: async (params) => params,
      },
    },
  });

  return result.toDataStreamResponse();
}
