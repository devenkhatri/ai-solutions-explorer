import Together from "together-ai";
import { Schema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const client = new Together({
  apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
});

export async function runLLM(userPrompt: string, model: string) {
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.7,
    // max_tokens: 4000,
  });

  const content = response.choices[0].message?.content;
  return content;
}

export async function jsonLLM<T>(
  userPrompt: string,
  schema: Schema<T>,
  systemPrompt?: string,
) {
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: userPrompt });

  const response = await client.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    messages,
    response_format: {
      type: "json_object",
      // @ts-expect-error Expected error
      schema: zodToJsonSchema(schema),
    },
  });

  const content = response.choices[0].message?.content;
  return schema.parse(JSON.parse(content));
}