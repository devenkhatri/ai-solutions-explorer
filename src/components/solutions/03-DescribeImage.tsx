import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Together from "together-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DescribeImage = () => {
  const together = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  });

  const [imageURL, setImageURL] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (imageURL.trim() === "") {
      setIsLoading(false);
      return;
    }
    try {
      const apiresponse = await together.chat.completions.create({
        messages: [
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Describe the image whose URL is passed. The description should be very detailed, so that it can be passed as a prompt to any ai-based image generation tool, to create variations of this image",
              },
              {
                type: "image_url",
                image_url: {url: imageURL},
              }
            ],
          }
        ],      
        model: "meta-llama/Llama-Vision-Free",
      });
      console.log("******* apiresponse",apiresponse);
      const response = apiresponse.choices[0].message.content;
      setResponse(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error fetching response.');
    }
  };

  return (
    <div className="p-4">
      {/* <h3 className="text-lg font-semibold mb-4">Basic Chat</h3> */}
      <div className="mb-4">        
        <div className="flex justify-between space-x-4">
          <div>
            <label htmlFor="imageRefUrl" className="block mb-2">
              Enter the URL of the reference image:
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            id="imageRefUrl"
            type="text"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            placeholder="Reference Image URL"
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
        <label htmlFor="answer" className="block mb-2">AI Output:</label>
        {response &&
          <div
            id="answer"
            className="space-y-2 p-2 border border-gray-300 rounded-md"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          </div>
        }
      </div>
    </div>
  );
};

export default DescribeImage;
