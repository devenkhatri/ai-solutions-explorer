"use client";

import React, {useState, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Search} from "lucide-react";
import Link from "next/link";
import solutionsData from '../../data/solutions.json';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

    if (selectedTag) {
      results = results.filter((solution) => solution.tags.includes(selectedTag));
    }

    setFilteredSolutions(results);
  }, [searchTerm, selectedTag]);

  const handleTagClick = (tag: string) => {
    setSelectedTag((prevTag) => (prevTag === tag ? null : tag));
  };

  const allTags = [...new Set(solutionsData.flatMap((solution) => solution.tags))];

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
