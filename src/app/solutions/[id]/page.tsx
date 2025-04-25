"use client";

import React from "react";
import {useParams} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

interface Solution {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

const mockSolutions: Solution[] = [
  {
    id: 1,
    name: "AI-Powered Automation",
    description: "Automate repetitive tasks using AI for increased efficiency.",
    tags: ["AI", "Automation", "Efficiency"],
  },
  {
    id: 2,
    name: "Cloud Migration Services",
    description: "Migrate your infrastructure to the cloud for scalability and cost savings.",
    tags: ["Cloud", "Migration", "Scalability"],
  },
  {
    id: 3,
    name: "Data Analytics Dashboard",
    description: "Visualize your data with an interactive dashboard for better insights.",
    tags: ["Data Analytics", "Dashboard", "Insights"],
  },
  {
    id: 4,
    name: "Cybersecurity Solutions",
    description: "Protect your business from cyber threats with our advanced security solutions.",
    tags: ["Cybersecurity", "Security"],
  },
  {
    id: 5,
    name: "Mobile App Development",
    description: "Develop native mobile apps for iOS and Android platforms.",
    tags: ["Mobile App", "Development"],
  },
  {
    id: 6,
    name: "DevOps Consulting",
    description: "Improve your software delivery pipeline with our DevOps consulting services.",
    tags: ["DevOps", "Consulting"],
  },
];

const SolutionDetailPage: React.FC = () => {
  const params = useParams();
  const solutionId = parseInt(params.id as string);

  const solution: Solution | undefined = mockSolutions.find((s) => s.id === solutionId);

  if (!solution) {
    return <div>Solution not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-card shadow-md rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{solution.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{solution.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {solution.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionDetailPage;
