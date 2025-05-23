"use client";

import React, { Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import solutionsData from '../../data/solutions.json';

interface Solution {
  id: number;
  name: string;
  description: string;
  tags: string[];
  component: string;
  image?: string;
  usecases?: string[];
}

const SolutionDetailPage = () => {
  const params = useParams<any>();
  const solutionId = parseInt(params.id);

  const solution = solutionsData.find((s) => s.id === solutionId);

  if (!solution) {
    return <div>Solution not found</div>;
  }

  const DynamicSolutionComponent = lazy(() => import(`@/components/solutions/${solution.component}`));


  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Loading solution...</div>}>
        <div className="mb-4">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span> / {solution.name}</span>
        </div>
        <Card className="bg-card shadow-md rounded-lg overflow-hidden">
          <CardHeader>
            {solution.image && <img src={solution.image} alt="Solution Image" className="w-full h-auto rounded-md" />}
            <CardTitle className="text-2xl font-semibold">{solution.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{solution.description}</CardDescription>
            <div>Use Cases:</div>
            {solution.usecases && solution.usecases.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                {solution.usecases.map((usecase, index) => (
                  <li key={index}>{usecase}</li>
                ))}
              </ul>
            )}
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {solution.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-4">
            <DynamicSolutionComponent />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
};

export default SolutionDetailPage;
