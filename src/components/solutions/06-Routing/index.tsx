import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Together from "together-ai";
import dedent from "dedent";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const Routing = () => {

  const client = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const prompts = [
    "Produce python snippet to check to see if a number is prime or not.",
    "Plan and provide a short itenary for a 2 week vacation in Europe.",
    "Write a short story about a dragon and a knight.",
  ];

  const modelRoutes = {
    "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free":
      "Best model choice for code generation tasks.",
    "meta-llama/Llama-Vision-Free":
      "Best model choice for story-telling, role-playing and fantasy tasks.",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free":
      "Best model for reasoning, planning and multi-step tasks",
  };

  const schema = z.object({
    route: z.enum(Object.keys(modelRoutes) as [keyof typeof modelRoutes]),
    reason: z.string(),
  });
  const jsonSchema = zodToJsonSchema(schema, {
    target: "openAi",
  });

  async function routerWorkflow(inputQuery: string, routes: { [key: string]: string }) {
    // const responseChain: any = [];

    const routerPrompt = dedent`
    Given a user prompt/query: ${inputQuery}, select the best option out of the following routes:

    ${Object.keys(routes)
        .map((key) => `${key}: ${routes[key]}`)
        .join("\n")}
    
    Answer only in JSON format.`;

    console.log("***** routerPrompt ", routerPrompt)

    // Call LLM to select route
    const routeResponse = await client.chat.completions.create({
      messages: [
        { role: "system", content: routerPrompt },
        { role: "user", content: inputQuery },
      ],
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      response_format: {
        type: "json_object",
        // @ts-expect-error Expected error
        schema: jsonSchema,
      },
    });

    const content = routeResponse.choices[0].message?.content;
    const selectedRoute = schema.parse(JSON.parse(content));
    console.log(`*** selectedRoute = ${JSON.stringify(selectedRoute)}\n`);

    // Use LLM on selected route.
    // Could also have different prompts that need to be used for each route.
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: inputQuery }],
      model: selectedRoute.route,
    });
    const responseContent = response.choices[0].message?.content;
    console.log(`${responseContent}\n`);
    const output = {
      selectedRoute: selectedRoute,
      response: responseContent
    }
    return output;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    console.log("=== Submit Triggered");
    event.preventDefault();
    setIsLoading(true);

    // if (question.trim() === "") {
    //   setIsLoading(false);
    //   return;
    // }
    const apiResponses: any = [];
    try {
      for (const prompt of prompts) {
        console.log(`Task ${prompts.indexOf(prompt) + 1}: ${prompt}`);
        console.log("====================");
        const apiresponse = await routerWorkflow(prompt, modelRoutes);
        const element = {
          prompt,
          output: apiresponse,
        }
        apiResponses.push(element);
        console.log("***** apiResponses ",apiResponses )
        setResponses(apiResponses);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResponses(['Error fetching response.']);
    }
  };

  return (
    <div className="p-0">
      {/* <h3 className="text-lg font-semibold mb-4">Basic Chat</h3> */}
      <div className="mb-4">
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="questionInput" className="block mb-2">
              Enter your question:
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            id="questionInput"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your tasks. (Seperated by newline)"
            className="flex-grow border border-gray-300 rounded-md p-2"
          />
          <Button
            type="button"
            onClick={handleSubmit}            
            style={{ backgroundColor: "#008080" }}
            disabled={isLoading}
          >
            {isLoading ? <span>Loading...</span> : <span>Send</span>}
          </Button>
        </form>
      </div>
      <div className="space-y-4">
        {responses.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="mb-2">
              <label className="block font-semibold">
                Prompt {index + 1}:
              </label>
              <div className="border p-2 rounded">{item.prompt}</div>
            </div>
            <div className="mb-2">
              <label className="block font-semibold">
                Selected Route {index + 1}:
              </label>
              <div className="border p-2 rounded">{item.output.selectedRoute.route}</div>
              <div className="border p-2 rounded">{item.output.selectedRoute.reason}</div>
            </div>
            <label htmlFor={`answer-${index}`} className="block mb-2 font-semibold">
              Response {index + 1}:
            </label>
            <ReactMarkdown children={item.output.response} remarkPlugins={[remarkGfm]} />
          </div>
        ))}
        {!responses.length && <label htmlFor="answer" className="block mb-2">Chat Answer:</label>}
      </div>
    </div>
  );
};

export default Routing;
