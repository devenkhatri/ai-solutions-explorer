import Together from "together-ai";

const client = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

export async function runLLM(
  userPrompt: string,
  model: string,
  systemPrompt?: string,
) {
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: userPrompt });

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    // max_tokens: 4000,
  });

  const content = response.choices[0].message?.content;
  return content;
}