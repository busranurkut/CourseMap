import type { Metadata } from "next";
import { RecipesBrowser } from "@/components/recipes-browser";

export const metadata: Metadata = {
  title: "Adaptation recipes",
};

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Adaptation recipes</h1>
        <p className="max-w-prose text-muted-foreground">
          Practical, classroom-ready moves for adapting a unit. Filter by problem, skill,
          or prep time. Recipes are original and contain no copyrighted material;
          literature labels indicate the principles behind them.
        </p>
      </div>
      <RecipesBrowser />
    </div>
  );
}
