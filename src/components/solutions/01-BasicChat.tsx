import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Together from "together-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BasicChat = () => {
  const together = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/Llama-3.3-70B-Instruct-Turbo-Free");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (question.trim() === "") {
      setIsLoading(false);
      return;
    }
    setChatHistory((prevHistory) => [...prevHistory, `user:${question}`]);
    try {
      const apiresponse = await together.chat.completions.create({
        messages: [{ role: "user", content: question }],      
        model: selectedModel,
      });
      console.log("******* apiresponse",apiresponse);
      const response = apiresponse.choices[0].message.content;
      setChatHistory((prevHistory) => [
        ...prevHistory,
        `ai:${response}`,
      ]);
      setResponse(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error fetching response.');
    }
  };
  const models = [
    "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
  ];

  return (
    <div className="p-0">
      {/* <h3 className="text-lg font-semibold mb-4">Basic Chat</h3> */}
      <div className="mb-4">
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="questionInput" className="block mb-2">
              Select the model:
            </label>
          </div>
        </div>
        <div className="flex space-x-2 mb-4">
          <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="questionInput" className="block mb-2">
              Enter your question:
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            id="questionInput"
            type="text"
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
      <div className="mb-4">
        <label htmlFor="answer" className="block mb-2">Chat Answer:</label>
        {response &&
          <div
            id="answer"
            className="space-y-2 p-2 border border-gray-300 rounded-md"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          </div>
        }
        {/* {chatHistory.map((message, index) => {
          const [sender, msg] = message.split(":");
          return (
            <div
              key={index}
              className={`p-2 rounded-md ${sender === "user" ? "bg-gray-100 text-right ml-auto w-fit" : "bg-gray-200 w-fit"
                }`}
            >
              {msg}
            </div>
          );
        })} */}
      </div>
    </div>
  );
};

export default BasicChat;
