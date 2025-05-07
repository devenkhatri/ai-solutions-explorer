import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import dedent from "dedent";
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

  /*
  Run a parallel chain of LLM calls to address the `inputQuery` 
  using a list of models specified in `proposerModels`.

  Returns output from final aggregator model.
*/
  async function parallelWorkflow(
    inputQuery: string,
    proposerModels: string[],
    aggregatorModel: string,
    aggregatorSystemPrompt: string,
  ) {
    // Gather intermediate responses from proposer models
    const proposedResponses = await Promise.all(
      proposerModels.map((model) => runLLM(inputQuery, model)),
    );

    // Aggregate responses using an aggregator model
    const aggregatorSystemPromptWithResponses = dedent`
    ${aggregatorSystemPrompt}

    ${proposedResponses.map((response, i) => `${i + 1}. response`)}
  `;

    const finalOutput = await runLLM(
      inputQuery,
      aggregatorModel,
      aggregatorSystemPromptWithResponses,
    );

    return [finalOutput, proposedResponses];
  }

  const referenceModels = [
    "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    "meta-llama/Llama-Vision-Free",
    // "google/gemma-2-27b-it",
  ];

  const aggregatorModel = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";

  const aggregatorSystemPrompt = dedent`
    You have been provided with a set of responses from various
    open-source models to the latest user query. Your task is to
    synthesize these responses into a single, high-quality response.
    It is crucial to critically evaluate the information provided in
    these responses, recognizing that some of it may be biased or incorrect.
    Your response should not simply replicate the given answers but
    should offer a refined, accurate, and comprehensive reply to the
    instruction. Ensure your response is well-structured, coherent, and
    adheres to the highest standards of accuracy and reliability.
  
    Responses from models:
  `;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (question.trim() === "") {
      setIsLoading(false);
      return;
    }
    const [answer, intermediateResponses] = await parallelWorkflow(
      question.trim(),
      referenceModels,
      aggregatorModel,
      aggregatorSystemPrompt,
    );
    const responseChain: any = [];
    try {
      for (const response of intermediateResponses) {
        const element = {
          title: `## Intermediate Response: ${intermediateResponses.indexOf(response) + 1}`,
          response,
        }
        responseChain.push(element);
      }
      const element = {
        title: `## Final Answer:`,
        response: answer,
      }
      responseChain.push(element);

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

export default PromptChaining;
