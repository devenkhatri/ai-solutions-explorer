"use client";

import React, {useState, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Search} from "lucide-react";
import Link from "next/link";
import solutionsData from './data/solutions.json';

interface Solution {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

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
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>(solutionsData);

  useEffect(() => {
    let results = solutionsData;

    if (searchTerm) {
      results = results.filter(
        (solution) =>
          solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solution.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!selectedTags.includes("All")) {
      results = results.filter((solution) =>
        selectedTags.some((tag) => solution.tags.includes(tag))
      );
    }

    setFilteredSolutions(results);
  }, [searchTerm, selectedTags]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prevTags) => {
      if (tag === "All") {
        return ["All"];
      } else {
        if (prevTags.includes(tag)) {
          const newTags = prevTags.filter((t) => t !== tag && t !== "All");
          return newTags.length === 0 ? ["All"] : newTags;
        } else {
          return prevTags[0] === "All" ? [tag] : [...prevTags, tag];
        }
      }
    });
  };

  const allTags = ["All", ...new Set(solutionsData.flatMap((solution) => solution.tags))];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center relative">
        <Input
          type="text"
          placeholder="Search solutions..."
          className="rounded-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-3 top-2.5 text-muted-foreground">
          <Search className="h-5 w-5"/>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              selectedTags.includes(tag)
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
