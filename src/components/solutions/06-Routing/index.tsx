import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { useToast } from "@/hooks/use-toast"; // Import useToast

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Together from "together-ai";
import dedent from "dedent";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const Routing = () => {
  const { toast } = useToast(); // Get the toast function

  const client = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<any[]>([]); // Specify type for responses
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompts, setPrompts] = useState<string[]>([]); // Specify type for prompts

  const prompts123 = [
    "Produce python snippet to check to see if a number is prime or not.",
    "Plan and provide a short itenary for a 2 week vacation in Europe.",
    "Write a short story about a dragon and a knight.",
  ];

  const modelRoutes: { [key: string]: string } = { // Add type annotation
    "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free":
      "Best model choice for code generation tasks.",
    "meta-llama/Llama-Vision-Free":
      "Best model choice for story-telling, role-playing and fantasy tasks.",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free":
      "Best model for reasoning, planning and multi-step tasks",
  };

  const schema = z.object({
    route: z.enum(Object.keys(modelRoutes) as [keyof typeof modelRoutes, ...(keyof typeof modelRoutes)[]]), // Ensure non-empty enum
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
        // @ts-expect-error Expected error - TogetherAI might not support schema strictly
        schema: jsonSchema,
      },
    });

    const content = routeResponse.choices[0].message?.content;
    if (!content) {
        throw new Error("Failed to get routing decision from LLM.");
    }
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
      response: responseContent || "No response content received." // Handle undefined response
    }
    return output;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    console.log("=== Submit Triggered");
    event.preventDefault();


    if (!question.trim()) {
      // Display user message to input before submitting
      toast({
        title: "Input Required",
        description: "Please enter your tasks before submitting.",
        variant: "destructive",
      });
      setIsLoading(false); // Ensure loading state is reset
      return;
    }

    setIsLoading(true);

    const tasks = question.split(/[\r\n]+/).filter(task => task.trim() !== ''); // Filter out empty lines
    setPrompts(tasks);

    const apiResponses: any[] = []; // Initialize as empty array
    try {
      for (const taskPrompt of tasks) { // Renamed variable to avoid conflict with useState prompt
        console.log(`Task ${tasks.indexOf(taskPrompt) + 1}: ${taskPrompt}`);
        console.log("====================");
        const apiresponse = await routerWorkflow(taskPrompt, modelRoutes);
        const element = {
          prompt: taskPrompt, // Use the correct prompt variable
          output: apiresponse,
        }
        apiResponses.push(element);
        console.log("***** apiResponses ", apiResponses)
        // Update state incrementally if needed, or wait until the loop finishes
        // setResponses([...apiResponses]); // Example of incremental update
      }
      setResponses(apiResponses); // Set final responses after loop completes
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `An error occurred while processing your request: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      // Optionally clear responses or show partial results based on requirements
      setResponses([]); // Clear responses on error
      setIsLoading(false);
    }
  };

  return (
    <div className="p-0">
      {/* <h3 className="text-lg font-semibold mb-4">Basic Chat</h3> */}
      <div className="mb-4">
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="questionInput" className="block mb-2">
              Enter your tasks (one per line):
            </label>
          </div>
        </div>
        <Textarea
          id="questionInput"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your tasks, separated by newlines (e.g., 'Write a poem about the sea\nTranslate 'hello' to Spanish')"
          className="flex-grow border border-input rounded-md p-2 mb-2" // Added mb-2 for spacing
        />
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90" // Use theme colors
          disabled={isLoading}
        >
          {isLoading ? <span>Loading...</span> : <span>Send</span>}
        </Button>
      </div>
      <div className="space-y-4">
        {prompts.length > 0 && (
            <>
                <label className="block font-semibold mb-2">Tasks Submitted:</label>
                <ul className="list-disc list-inside pl-4 mb-4 border p-2 rounded bg-muted/50">
                {prompts.map((promptText, index) => (
                    <li key={index} className="mb-1">
                    {promptText}
                    </li>
                ))}
                </ul>
            </>
        )}

        {responses.map((item, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
            <div className="mb-2">
              <label className="block font-semibold text-sm text-muted-foreground">
                Task {index + 1}:
              </label>
              <div className="border p-2 rounded bg-secondary/50 text-sm">{item.prompt}</div>
            </div>
            <div className="mb-2">
              <label className="block font-semibold text-sm text-muted-foreground">
                Selected Route:
              </label>
              <div className="border p-2 rounded bg-secondary/50 text-sm">
                <p><strong>Model:</strong> {item.output.selectedRoute.route}</p>
                <p><strong>Reason:</strong> {item.output.selectedRoute.reason}</p>
              </div>
            </div>
            <label htmlFor={`answer-${index}`} className="block mb-1 font-semibold text-sm text-muted-foreground">
              Response:
            </label>
             <div className="prose prose-sm max-w-none border p-3 rounded bg-card">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.output.response}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Routing;
