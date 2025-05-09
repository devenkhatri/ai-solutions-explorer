import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import dedent from "dedent";
import { jsonLLM, runLLM } from "./helpers";
import { z } from "zod";

const OrchestratorWorkers = () => {

  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function ORCHESTRATOR_PROMPT(task: string) {
    return dedent`
      Analyze this task and break it down into 2-3 distinct approaches:
  
      Task: ${task}
  
      Provide an Analysis:
  
      Explain your understanding of the task and which variations would be valuable.
      Focus on how each approach serves different aspects of the task.
  
      Along with the analysis, provide 2-3 approaches to tackle the task, each with a brief description:
  
      Formal style: Write technically and precisely, focusing on detailed specifications
      Conversational style: Write in a friendly and engaging way that connects with the reader
      Hybrid style: Tell a story that includes technical details, combining emotional elements with specifications
  
      Return only JSON output.
    `;
  }

  function WORKER_PROMPT(
    originalTask: string,
    taskType: string,
    taskDescription: string,
  ) {
    return dedent`
      Generate content based on:
      Task: ${originalTask}
      Style: ${taskType}
      Guidelines: ${taskDescription}
  
      Return only your response:
      [Your content here, maintaining the specified style and fully addressing requirements.]
    `;
  }

  const taskListSchema = z.object({
    analysis: z.string(),
    tasks: z.array(
      z.object({
        type: z.enum(["formal", "conversational", "hybrid"]),
        description: z.string(),
      }),
    ),
  });

  /*
  Use an orchestrator model to break down a task into sub-tasks,
  then use worker models to generate and return responses.
*/
  async function orchestratorWorkflow(
    originalTask: string,
    orchestratorPrompt: (task: string) => string,
    workerPrompt: (
      originalTask: string,
      taskType: string,
      taskDescription: string,
    ) => string,
  ) {
    // Use orchestrator model to break the task up into sub-tasks
    const { analysis, tasks } = await jsonLLM(
      orchestratorPrompt(originalTask),
      taskListSchema,
    );

    console.log(dedent`
    ## Analysis:
    ${analysis}

    ## Tasks:
  `);
    console.log("```json", JSON.stringify(tasks, null, 2), "\n```\n");

    const workerResponses = await Promise.all(
      tasks.map(async (task) => {
        const response = await runLLM(
          workerPrompt(originalTask, task.type, task.description),
          "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        );

        return { task, response };
      }),
    );

    return workerResponses;
  }


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (question.trim() === "") {
      setIsLoading(false);
      return;
    }

    const responseChain: any = [];
    try {
      const task = `Write a product description for a new eco-friendly water bottle. 
        The target_audience is environmentally conscious millennials and key product
        features are: plastic-free, insulated, lifetime warranty
      `;

      const workerResponses = await orchestratorWorkflow(
        task,
        ORCHESTRATOR_PROMPT,
        WORKER_PROMPT,
      );

      console.log(
        workerResponses
          .map((w) => `## WORKER RESULT (${w.task.type})\n${w.response}`)
          .join("\n\n"),
      );
      // const element = {
      //   title: `## Final Answer:`,
      //   response: answer,
      // }
      // responseChain.push(element);

      setResponses(responseChain);
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
            placeholder="Ask a question"
            className="flex-grow border border-gray-300 rounded-md p-2"
          />
          <Button
            type="submit"
            style={{ backgroundColor: "#008080" }}
            disabled={isLoading}
          >
            {isLoading ? <span>Loading...</span> : <span>Send</span>}
          </Button>
        </form>
      </div>
      <div className="space-y-4 output">
        {responses.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="mb-2">
              <label className="block font-semibold">
                {item.title}
              </label>
            </div>
            <label htmlFor={`answer-${index}`} className="block mb-2 font-semibold">
              Response {index + 1}:
            </label>
            <ReactMarkdown children={item.response} remarkPlugins={[remarkGfm]} />
          </div>
        ))}
        {!responses.length && <label htmlFor="answer" className="block mb-2">Chat Answer:</label>}
      </div>
    </div>
  );
};

export default OrchestratorWorkers;
