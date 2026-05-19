"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import type { UIMessage } from "ai";
import { ReasoningStep } from "./reasoning-step";
import { type ReasoningStep as TReasoningStep } from "../lib/schema";

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export const Message = ({ message }: { message: UIMessage }) => {
  const content = getTextContent(message);
  const toolParts = message.parts.filter((part) =>
    part.type.startsWith("tool-"),
  );
  const hasToolParts = toolParts.length > 0;

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {!hasToolParts ? (
        <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
          {message.role === "assistant" ? <BotIcon /> : <UserIcon />}
        </div>
      ) : null}

      <div className="flex flex-col gap-6 w-full">
        {content ? (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        ) : null}

        {toolParts.map((part) => {
          if (
            part.type === "tool-addAReasoningStep" &&
            part.state === "output-available"
          ) {
            return (
              <ReasoningStep
                key={part.toolCallId}
                step={part.output as TReasoningStep}
              />
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
};
