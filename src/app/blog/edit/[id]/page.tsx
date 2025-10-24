'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUIStore } from '@/store/uiStore';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

export default function EditPostPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const params = useParams();
  const postId = parseInt(params.id as string);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // Use Zustand for UI preferences
  const showPreview = useUIStore((state) => state.showPreview);
  const setShowPreview = useUIStore((state) => state.setShowPreview);

  // Fetch post
  const { data: post, isLoading } = trpc.post.getById.useQuery({ id: postId });

  // Fetch categories
  const { data: categories } = trpc.category.getAll.useQuery();

  // Update post mutation with optimistic update
  const updatePost = trpc.post.update.useMutation({
    onMutate: async (updatedPost) => {
      await utils.post.getById.cancel({ id: postId });
      await utils.post.getAll.cancel();
      
      const previousPost = utils.post.getById.getData({ id: postId });
      const previousPosts = utils.post.getAll.getData({ published: true, page: 1, limit: 9 });
      
      // Optimistically update the single post
      if (previousPost) {
        utils.post.getById.setData({ id: postId }, {
          ...previousPost,
          ...updatedPost,
          updatedAt: new Date(),
        });
      }
      
      return { previousPost, previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        utils.post.getById.setData({ id: postId }, context.previousPost);
      }
    },
    onSuccess: (data) => {
      router.push(`/blog/${data.slug}`);
    },
    onSettled: () => {
      utils.post.getById.invalidate({ id: postId });
      utils.post.getAll.invalidate();
    },
  });

  // Delete post mutation with optimistic update
  const deletePost = trpc.post.delete.useMutation({
    onMutate: async () => {
      await utils.post.getAll.cancel();
      
      const previousPosts = utils.post.getAll.getData({ published: true, page: 1, limit: 9 });
      
      if (previousPosts) {
        const updated = {
          ...previousPosts,
          items: previousPosts.items.filter((p) => p.id !== postId),
          total: previousPosts.total - 1,
        };
        utils.post.getAll.setData({ published: true, page: 1, limit: 9 }, updated);
      }
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        utils.post.getAll.setData({ published: true, page: 1, limit: 9 }, context.previousPosts);
      }
    },
    onSuccess: () => {
      router.push('/blog');
    },
    onSettled: () => {
      utils.post.getAll.invalidate();
      utils.post.getCounts.invalidate();
    },
  });

  // Load post data when available
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setAuthor(post.author || '');
      setContent(post.content);
      setPublished(post.published);
      setSelectedCategories(post.categoryIds || []);
      setCoverImageUrl(post.coverImageUrl || null);
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    updatePost.mutate({
      id: postId,
      title,
      author: author || undefined,
      content,
      published,
      categoryIds: selectedCategories,
      coverImageUrl: coverImageUrl || undefined,
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePost.mutate({ id: postId });
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/blog/${post.slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Post
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mt-4">Edit Post</h1>
          <p className="text-muted-foreground mt-2">
            Update your post content
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Post Editor</CardTitle>
                <CardDescription>Edit your post using Markdown</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter post title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {coverImageUrl && (
                      <div className="relative mt-2 rounded-lg h-48 border overflow-hidden">
                        <Image
                          src={coverImageUrl}
                          alt="Cover Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content * (Markdown supported)</Label>
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Write your post content here... Use the toolbar to format!"
                      rows={15}
                    />
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories?.map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant={
                            selectedCategories.includes(category.id)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Published Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Published
                    </Label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={updatePost.isPending}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updatePost.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showPreview ? 'Hide' : 'Show'}
                    </Button>
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deletePost.isPending}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletePost.isPending ? 'Deleting...' : 'Delete Post'}
                  </Button>

                  {(updatePost.isError || deletePost.isError) && (
                    <p className="text-sm text-red-500">
                      Error: {(updatePost.error || deletePost.error)?.message}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className={showPreview ? 'block' : 'hidden lg:block'}>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How your post will look</CardDescription>
              </CardHeader>
              <CardContent>
                <article className="space-y-4">
                  <h1 className="text-3xl font-bold">{title}</h1>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </article>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
