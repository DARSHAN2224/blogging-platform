'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUIStore } from '@/store/uiStore';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';


export default function NewPostPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // Use Zustand for UI preferences
  const showPreview = useUIStore((state) => state.showPreview);
  const setShowPreview = useUIStore((state) => state.setShowPreview);

  // Fetch categories
  const { data: categories } = trpc.category.getAll.useQuery();

  // Create post mutation with optimistic update
  const createPost = trpc.post.create.useMutation({
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await utils.post.getAll.cancel();
      
      // Snapshot previous value
      const previousPosts = utils.post.getAll.getData({ published: true, page: 1, limit: 9 });
      
      // Optimistically add new post (temporary ID)
      if (previousPosts && newPost.published) {
        type OptimisticPost = {
          id: number;
          title: string;
          slug: string;
          content: string;
          author: string | null;
          coverImageUrl: string | null;
          published: boolean;
          createdAt: Date;
          updatedAt: Date;
          categories: never[];
        };
        const optimisticPost: OptimisticPost = {
          id: Date.now(), // temporary ID
          title: newPost.title,
          slug: newPost.title.toLowerCase().replace(/\s+/g, '-'),
          content: newPost.content,
          author: newPost.author || null,
          coverImageUrl: newPost.coverImageUrl || null,
          published: newPost.published,
          createdAt: new Date(),
          updatedAt: new Date(),
          categories: [],
        };
        
        const updated = {
          ...previousPosts,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: [optimisticPost as any, ...previousPosts.items],
          total: previousPosts.total + 1,
        };
        utils.post.getAll.setData({ published: true, page: 1, limit: 9 }, updated);
      }
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        utils.post.getAll.setData({ published: true, page: 1, limit: 9 }, context.previousPosts);
      }
    },
    onSuccess: (data) => {
      router.push(`/blog/${data.slug}`);
    },
    onSettled: () => {
      utils.post.getAll.invalidate();
      utils.post.getCounts.invalidate();
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImageUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    createPost.mutate({
      title,
      author: author || undefined,
      content,
      published,
      categoryIds: selectedCategories,
      coverImageUrl: coverImageUrl || undefined,
    });
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mt-4">Create New Post</h1>
          <p className="text-muted-foreground mt-2">
            Share your thoughts with the world
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Post Editor</CardTitle>
                <CardDescription>Write your post using Markdown</CardDescription>
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
                      Publish immediately
                    </Label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={createPost.isPending}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createPost.isPending ? 'Creating...' : 'Create Post'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                  </div>

                  {createPost.isError && (
                    <p className="text-sm text-red-500">
                      Error: {createPost.error.message}
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
                  {coverImageUrl && (
                    <div className="relative rounded-lg h-56 border overflow-hidden">
                      <Image
                        src={coverImageUrl}
                        alt="Cover Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold">
                    {title || 'Your Post Title'}
                  </h1>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Your content will appear here...
                      </p>
                    )}
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
