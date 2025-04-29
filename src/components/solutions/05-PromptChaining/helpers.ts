import assert from "node:assert";
import Together from "together-ai";

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
  assert(typeof content === "string");
  return content;
}