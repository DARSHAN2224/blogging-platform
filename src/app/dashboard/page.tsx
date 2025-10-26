'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FolderOpen, 
  Edit, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock,
  PlusCircle,
  ArrowRight,
  Grid3x3,
  List
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { PostWithCategories } from '@/types';

export default function DashboardPage() {
  const utils = trpc.useUtils();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 12;

  // Fetch posts (paginated); dashboard shows summary from first page, counts come from getCounts
  const { data: postsPaged, isLoading: postsLoading } = trpc.post.getAll.useQuery({ page, limit });
  const { data: counts } = trpc.post.getCounts.useQuery();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = trpc.category.getAll.useQuery();

  // Toggle published mutation with optimistic update
  const togglePublished = trpc.post.togglePublished.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.post.getAll.cancel();
      await utils.post.getCounts.cancel();
      
      // Snapshot previous value
      const previousPosts = utils.post.getAll.getData({ page, limit });
      const previousCounts = utils.post.getCounts.getData();
      
      // Optimistically update
      if (previousPosts) {
        const updated = {
          ...previousPosts,
          items: previousPosts.items.map((post: PostWithCategories) =>
            post.id === id ? { ...post, published: !post.published } : post
          ),
        };
        utils.post.getAll.setData({ page, limit }, updated);
      }
      
      return { previousPosts, previousCounts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        utils.post.getAll.setData({ page, limit }, context.previousPosts);
      }
      if (context?.previousCounts) {
        utils.post.getCounts.setData(undefined, context.previousCounts);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      utils.post.getAll.invalidate();
      utils.post.getCounts.invalidate();
    },
  });

  // Delete post mutation with optimistic update
  const deletePost = trpc.post.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.post.getAll.cancel();
      await utils.post.getCounts.cancel();
      
      const previousPosts = utils.post.getAll.getData({ page, limit });
      const previousCounts = utils.post.getCounts.getData();
      
      // Optimistically remove post
      if (previousPosts) {
        const updated = {
          ...previousPosts,
          items: previousPosts.items.filter((post: PostWithCategories) => post.id !== id),
          total: previousPosts.total - 1,
        };
        utils.post.getAll.setData({ page, limit }, updated);
      }
      
      return { previousPosts, previousCounts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        utils.post.getAll.setData({ page, limit }, context.previousPosts);
      }
      if (context?.previousCounts) {
        utils.post.getCounts.setData(undefined, context.previousCounts);
      }
    },
    onSettled: () => {
      utils.post.getAll.invalidate();
      utils.post.getCounts.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const handleTogglePublished = (id: number) => {
    togglePublished.mutate({ id });
  };

  const handleDelete = (id: number) => {
    if (deleteConfirmId === id) {
      deletePost.mutate({ id });
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const allPosts = (postsPaged?.items as PostWithCategories[]) || [];
  const publishedPosts = allPosts.filter((p) => p.published);
  const draftPosts = allPosts.filter((p) => !p.published);
  const total = postsPaged?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (postsLoading || categoriesLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and categories
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-3xl">{(counts?.total ?? postsPaged?.total) || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {counts?.published ?? publishedPosts.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {counts?.draft ?? draftPosts.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-3xl">{categories?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/blog/new">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Post
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" size="lg">
              <FolderOpen className="mr-2 h-5 w-5" />
              Manage Categories
            </Button>
          </Link>
        </div>

        {/* Posts List */}
        <div className="space-y-8">
          {/* All Posts Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                All Posts ({total})
              </h2>
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
            
            {allPosts.length > 0 ? (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPosts.map((post) => (
                      <Card 
                        key={post.id} 
                        className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col h-full">
                            <div className="flex-1 mb-4">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                  {post.title}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={post.published 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 shrink-0" 
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 shrink-0"}
                                >
                                  {post.published ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                  {post.published ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {new Date(post.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </p>
                              {post.categories && post.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.categories.slice(0, 2).map((cat) => (
                                    <Badge key={cat.id} variant="outline" className="text-xs">
                                      {cat.name}
                                    </Badge>
                                  ))}
                                  {post.categories.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{post.categories.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t">
                              <Link href={`/blog/${post.slug}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/blog/edit/${post.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePublished(post.id)}
                                disabled={togglePublished.isPending}
                                title={post.published ? "Unpublish" : "Publish"}
                              >
                                {post.published ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant={deleteConfirmId === post.id ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                disabled={deletePost.isPending}
                                title={deleteConfirmId === post.id ? "Click again to confirm" : "Delete"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {allPosts.map((post) => (
                      <Card key={post.id} className="group hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors duration-200">
                                  {post.title}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={post.published 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 shrink-0" 
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 shrink-0"}
                                >
                                  {post.published ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                  {post.published ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                                {post.categories && post.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {post.categories.slice(0, 3).map((cat) => (
                                      <Badge key={cat.id} variant="outline" className="text-xs">
                                        {cat.name}
                                      </Badge>
                                    ))}
                                    {post.categories.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{post.categories.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Link href={`/blog/${post.slug}`}>
                                <Button variant="outline" size="sm" title="View post">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/blog/edit/${post.id}`}>
                                <Button variant="outline" size="sm" title="Edit post">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePublished(post.id)}
                                disabled={togglePublished.isPending}
                                title={post.published ? "Unpublish" : "Publish"}
                              >
                                {post.published ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant={deleteConfirmId === post.id ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                disabled={deletePost.isPending}
                                title={deleteConfirmId === post.id ? "Click again to confirm" : "Delete"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No posts yet. Create your first post to get started!</p>
                <Link href="/blog/new">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
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

        {/* Categories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Categories
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {categories?.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
