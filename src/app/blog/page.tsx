'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { PostListItem, Paginated, Category } from '@/types';

type RecentPost = {
  id: number;
  title: string;
  slug: string;
  createdAt: Date | string;
  coverImageUrl: string | null;
  author: string | null;
};

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 9;

  // Debounce search with custom hook
  const debouncedSearch = useDebounce(search, 300);

  // Reset to first page when search or category filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategories]);
  
  // Fetch posts with caching optimizations
  const { data: paged, isLoading: postsLoading } = trpc.post.getAll.useQuery({
    published: true,
    categoryIds: selectedCategories.length ? selectedCategories : undefined,
    search: debouncedSearch.trim() ? debouncedSearch : undefined,
    page,
    limit,
  }, {
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const { data: recentPosts, isLoading: recentLoading } = trpc.post.getRecent.useQuery({ 
    limit: 4 
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes - recent posts don't change often
  });

  // Memoize computed values
  const featured = useMemo(() => recentPosts?.[0] as RecentPost | undefined, [recentPosts]);
  const otherRecent = useMemo(() => (recentPosts?.slice(1) as RecentPost[]) || [], [recentPosts]);
  const total = useMemo(() => (paged as Paginated<PostListItem> | undefined)?.total ?? 0, [paged]);
  const posts = useMemo(() => (paged as Paginated<PostListItem> | undefined)?.items ?? [], [paged]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  if (postsLoading || recentLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Loading skeleton for recent posts */}
            <div>
              <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                <div className="space-y-4">
                  <div className="h-80 bg-muted animate-pulse rounded-xl"></div>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Loading skeleton for all posts */}
            <div>
              <div className="h-10 w-48 bg-muted animate-pulse rounded-lg mb-6"></div>
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
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Blog - Multi-User Blogging Platform</title>
        <meta name="description" content="Read the latest posts on our multi-user blogging platform." />
        <meta property="og:title" content="Blog - Multi-User Blogging Platform" />
        <meta property="og:description" content="Read the latest posts on our multi-user blogging platform." />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="/blog" />
      </Head>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Recent blog posts */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900 dark:text-white">Recent blog posts</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Featured post */}
          <div>
            {featured ? (
              <div className="group cursor-pointer">
                <Link href={`/blog/${featured.slug}`}>
                  <div className="relative overflow-hidden rounded-xl mb-4 h-64 sm:h-80 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {featured.coverImageUrl && (
                      <Image
                        src={featured.coverImageUrl}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
                <p className="text-sm font-medium text-primary mb-2">
                  {featured.author && `${featured.author} • `}
                  {featured.createdAt ? new Date(featured.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                </p>
                <Link href={`/blog/${featured.slug}`} className="group/title">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover/title:text-primary transition-colors duration-200 flex items-start">
                    {featured.title}
                    <ArrowRight className="ml-2 mt-1.5 h-5 w-5 transform -rotate-45 group-hover/title:translate-x-1 group-hover/title:-translate-y-1 transition-transform duration-300" />
                  </h2>
                </Link>
              </div>
            ) : null}
          </div>
          {/* Other recent posts */}
          <div className="space-y-6">
            {otherRecent?.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <div className="group grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 -mx-4">
                  <div className="relative overflow-hidden rounded-lg col-span-1 h-40 sm:h-32 shadow-md">
                    {post.coverImageUrl && (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <p className="text-xs font-medium text-primary mb-2">
                      {post.author && `${post.author} • `}
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200 line-clamp-2">{post.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All blog posts */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">All blog posts</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder:text-gray-400"
              placeholder="Search posts by title, content, or author..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts && posts.length > 0 ? (
            posts.map((post: PostListItem) => (
              <div key={post.id} className="group cursor-pointer h-full">
                <Link href={`/blog/${post.slug}`}>
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
                </Link>
                <Link href={`/blog/${post.slug}`}>
                  <p className="text-sm font-medium text-primary mb-2">{post.author ?? ""} • {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <div className="flex items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200 flex-1 line-clamp-2">{post.title}</h2>
                    <ArrowRight className="ml-2 mt-1 h-5 w-5 text-gray-400 group-hover:text-primary transform -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm line-clamp-2">{post.content?.substring(0, 100)}...</p>
                </Link>
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
                      <Link key={cat.id} href={`/categories/${cat.slug}`}>
                        <span className={`${bg} text-xs font-medium px-2.5 py-1 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 transition-all duration-200 inline-block cursor-pointer`}>
                          {cat.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No posts found</h3>
                <p className="text-muted-foreground mb-6">
                  {search 
                    ? `We couldn't find any posts matching "${search}". Try adjusting your search.`
                    : "There are no published posts yet. Check back soon!"}
                </p>
                {search ? (
                  <Button variant="outline" onClick={() => setSearch("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Link href="/blog/new">
                    <Button>Create Your First Post</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        {/* Pagination controls */}
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
    </MainLayout>
  );
}
