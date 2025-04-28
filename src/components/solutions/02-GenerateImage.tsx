import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import Together from "together-ai";


const GenerateImage = () => {
  const together = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(""); 
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (question.trim() === "") {
      setIsLoading(false);
      return;
    }
    try {
      const apiresponse = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: question.trim(),
        steps: 4,
        n: 4
      });
      console.log("******* apiresponse", apiresponse);
      const response = apiresponse.data[0].url;
      setResponse(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error fetching response.');
    }
  };

  return (
    <div className="p-0">
      {/* <h3 className="text-lg font-semibold mb-4">Basic Chat</h3> */}
      <div className="mb-4">
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="questionInput" className="block mb-2">
              Enter the prompt:
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
      <div className="mb-4">
        <label htmlFor="answer" className="block mb-2">Output Image:</label>
        {response &&
          <div
            id="answer"
            className="space-y-2 p-2 border border-gray-300 rounded-md"
          >
            <img src={response} />
          </div>
        }
      </div>
    </div>
  );
};

export default GenerateImage;
