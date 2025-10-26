'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, use } from 'react';
import type { PostListItem, Paginated, Category } from '@/types';
import { notFound } from 'next/navigation';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [page, setPage] = useState(1);
  const limit = 9;

  // Fetch all categories to find the one matching the slug
  const { data: categories } = trpc.category.getAll.useQuery();
  const category = categories?.find((c: Category) => c.slug === resolvedParams.slug);

  // Fetch posts filtered by this category
  const { data: paged, isLoading } = trpc.post.getAll.useQuery({
    published: true,
    categoryIds: category ? [category.id] : undefined,
    page,
    limit,
  }, {
    enabled: !!category, // Only fetch if category exists
  });

  // If categories loaded and category not found, show 404
  if (categories && !category) {
    notFound();
  }

  const total = (paged as Paginated<PostListItem> | undefined)?.total ?? 0;
  const posts = (paged as Paginated<PostListItem> | undefined)?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!category || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-56 bg-muted animate-pulse rounded-xl"></div>
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'post' : 'posts'} in this category
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? (
            posts.map((post: PostListItem) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <div className="group cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-xl mb-4 h-56 shadow-md hover:shadow-xl transition-shadow duration-300">
                    {post.coverImageUrl && (
                      <Image
                        alt={post.title}
                        src={post.coverImageUrl}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-primary mb-2">
                    {post.author ?? ""} • {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <div className="flex items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200 flex-1 line-clamp-2">
                      {post.title}
                    </h2>
                    <ArrowRight className="ml-2 mt-1 h-5 w-5 text-gray-400 group-hover:text-primary transform -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm line-clamp-2">
                    {post.content?.substring(0, 100)}...
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.categories?.map((cat: Category) => {
                      // Color coding by category name
                      let bg = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                      if (cat.name === "Design") bg = "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300";
                      else if (cat.name === "Research") bg = "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
                      else if (cat.name === "Presentation") bg = "bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300";
                      else if (cat.name === "Software Engineering") bg = "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300";
                      else if (cat.name === "Frameworks") bg = "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
                      else if (cat.name === "Product") bg = "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300";
                      else if (cat.name === "SaaS") bg = "bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300";
                      else if (cat.name === "Leadership") bg = "bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";
                      return (
                        <span key={cat.id} className={`${bg} text-xs font-medium px-2.5 py-1 rounded-full`}>
                          {cat.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  No posts yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  There are no published posts in this category yet. Check back soon!
                </p>
                <Link href="/blog">
                  <Button variant="outline">Browse All Posts</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-6 mt-16">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowRight className="rotate-180 h-4 w-4" /> Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
