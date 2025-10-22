"use client";

import { useMemo, useState, memo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export interface CategoryFilterProps {
  selected: number[];
  onChange: (ids: number[]) => void;
}

export const CategoryFilter = memo(function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = trpc.category.getAll.useQuery();
  const [query, setQuery] = useState("");

  const filtered: Category[] = useMemo(() => {
    if (!categories) return [] as Category[];
    const q = query.trim().toLowerCase();
    if (!q) return categories as unknown as Category[];
    return (categories as unknown as Category[]).filter((c) =>
      `${c.name} ${c.slug}`.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clearAll = () => onChange([]);

  const selectedCategories = useMemo(() => {
    if (!categories) return [];
    return selected
      .map((id) => categories.find((c: Category) => c.id === id))
      .filter(Boolean) as Category[];
  }, [selected, categories]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        {selected.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((c: Category) => (
            <Badge key={c.id} variant="secondary" className="flex items-center gap-1">
              {c.name}
              <button
                aria-label={`Remove ${c.name}`}
                onClick={() => toggle(c.id)}
                className="ml-1 inline-flex"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selected.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={clearAll}
        >
          All Posts
        </Button>
        {isLoading ? (
          <span className="text-sm text-muted-foreground">Loading categories…</span>
        ) : (
          filtered.map((c) => (
            <Button
              key={c.id}
              variant={selected.includes(c.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </Button>
          ))
        )}
      </div>
    </div>
  );
});
