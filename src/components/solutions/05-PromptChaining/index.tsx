import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import Image from 'next/image';
import solutionImage from './05PromptChaining.png'

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { runLLM } from "./helpers";


const PromptChaining = () => {

  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /*
  Run a serial chain of LLM calls to address the `inputQuery` 
  using a list of prompts specified in `promptChain`.
*/
  async function serialChainWorkflow(inputQuery: string, promptChain: string[]) {
    const responseChain: any = [];
    let response = inputQuery;

    for (const prompt of promptChain) {
      console.log(`Step ${promptChain.indexOf(prompt) + 1}`);

      response = await runLLM(
        `${prompt}\nInput:\n${response}`,
        "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      );
      console.log(`${response}\n`);
      const element = {
        prompt,
        response,
      }
      responseChain.push(element);
    }

    return responseChain;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const question1 =
      "Sally earns $12 an hour for babysitting. Yesterday, she just did 50 minutes of babysitting. How much did she earn?";

    const promptChain = [
      "Given the math problem, ONLY extract any relevant numerical information and how it can be used.",
      "Given the numberical information extracted, ONLY express the steps you would take to solve the problem.",
      "Given the steps, express the final answer to the problem.",
    ];

    if (question.trim() === "") {
      setIsLoading(false);
      return;
    }
    try {
      const apiresponse = await serialChainWorkflow(question, promptChain);

      setResponses(apiresponse);
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
            placeholder="Ask a mathematics question"
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
      <div className="space-y-4">
        {responses.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="mb-2">
              <label className="block font-semibold">
                Prompt {index + 1}:
              </label>
              <div className="border p-2 rounded">{item.prompt}</div>
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

export default PromptChaining;
