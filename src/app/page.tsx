"use client";

import React, {useState, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Search} from "lucide-react";
import Link from "next/link";

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

const SolutionCard: React.FC<{solution: Solution}> = ({solution}) => {
  return (
    <Card className="bg-card shadow-md rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <Link href={`/solutions/${solution.id}`}>{solution.name}</Link>
        </CardTitle>
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
  );
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>(mockSolutions);

  useEffect(() => {
    let results = mockSolutions;

    if (searchTerm) {
      results = results.filter(
        (solution) =>
          solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solution.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      results = results.filter((solution) => solution.tags.includes(selectedTag));
    }

    setFilteredSolutions(results);
  }, [searchTerm, selectedTag]);

  const handleTagClick = (tag: string) => {
    setSelectedTag((prevTag) => (prevTag === tag ? null : tag));
  };

  const allTags = [...new Set(mockSolutions.flatMap((solution) => solution.tags))];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solution Explorer</h1>

      <div className="mb-4 flex items-center relative">
        <Input
          type="text"
          placeholder="Search solutions..."
          className="rounded-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-3.5 top-2.5 text-muted-foreground">
          <Search className="h-5 w-5"/>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              selectedTag === tag
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSolutions.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>
    </div>
  );
}
