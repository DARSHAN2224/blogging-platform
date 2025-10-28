"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { id: number; name: string; slug: string; description?: string | null };

export default function CategoriesPage() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.category.getAll.useQuery();

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setName("");
      setDescription("");
    },
  });

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setEditing(null);
    },
  });

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editing]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateCategory.mutate({ id: editing.id, name, description });
    } else {
      createCategory.mutate({ name, description });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            Categories
          </h1>
          <p className="text-muted-foreground mt-2">Create, edit, and delete categories to organize your posts.</p>
        </div>

        {/* Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editing ? "Edit Category" : "New Category"}</CardTitle>
            <CardDescription>
              {editing ? `Editing “${editing.name}”` : "Add a category to organize posts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                  {editing ? "Save changes" : "Create category"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Manage your categories</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : categories && categories.length ? (
              (categories as Category[]).map((cat) => (
                <div key={cat.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Slug: {cat.slug}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(cat)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCategory.mutate({ id: cat.id })}
                      disabled={deleteCategory.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No categories yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
